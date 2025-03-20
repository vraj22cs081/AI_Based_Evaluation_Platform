const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');
const authMiddleware = require('../middleware/auth.middleware');
const Assignment = require('../models/assignment');
const { sendSubmissionConfirmation } = require('../utils/emailService');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToFirebase, deleteFromFirebase } = require('../utils/firebaseStorage');

// Configure multer for memory storage (for Firebase uploads)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

router.get('/classrooms/enrolled', authMiddleware('Student'), async (req, res) => {
    try {
        const studentId = req.user._id;
        
        const enrolledClassrooms = await Classroom.find({
            students: studentId
        }).populate('faculty', 'name email');

        res.json({
            success: true,
            classrooms: enrolledClassrooms
        });
    } catch (error) {
        console.error('Error fetching enrolled classrooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enrolled classrooms'
        });
    }
});

// Join classroom
router.post('/classrooms/join', authMiddleware('Student'), async (req, res) => {
    try {
        const { roomCode } = req.body;
        const studentId = req.user._id;

        // Find classroom with the given room code
        const classroom = await Classroom.findOne({ roomCode });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Invalid room code'
            });
        }

        // Check if student is already enrolled
        if (classroom.students.includes(studentId)) {
            return res.status(400).json({
                success: false,
                message: 'Already enrolled in this classroom'
            });
        }

        // Add student to classroom
        classroom.students.push(studentId);
        await classroom.save();

        res.json({
            success: true,
            message: 'Successfully joined classroom',
            classroom
        });
    } catch (error) {
        console.error('Error joining classroom:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to join classroom'
        });
    }
});

// Get classroom details
router.get('/classrooms/:classroomId', authMiddleware('Student'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const studentId = req.user._id;

        const classroom = await Classroom.findOne({
            _id: classroomId,
            students: studentId
        }).populate('faculty', 'name email');

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or access denied'
            });
        }

        res.json({
            success: true,
            classroom
        });
    } catch (error) {
        console.error('Error fetching classroom details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch classroom details'
        });
    }
});

// Get assignments for a classroom
router.get('/classrooms/:classroomId/assignments', authMiddleware('Student'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const studentId = req.user._id;

        // Verify student is enrolled in classroom
        const classroom = await Classroom.findOne({
            _id: classroomId,
            students: studentId
        });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or not enrolled'
            });
        }

        const assignments = await Assignment.find({ classroom: classroomId })
            .populate('createdBy', 'name');

        // Add submission status for each assignment
        const assignmentsWithStatus = assignments.map(assignment => {
            const submission = assignment.submissions.find(
                sub => sub.student.toString() === studentId.toString()
            );
            return {
                ...assignment.toObject(),
                submitted: !!submission,
                submission: submission || null
            };
        });

        res.json({
            success: true,
            assignments: assignmentsWithStatus
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignments'
        });
    }
});

// File upload route - Updated to use Firebase
router.post('/upload', authMiddleware('Student'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload to Firebase instead of local storage
        console.log('Uploading file to Firebase:', req.file.originalname);
        const result = await uploadToFirebase(req.file, 'submissions');
        console.log('File uploaded to Firebase:', result);

        res.json({
            success: true,
            fileUrl: result.fileUrl,
            filePath: result.path,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file'
        });
    }
});

