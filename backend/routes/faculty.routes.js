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
const PDFParser = require('pdf2json');
const axios = require('axios');
const { uploadToFirebase, deleteFromFirebase } = require('../utils/firebaseStorage');
const mongoose = require('mongoose');
const { extractTextFromPdf, generateIdealAnswers } = require('../utils/aiUtils');
const { gradeSubmission } = require('../utils/grading');

// Add this helper function at the top of the file after imports
const extractPDFText = async (filePath) => {
    try {
        const pdfParser = new PDFParser(null, 1);
        const pdfText = await new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
                let text = '';
                for (let page of pdfData.Pages) {
                    for (let textItem of page.Texts) {
                        // Handle each text element properly
                        if (textItem.R && textItem.R.length > 0) {
                            text += textItem.R.map(r => decodeURIComponent(r.T)).join('') + ' ';
                        }
                    }
                    text += '\n'; // Add newline between pages
                }
                resolve(text.trim());
            });
            pdfParser.on('pdfParser_dataError', reject);
            pdfParser.loadPDF(filePath);
        });
        return pdfText;
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw error;
    }
};

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

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// File upload route - Ensure field name is 'file'
router.post('/upload', authMiddleware('Faculty'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('Uploading file to Firebase:', req.file.originalname);
        
        const result = await uploadToFirebase(req.file, 'assignments');
        
        console.log('Firebase upload result:', result);

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

// Create assignment route with GROQ ideal answers generation
router.post('/classrooms/:classroomId/assignments', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { classroomId } = req.params;
        const { title, description, dueDate, maxMarks, assignmentFile, filePath } = req.body;
        const facultyId = req.user._id;

        console.log('Creating assignment with data:', {
            title,
            description,
            dueDate,
            maxMarks,
            assignmentFile,
            filePath
        });

        // Validate required fields
        if (!title || !description || !dueDate || !maxMarks || !assignmentFile) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // If filePath is undefined or missing, extract it from assignmentFile URL
        let storedFilePath = filePath;
        if (!storedFilePath || storedFilePath === 'undefined') {
            // Extract path from URL, assuming URL format from Firebase
            const urlParts = assignmentFile.split('/');
            storedFilePath = `assignments/${urlParts[urlParts.length - 1]}`;
            console.log('Generated filePath from URL:', storedFilePath);
        }

        // Extract text from PDF for ideal answers
        let idealAnswers;
        try {
            console.log('Starting PDF extraction');
            const assignmentText = await extractTextFromPdf(assignmentFile);
            console.log(`Extracted ${assignmentText.length} characters from PDF`);
            
            // Generate ideal answers using GROQ
            idealAnswers = await generateIdealAnswers(title, description, assignmentText, parseInt(maxMarks));
            console.log('Successfully generated ideal answers using GROQ');
        } catch (error) {
            console.error('Error generating ideal answers:', error);
            // Default ideal answers if generation fails
            idealAnswers = {
                questions: [{
                    questionNumber: 1,
                    idealAnswer: "Please review the assignment manually.",
                    keyPoints: ["Manual review required"],
                    maxMarks: parseInt(maxMarks),
                    markingCriteria: ["Review submission thoroughly"]
                }],
                totalMarks: parseInt(maxMarks)
            };
        }

        // Create the assignment
        const assignment = new Assignment({
            title,
            description,
            dueDate: new Date(dueDate),
            maxMarks: parseInt(maxMarks),
            assignmentFile,
            filePath: storedFilePath,
            classroom: classroomId,
            createdBy: facultyId,
            idealAnswers
        });

        await assignment.save();
        console.log('Assignment saved successfully');

        // Update classroom with new assignment
        await Classroom.findByIdAndUpdate(
            classroomId,
            { $push: { assignments: assignment._id } }
        );

        res.json({
            success: true,
            message: 'Assignment created successfully',
            assignment
        });

    } catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create assignment'
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
        }).populate('submissions.student', 'name email')
          .populate('classroom', 'name');  // Add this to get classroom name

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

        // Send email notification
        try {
            await notifyGradePosted(
                submission.student.email,
                submission.student.name,
                assignment.title,
                grade,
                assignment.maxMarks,
                feedback,
                assignment.classroom.name
            );
            console.log('Grade notification email sent successfully');
        } catch (emailError) {
            console.error('Error sending grade notification:', emailError);
            // Don't fail the grading if email fails
        }

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

