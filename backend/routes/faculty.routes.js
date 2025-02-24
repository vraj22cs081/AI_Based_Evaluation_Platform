const express = require('express');
const router = express.Router();
const Classroom = require('../models/classroom');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth.middleware');
const Assignment = require('../models/assignment');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { sendInviteEmail, notifyNewAssignment, notifyGradePosted } = require('../utils/emailService');
const multer = require('multer');

// Get faculty's classrooms
router.get('/classrooms', authMiddleware('Faculty'), async (req, res) => {
    try {
        const facultyId = req.user._id;
        
        const classrooms = await Classroom.find({ faculty: facultyId })
            .populate('students', 'name email')
            .populate('faculty', 'name email');

        res.json({
            success: true,
            classrooms
        });
    } catch (error) {
        console.error('Error fetching faculty classrooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch classrooms'
        });
    }
});

// Create new classroom
router.post('/classrooms', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { name, subject, description, studentEmails } = req.body;
        const facultyId = req.user._id;
        const faculty = await User.findById(facultyId);

        // Generate a unique room code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const newClassroom = new Classroom({
            name,
            subject,
            description,
            faculty: facultyId,
            roomCode
        });

        await newClassroom.save();

        // Send invitation emails to students
        if (studentEmails && studentEmails.length > 0) {
            console.log('Sending invites to:', studentEmails);
            const emailPromises = studentEmails.map(email => 
                sendInviteEmail(email, roomCode, faculty.name, name)
            );
            
            try {
                await Promise.all(emailPromises);
                console.log('All invitation emails sent successfully');
            } catch (emailError) {
                console.error('Error sending some invitation emails:', emailError);
                // Continue execution even if some emails fail
            }
        }

        res.json({
            success: true,
            message: 'Classroom created successfully',
            classroom: newClassroom
        });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create classroom'
        });
    }
});

// Update classroom
router.put('/classrooms/:classroomId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { name, subject, description, studentEmails } = req.body;
        const facultyId = req.user._id;
        const faculty = await User.findById(facultyId);

        const classroom = await Classroom.findOne({
            _id: classroomId,
            faculty: facultyId
        });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
            });
        }

        // Update classroom details
        classroom.name = name || classroom.name;
        classroom.subject = subject || classroom.subject;
        classroom.description = description || classroom.description;

        await classroom.save();

        // Ensure studentEmails is an array before processing
        if (Array.isArray(studentEmails) && studentEmails.length > 0) {
            console.log('Sending invites to new students:', studentEmails);
            const emailPromises = studentEmails.map(email => 
                sendInviteEmail(email, classroom.roomCode, faculty.name, classroom.name)
            );
            
            try {
                await Promise.all(emailPromises);
                console.log('All invitation emails sent successfully');
            } catch (emailError) {
                console.error('Error sending some invitation emails:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Classroom updated successfully',
            classroom
        });
    } catch (error) {
        console.error('Error updating classroom:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update classroom'
        });
    }
});

// Delete classroom
router.delete('/classrooms/:classroomId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const facultyId = req.user._id;

        const classroom = await Classroom.findOneAndDelete({
            _id: classroomId,
            faculty: facultyId
        });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Classroom deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting classroom:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete classroom'
        });
    }
});

// Remove student from classroom
router.delete('/classrooms/:classroomId/students/:studentId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId, studentId } = req.params;
        const facultyId = req.user._id;

        const classroom = await Classroom.findOne({
            _id: classroomId,
            faculty: facultyId
        });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
            });
        }

        classroom.students = classroom.students.filter(
            student => student.toString() !== studentId
        );

        await classroom.save();

        res.json({
            success: true,
            message: 'Student removed successfully'
        });
    } catch (error) {
        console.error('Error removing student:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove student'
        });
    }
});