// Submit assignment route - Updated to use Firebase
router.post('/assignments/:assignmentId/submit', authMiddleware('Student'), upload.single('file'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user._id;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const assignment = await Assignment.findById(assignmentId)
            .populate('classroom', 'name')
            .populate('createdBy', 'email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check submission deadline
        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({
                success: false,
                message: 'Assignment submission deadline has passed'
            });
        }

        // Upload to Firebase
        console.log('Uploading submission to Firebase:', req.file.originalname);
        const result = await uploadToFirebase(req.file, 'submissions');
        console.log('Submission uploaded to Firebase:', result);

        // Update or create submission
        const submissionIndex = assignment.submissions.findIndex(
            sub => sub.student.toString() === studentId.toString()
        );

        if (submissionIndex > -1) {
            // Check if there's a previous submission to clean up
            if (assignment.submissions[submissionIndex].filePath) {
                console.log('Deleting previous submission:', assignment.submissions[submissionIndex].filePath);
                try {
                    await deleteFromFirebase(assignment.submissions[submissionIndex].filePath);
                } catch (deleteError) {
                    console.error('Error deleting previous submission:', deleteError);
                    // Continue with the update even if delete fails
                }
            }
            
            // Update existing submission
            assignment.submissions[submissionIndex].submissionUrl = result.fileUrl;
            assignment.submissions[submissionIndex].filePath = result.path;
            assignment.submissions[submissionIndex].submittedAt = new Date();
        } else {
            // Create new submission
            assignment.submissions.push({
                student: studentId,
                submissionUrl: result.fileUrl,
                filePath: result.path,
                submittedAt: new Date()
            });
        }

        await assignment.save();

        // Get student information for notification
        const student = await User.findById(studentId);
        
        // Send email notification if the function exists
        try {
            if (typeof sendSubmissionConfirmation === 'function') {
                await sendSubmissionConfirmation(
                    student.email,
                    student.name,
                    assignment.title,
                    assignment.classroom.name
                );
            }
        } catch (emailError) {
            console.error('Error sending submission confirmation email:', emailError);
            // Continue without failing the submission
        }

        res.json({
            success: true,
            message: 'Assignment submitted successfully',
            submission: {
                submissionUrl: result.fileUrl,
                submittedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit assignment'
        });
    }
});

// Get assignment details with submission
router.get('/assignments/:assignmentId', authMiddleware('Student'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user._id;

        const assignment = await Assignment.findById(assignmentId)
            .populate('classroom', 'name')
            .populate('createdBy', 'name');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if student is enrolled in the classroom
        const classroom = await Classroom.findById(assignment.classroom);
        
        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found'
            });
        }

        // Check if the classroom has a students array
        if (!classroom.students || !Array.isArray(classroom.students)) {
            console.log('Classroom has no students array:', classroom);
            return res.status(400).json({
                success: false,
                message: 'Invalid classroom structure'
            });
        }

        // Safely check if student is enrolled
        const isEnrolled = classroom.students.some(student => {
            // Check if student object and student property are defined
            return student && student.student && student.student.toString() === studentId.toString();
        });

        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled in this classroom'
            });
        }

        // Safely find student's submission
        let submission = null;
        if (assignment.submissions && Array.isArray(assignment.submissions)) {
            submission = assignment.submissions.find(sub => 
                sub && sub.student && sub.student.toString() === studentId.toString()
            );
        }

        // Format response
        const formattedAssignment = {
            _id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxMarks: assignment.maxMarks,
            assignmentFile: assignment.assignmentFile,
            classroom: assignment.classroom,
            createdBy: assignment.createdBy,
            createdAt: assignment.createdAt,
            hasSubmitted: !!submission,
            submission: submission ? {
                submissionUrl: submission.submissionUrl,
                submittedAt: submission.submittedAt,
                grade: submission.grade,
                feedback: submission.feedback
            } : null
        };

        res.json({
            success: true,
            assignment: formattedAssignment
        });
    } catch (error) {
        console.error('Error fetching assignment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch assignment'
        });
    }
});

// Add exit classroom route
router.post('/classrooms/:classroomId/exit', authMiddleware('Student'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const studentId = req.user._id;

        // Find the classroom and remove the student
        const classroom = await Classroom.findByIdAndUpdate(
            classroomId,
            {
                $pull: { students: studentId }
            },
            { new: true }
        );

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found'
            });
        }

        res.json({
            success: true,
            message: 'Successfully exited classroom'
        });
    } catch (error) {
        console.error('Error exiting classroom:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to exit classroom'
        });
    }
});

module.exports = router; 