// Update delete assignment route to use deleteOne instead of remove
router.delete('/assignments/:assignmentId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        // Delete assignment file from Firebase
        if (assignment.filePath) {
            console.log('Deleting file from Firebase:', assignment.filePath);
            await deleteFromFirebase(assignment.filePath);
        }

        // Delete submission files from Firebase
        if (assignment.submissions && assignment.submissions.length > 0) {
            console.log(`Deleting ${assignment.submissions.length} submission files`);
            for (const submission of assignment.submissions) {
                if (submission.filePath) {
                    console.log('Deleting submission file:', submission.filePath);
                    await deleteFromFirebase(submission.filePath);
                }
            }
        }

        // Use deleteOne() instead of remove()
        await Assignment.deleteOne({ _id: assignment._id });
        console.log('Assignment deleted successfully');

        // Update classroom to remove the assignment reference
        await Classroom.updateOne(
            { assignments: assignment._id },
            { $pull: { assignments: assignment._id } }
        );

        res.json({
            success: true,
            message: 'Assignment deleted successfully'
        });

    } catch (error) {
        console.error('Assignment deletion error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete assignment'
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

// Auto-grade submission using Groq API
router.post('/assignments/:assignmentId/submissions/:submissionId/autograde', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const assignment = await Assignment.findById(assignmentId)
            .populate('submissions.student', 'name')
            .populate('classroom', 'name');

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        const submission = assignment.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Check if submission URL exists
        if (!submission.submissionUrl) {
            return res.status(404).json({
                success: false,
                message: 'No submission file found'
            });
        }

        console.log('Processing submission URL:', submission.submissionUrl);

        // Create a temporary directory if it doesn't exist
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate a temporary file path for the downloaded file
        const submissionFileName = submission.submissionUrl.split('/').pop();
        const tempFilePath = path.join(tempDir, submissionFileName);

        try {
            // Download the file from Firebase URL
            console.log('Downloading file from Firebase:', submission.submissionUrl);
            const response = await axios({
                method: 'get',
                url: submission.submissionUrl,
                responseType: 'arraybuffer'
            });

            // Save the file to the temporary location
            fs.writeFileSync(tempFilePath, response.data);
            console.log('File downloaded successfully to:', tempFilePath);

            // Read PDF content using pdf2json
            const pdfParser = new PDFParser();
            const pdfContent = await new Promise((resolve, reject) => {
                pdfParser.on('pdfParser_dataReady', (pdfData) => {
                    const text = pdfData.Pages.map(page => 
                        page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' ')
                    ).join('\n');
                    resolve(text);
                });
                pdfParser.on('pdfParser_dataError', reject);
                pdfParser.loadPDF(tempFilePath);
            });

            console.log('PDF Content extracted successfully');

            // Extract text from student's submission (using the same function but with temp file)
            const submissionText = await extractPDFText(tempFilePath);
            console.log('Student Submission Text extracted, length:', submissionText.length);

            // Get ideal answers from assignment
            const idealAnswers = assignment.idealAnswers;

            // Compare with ideal answers using GROQ API
            const gradingResponse = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: "You are grading a student submission against ideal answers."
                        },
                        {
                            role: "user",
                            content: `
                                Compare this submission with the ideal answers:

                                Ideal Answers: ${JSON.stringify(idealAnswers)}
                                
                                Student Submission: ${submissionText}

                                Assignment Maximum Marks: ${assignment.maxMarks}

                                Grade based on matching key points and criteria.
                                Important: The grade should be calculated out of ${assignment.maxMarks} marks, not out of 100.
                                Respond in JSON: {"grade": number, "feedback": "string"}
                            `
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.3,
                },
                {
                    headers: { 
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Parse the AI response with error handling
            try {
                const responseContent = gradingResponse.data.choices[0].message.content.trim();
                console.log('Raw API Response:', responseContent);
                
                // Clean the response string before parsing
                const cleanedContent = responseContent
                    .replace(/[\n\r]/g, ' ') // Remove newlines
                    .replace(/\s+/g, ' ') // Normalize spaces
                    .replace(/\\./g, '') // Remove escape sequences
                    .replace(/[^\x20-\x7E]/g, ''); // Remove non-printable characters
                
                let aiResponse;
                try {
                    aiResponse = JSON.parse(cleanedContent);
                } catch (parseError) {
                    // If JSON parse fails, try to extract JSON from the text
                    const jsonMatch = cleanedContent.match(/\{[^{}]*\}/);
                    if (jsonMatch) {
                        aiResponse = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('Could not parse API response as JSON');
                    }
                }

                // Validate the response format
                if (!aiResponse || typeof aiResponse.grade === 'undefined' || !aiResponse.feedback) {
                    throw new Error('Invalid response format from API');
                }

                // Calculate proportional grade
                const finalGrade = Math.min(Math.max(0, parseFloat(aiResponse.grade)), assignment.maxMarks);

                // Update submission
                submission.grade = finalGrade;
                submission.feedback = aiResponse.feedback;
                submission.isAutoGraded = true;
                await assignment.save();

                // Cleanup: Delete the temporary file
                try {
                    fs.unlinkSync(tempFilePath);
                    console.log('Temporary file deleted successfully');
                } catch (cleanupError) {
                    console.error('Error deleting temporary file:', cleanupError);
                    // Continue even if cleanup fails
                }

                // Send the converted grade to frontend
                res.json({
                    success: true,
                    message: 'Assignment auto-graded successfully',
                    grade: finalGrade,
                    feedback: aiResponse.feedback
                });
            } catch (parseError) {
                // Clean up temp file if parsing fails
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                    }
                } catch (cleanupError) {
                    // Ignore cleanup errors
                }
                
                console.error('Error parsing API response:', parseError);
                res.status(500).json({
                    success: false,
                    message: 'Failed to parse auto-grading response'
                });
            }
        } catch (fileError) {
            console.error('File processing error:', fileError);
            
            // Clean up temp file if it exists
            try {
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                }
            } catch (cleanupError) {
                // Ignore cleanup errors
            }
            
            return res.status(500).json({
                success: false,
                message: 'Error downloading or processing submission file',
                error: fileError.message
            });
        }
    } catch (error) {
        console.error('Auto-grading error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to auto-grade assignment'
        });
    }
});