// Get classroom details with students
router.get('/classrooms/:classroomId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const facultyId = req.user._id;

        const classroom = await Classroom.findOne({
            _id: classroomId,
            faculty: facultyId
        }).populate('students', 'name email');

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
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

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/assignments/'); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
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

// File upload route
router.post('/upload', authMiddleware('Faculty'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = `/uploads/assignments/${req.file.filename}`;
        
        res.json({
            success: true,
            fileUrl,
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

// Create assignment route
router.post('/classrooms/:classroomId/assignments', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { title, description, dueDate, maxMarks, assignmentFile } = req.body;
        const facultyId = req.user._id;

        console.log('Creating assignment with data:', {
            classroomId,
            title,
            description,
            dueDate,
            maxMarks,
            assignmentFile,
            facultyId
        });

        // Validate required fields
        if (!title || !description || !dueDate || !maxMarks || !assignmentFile) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Find and update the classroom using findOneAndUpdate
        const classroom = await Classroom.findOneAndUpdate(
            {
                _id: classroomId,
                faculty: facultyId
            },
            {
                $setOnInsert: { assignments: [] } // Initialize assignments array if it doesn't exist
            },
            {
                new: true, // Return the updated document
                upsert: false // Don't create if it doesn't exist
            }
        );

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
            });
        }

        // Create new assignment
        const assignment = new Assignment({
            title,
            description,
            dueDate: new Date(dueDate),
            maxMarks: Number(maxMarks),
            assignmentFile,
            classroom: classroomId,
            createdBy: facultyId
        });

        // Save the assignment
        await assignment.save();

        // Update classroom with new assignment using $push
        await Classroom.updateOne(
            { _id: classroomId },
            { 
                $push: { assignments: assignment._id }
            }
        );

        console.log('Assignment created successfully:', assignment);

        // After successfully creating the assignment, notify students
        const classroomWithStudents = await Classroom.findById(classroomId)
            .populate('students', 'email name');

        if (classroomWithStudents.students && classroomWithStudents.students.length > 0) {
            console.log('Sending notifications to students:', classroomWithStudents.students);
            
            for (const student of classroomWithStudents.students) {
                try {
                    await notifyNewAssignment(
                        student.email,
                        student.name,
                        title,
                        dueDate,
                        classroom.name
                    );
                    console.log(`Notification sent to ${student.email}`);
                } catch (emailError) {
                    console.error(`Failed to send notification to ${student.email}:`, emailError);
                }
            }
        }

        res.json({
            success: true,
            message: 'Assignment created and notifications sent',
            assignment
        });
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create assignment',
            error: error.message
        });
    }
});

// Get classroom assignments
router.get('/classrooms/:classroomId/assignments', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const facultyId = req.user._id;

        // Verify classroom belongs to faculty
        const classroom = await Classroom.findOne({
            _id: classroomId,
            faculty: facultyId
        });

        if (!classroom) {
            return res.status(404).json({
                success: false,
                message: 'Classroom not found or unauthorized'
            });
        }

        const assignments = await Assignment.find({ classroom: classroomId })
            .populate('submissions.student', 'name email');

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignments'
        });
    }
});

// Grade submission route
router.post('/assignments/:assignmentId/submissions/:submissionId/grade', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { grade, feedback } = req.body;

        // Find assignment and populate classroom details
        const assignment = await Assignment.findById(assignmentId)
            .populate('classroom', 'name');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Find the submission
        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Validate grade
        if (grade < 0 || grade > assignment.maxMarks) {
            return res.status(400).json({
                success: false,
                message: `Grade must be between 0 and ${assignment.maxMarks}`
            });
        }

        // Get student details for email
        const student = await User.findById(submission.student);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update submission
        submission.grade = grade;
        submission.feedback = feedback;
        await assignment.save();

        // Send email notification
        try {
            await notifyGradePosted(
                student.email,
                student.name,
                assignment.title,
                grade,
                assignment.maxMarks,
                feedback,
                assignment.classroom.name
            );
        } catch (emailError) {
            console.error('Error sending grade notification:', emailError);
            // Don't fail the grading if email fails
        }

        res.json({
            success: true,
            message: 'Grade posted successfully',
            submission: submission
        });

    } catch (error) {
        console.error('Grading error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to post grade'
        });
    }
});

// Update grade route
router.put('/assignments/:assignmentId/submissions/:submissionId/grade', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const { grade, feedback } = req.body;
        const facultyId = req.user._id;

        const assignment = await Assignment.findOne({
            _id: assignmentId,
            createdBy: facultyId
        }).populate('submissions.student', 'name email');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found or unauthorized'
            });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        await assignment.save();

        res.json({
            success: true,
            message: 'Grade updated successfully',
            submission
        });

    } catch (error) {
        console.error('Error updating grade:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update grade'
        });
    }
});

// Delete assignment
router.delete('/assignments/:assignmentId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const facultyId = req.user._id;

        const assignment = await Assignment.findOne({
            _id: assignmentId,
            createdBy: facultyId
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found or unauthorized'
            });
        }

        // Delete the assignment file if it exists
        if (assignment.assignmentFile) {
            const filePath = path.join(__dirname, '..', 'uploads', 
                assignment.assignmentFile.split('/').pop()
            );
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete all submission files
        for (const submission of assignment.submissions) {
            if (submission.submissionUrl) {
                const submissionPath = path.join(__dirname, '..', 'uploads', 
                    submission.submissionUrl.split('/').pop()
                );
                if (fs.existsSync(submissionPath)) {
                    fs.unlinkSync(submissionPath);
                }
            }
        }

        await Assignment.deleteOne({ _id: assignmentId });

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete assignment'
        });
    }
});