// Add or update the submission grading route
router.post('/grade-submission/:assignmentId/:submissionId', authMiddleware('Faculty'), async (req, res) => {
    try {
        const { assignmentId, submissionId } = req.params;
        const facultyId = req.user._id;
        
        console.log(`Grading submission ${submissionId} for assignment ${assignmentId}`);
        
        // Find the assignment
        const assignment = await Assignment.findById(assignmentId);
        
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }
        
        // Check if faculty is authorized
        if (assignment.createdBy.toString() !== facultyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to grade this assignment'
            });
        }
        
        // Find the submission
        const submission = assignment.submissions.find(
            sub => sub._id.toString() === submissionId
        );
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        console.log('Found submission:', {
            studentId: submission.student,
            submissionUrl: submission.submissionUrl,
            submittedAt: submission.submittedAt
        });
        
        // Grade the submission
        const gradingResult = await gradeSubmission(submission, assignment);
        
        // Update the submission with grade
        submission.grade = gradingResult.totalGrade;
        submission.feedback = gradingResult.overallFeedback;
        submission.gradingDetails = gradingResult;
        submission.gradedAt = new Date();
        submission.gradedBy = facultyId;
        
        await assignment.save();
        
        // Get student info for notification
        const student = await User.findById(submission.student);
        
        // Send notification if desired
        // (implementation omitted)
        
        res.json({
            success: true,
            message: 'Submission graded successfully',
            grade: gradingResult.totalGrade,
            feedback: gradingResult.overallFeedback
        });
    } catch (error) {
        console.error('Error grading submission:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to grade submission'
        });
    }
});

module.exports = router;