// Update assignment
router.put('/assignments/:assignmentId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { title, description, dueDate, maxMarks, assignmentFile } = req.body;
        const facultyId = req.user._id;

        const assignment = await Assignment.findOne({
            _id: assignmentId,
            createdBy: facultyId
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found or unauthorized'
            });
        }

        // Update assignment details
        assignment.title = title;
        assignment.description = description;
        assignment.dueDate = dueDate;
        assignment.maxMarks = maxMarks;
        if (assignmentFile) {
            assignment.assignmentFile = assignmentFile;
        }

        await assignment.save();

        // Send email notifications to all students
        const classroom = await Classroom.findById(assignment.classroom)
            .populate('students', 'email name');
        
        for (const student of classroom.students) {
            await notifyNewAssignment([student], assignment, classroom.name);
        }

        res.json({
            success: true,
            message: 'Assignment updated successfully',
            assignment
        });
    } catch (error) {
        console.error('Error updating assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update assignment'
        });
    }
});

// Get assignment statistics
router.get('/assignments/:assignmentId/statistics', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const facultyId = req.user._id;

        const assignment = await Assignment.findOne({
            _id: assignmentId,
            createdBy: facultyId
        }).populate('submissions.student', 'name');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found or unauthorized'
            });
        }

        const classroom = await Classroom.findById(assignment.classroom);
        const totalStudents = classroom.students.length;
        const totalSubmissions = assignment.submissions.length;
        const gradedSubmissions = assignment.submissions.filter(sub => sub.grade !== null).length;
        
        // Calculate average grade
        const grades = assignment.submissions
            .filter(sub => sub.grade !== null)
            .map(sub => sub.grade);
        const averageGrade = grades.length > 0 
            ? grades.reduce((a, b) => a + b, 0) / grades.length 
            : 0;

        // Calculate grade distribution
        const gradeDistribution = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            'Below 60': 0
        };

        grades.forEach(grade => {
            const percentage = (grade / assignment.maxMarks) * 100;
            if (percentage >= 90) gradeDistribution['90-100']++;
            else if (percentage >= 80) gradeDistribution['80-89']++;
            else if (percentage >= 70) gradeDistribution['70-79']++;
            else if (percentage >= 60) gradeDistribution['60-69']++;
            else gradeDistribution['Below 60']++;
        });

        res.json({
            success: true,
            statistics: {
                totalStudents,
                totalSubmissions,
                gradedSubmissions,
                averageGrade,
                gradeDistribution,
                submissionRate: (totalSubmissions / totalStudents) * 100,
                gradingProgress: (gradedSubmissions / totalSubmissions) * 100
            }
        });
    } catch (error) {
        console.error('Error fetching assignment statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignment statistics'
        });
    }
});

// Add assignment submission route
router.post('/assignments/:assignmentId/submit', authMiddleware('Student'), upload.single('file'), async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user._id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Check if submission is before due date
        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({
                success: false,
                message: 'Assignment submission deadline has passed'
            });
        }

        const submissionFile = `/uploads/submissions/${req.file.filename}`;
        
        // Update or create submission
        const submissionIndex = assignment.submissions.findIndex(
            sub => sub.student.toString() === studentId.toString()
        );

        if (submissionIndex > -1) {
            assignment.submissions[submissionIndex].submissionFile = submissionFile;
            assignment.submissions[submissionIndex].submittedAt = new Date();
        } else {
            assignment.submissions.push({
                student: studentId,
                submissionFile,
                submittedAt: new Date()
            });
        }

        await assignment.save();

        res.json({
            success: true,
            message: 'Assignment submitted successfully'
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit assignment'
        });
    }
});

// Get assignments for student
router.get('/student/assignments', authMiddleware('Student'), async (req, res) => {
    try {
        const studentId = req.user._id;

        // Find all classrooms where the student is enrolled
        const classrooms = await Classroom.find({
            students: studentId
        });

        // Get all assignments from these classrooms
        const assignments = await Assignment.find({
            classroom: { $in: classrooms.map(c => c._id) }
        }).populate('classroom', 'name')
          .populate('createdBy', 'name');

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assignments'
        });
    }
});

module.exports = router;