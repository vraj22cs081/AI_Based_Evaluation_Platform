// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Common styling for all emails
const emailStyles = `
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background-color: #1a73e8; padding: 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 500; }
    .content { padding: 30px; color: #202124; }
    .content h2 { color: #1a73e8; font-size: 20px; margin-top: 0; margin-bottom: 20px; }
    .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8; }
    .info-box h3 { color: #202124; margin-top: 0; font-size: 18px; }
    .info-box p { margin: 10px 0; color: #5f6368; }
    .highlight { color: #1a73e8; font-weight: 500; }
    .footer { padding: 20px; text-align: center; background-color: #f8f9fa; color: #5f6368; font-size: 14px; }
    .btn { display: inline-block; background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: 500; margin-top: 15px; }
`;

// 1. Send Invite Email for Classroom Creation
const sendInviteEmail = async (recipientEmail, roomCode, facultyName, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `Invitation to join ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Classroom Invitation</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Classroom Invitation</h1>
                        </div>
                        <div class="content">
                            <h2>You've been invited to join a classroom!</h2>
                            <p>Hello,</p>
                            <p>Professor <span class="highlight">${facultyName}</span> has invited you to join their class.</p>
                            
                            <div class="info-box">
                                <h3>${className}</h3>
                                <p><strong>Room Code:</strong> <span class="highlight">${roomCode}</span></p>
                                <p><strong>Invited by:</strong> ${facultyName}</p>
                                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>To join this classroom, please log in to your student dashboard and enter the room code above when prompted.</p>
                            <p>If you don't have an account yet, you can create one using the email address this invitation was sent to.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Classroom invitation email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send classroom invitation email:', error);
        return false;
    }
};

// 2. New Assignment Notification
const notifyNewAssignment = async (studentEmail, studentName, assignmentTitle, dueDate, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `New Assignment Posted - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Assignment Posted</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Assignment Posted</h1>
                        </div>
                        <div class="content">
                            <h2>Assignment Notification</h2>
                            <p>Hello ${studentName},</p>
                            <p>A new assignment has been posted in your class <span class="highlight">${className}</span>.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Due Date:</strong> <span class="highlight">${new Date(dueDate).toLocaleString()}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Posted on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Please log in to your student dashboard to view complete assignment details, download any materials, and submit your work before the deadline.</p>
                            <p>We recommend starting early to ensure you have sufficient time to complete the assignment.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('New assignment notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send new assignment notification:', error);
        return false;
    }
};

// 3. Assignment Update Notification
const notifyAssignmentUpdated = async (studentEmail, studentName, assignmentTitle, dueDate, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Assignment Updated - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Assignment Updated</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Assignment Update</h1>
                        </div>
                        <div class="content">
                            <h2>Important Assignment Changes</h2>
                            <p>Hello ${studentName},</p>
                            <p>An assignment has been updated in your class <span class="highlight">${className}</span>.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Updated Due Date:</strong> <span class="highlight">${new Date(dueDate).toLocaleString()}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Please log in to your student dashboard to review the updated assignment details. The assignment requirements, instructions, or deadline may have changed.</p>
                            <p>If you've already started working on this assignment, please ensure your work aligns with any updated requirements.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Assignment update notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send assignment update notification:', error);
        return false;
    }
};

// 4. Classroom Update Notification
const notifyClassroomUpdated = async (studentEmail, studentName, className, facultyName) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Classroom Updated - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Classroom Updated</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Classroom Update</h1>
                        </div>
                        <div class="content">
                            <h2>Classroom Information Updated</h2>
                            <p>Hello ${studentName},</p>
                            <p>Your enrolled classroom <span class="highlight">${className}</span> has been updated by Professor ${facultyName}.</p>
                            
                            <div class="info-box">
                                <h3>${className}</h3>
                                <p><strong>Professor:</strong> ${facultyName}</p>
                                <p><strong>Updated on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Please log in to your student dashboard to view the updated classroom information and any new resources that may have been added.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Classroom update notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send classroom update notification:', error);
        return false;
    }
};

// 5. Submission Confirmation (for both student and faculty)
const sendSubmissionConfirmation = async (
    studentEmail, 
    studentName, 
    facultyEmail,
    assignmentTitle, 
    className
) => {
    try {
        // Send confirmation to student
        const studentMailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Assignment Submission Confirmation - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Submission Confirmation</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Submission Confirmation</h1>
                        </div>
                        <div class="content">
                            <h2>Your assignment has been submitted successfully!</h2>
                            <p>Hello ${studentName},</p>
                            <p>We're confirming that your assignment submission has been received.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Student:</strong> ${studentName}</p>
                                <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Your submission will be reviewed by your professor. You will receive another notification when your assignment has been graded.</p>
                            <p>You can check the status of your submission anytime from your student dashboard.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send notification to faculty
        const facultyMailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: facultyEmail,
            subject: `New Assignment Submission - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Submission</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Assignment Submission</h1>
                        </div>
                        <div class="content">
                            <h2>A student has submitted an assignment</h2>
                            <p>Hello,</p>
                            <p>A new assignment submission has been received for your review.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Student:</strong> ${studentName}</p>
                                <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Please log in to your faculty dashboard to review this submission. You can provide manual grading or use AI-assisted grading for this submission.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send both emails
        const [studentInfo, facultyInfo] = await Promise.all([
            transporter.sendMail(studentMailOptions),
            transporter.sendMail(facultyMailOptions)
        ]);

        console.log('Student confirmation sent:', studentInfo.messageId);
        console.log('Faculty notification sent:', facultyInfo.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send submission notifications:', error);
        return false;
    }
};

// 6. Manual Grade Posted Notification
const notifyGradePosted = async (studentEmail, studentName, assignmentTitle, grade, maxMarks, feedback, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Grade Posted - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Assignment Graded</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Assignment Graded</h1>
                        </div>
                        <div class="content">
                            <h2>Your assignment has been manually graded</h2>
                            <p>Hello ${studentName},</p>
                            <p>Your assignment in ${className} has been graded by your professor.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Grade:</strong> <span class="highlight">${grade}/${maxMarks}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Graded on:</strong> ${new Date().toLocaleString()}</p>
                                ${feedback ? `
                                    <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                                        <p style="font-weight: 500; margin-bottom: 5px;">Instructor Feedback:</p>
                                        <p style="margin: 0;">${feedback}</p>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <p>You can view your complete grade details and feedback on the classroom dashboard.</p>
                            <p>If you have any questions about your grade, please contact your professor.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Grade notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send grade notification:', error);
        return false;
    }
};

// 7. AI Grade Posted Notification
const notifyAIGradePosted = async (studentEmail, studentName, assignmentTitle, grade, maxMarks, feedback, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `AI-Generated Grade Posted - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Assignment Graded by AI</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Assignment AI-Graded</h1>
                        </div>
                        <div class="content">
                            <h2>Your assignment has been graded by AI</h2>
                            <p>Hello ${studentName},</p>
                            <p>Your assignment in ${className} has been graded using our AI-assisted grading system.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>AI-Generated Grade:</strong> <span class="highlight">${grade}/${maxMarks}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Graded on:</strong> ${new Date().toLocaleString()}</p>
                                ${feedback ? `
                                    <div style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 15px;">
                                        <p style="font-weight: 500; margin-bottom: 5px;">AI Feedback:</p>
                                        <p style="margin: 0;">${feedback}</p>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <p>Please note that this grade was generated automatically using our AI grading system. Your professor may review and adjust this grade if necessary.</p>
                            <p>You can view your complete grade details and feedback on the classroom dashboard.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('AI grade notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send AI grade notification:', error);
        return false;
    }
};

// 8. Submission Reminder
const sendSubmissionReminder = async (studentEmail, studentName, assignmentTitle, dueDate, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Assignment Due Soon - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Assignment Reminder</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Assignment Reminder</h1>
                        </div>
                        <div class="content">
                            <h2>Upcoming Assignment Deadline</h2>
                            <p>Hello ${studentName},</p>
                            <p>This is a friendly reminder that you have an assignment due soon in ${className}.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Due Date:</strong> <span class="highlight">${new Date(dueDate).toLocaleString()}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                            </div>
                            
                            <p>Please ensure you submit your work before the deadline to avoid any late penalties.</p>
                            <p>If you've already submitted this assignment, please disregard this reminder.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Reminder email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send reminder email:', error);
        return false;
    }
};

// 9. Assignment Creation Notification
const notifyAssignmentCreated = async (studentEmail, studentName, assignmentTitle, dueDate, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `New Assignment - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New Assignment</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Assignment</h1>
                        </div>
                        <div class="content">
                            <h2>A new assignment has been posted</h2>
                            <p>Hello ${studentName},</p>
                            <p>A new assignment has been posted in your class ${className}.</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Due Date:</strong> <span class="highlight">${new Date(dueDate).toLocaleString()}</span></p>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Posted on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Please log in to your dashboard to view the complete assignment details and instructions.</p>
                            <p>We recommend reviewing the assignment requirements early to plan your work accordingly.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Assignment creation notification sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send assignment creation notification:', error);
        return false;
    }
};

// 10. Submission Notification
const notifySubmissionReceived = async (studentEmail, studentName, assignmentTitle, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Submission Received - ${assignmentTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Submission Received</title>
                    <style>${emailStyles}</style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Submission Received</h1>
                        </div>
                        <div class="content">
                            <h2>Your assignment submission has been received</h2>
                            <p>Hello ${studentName},</p>
                            <p>We've received your submission for the following assignment:</p>
                            
                            <div class="info-box">
                                <h3>${assignmentTitle}</h3>
                                <p><strong>Class:</strong> ${className}</p>
                                <p><strong>Submitted on:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            
                            <p>Your submission will be graded by your instructor. You will receive another notification when your grade is posted.</p>
                            <p>You can track the status of your submission in your student dashboard.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from the Classroom App.</p>
                            <p>&copy; ${new Date().getFullYear()} Classroom App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Submission confirmation sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send submission confirmation:', error);
        return false;
    }
};

module.exports = {
    sendInviteEmail,
    notifyNewAssignment,
    notifyAssignmentUpdated,
    notifyClassroomUpdated,
    sendSubmissionConfirmation,
    notifyGradePosted,
    notifyAIGradePosted,
    sendSubmissionReminder,
    notifyAssignmentCreated,
    notifySubmissionReceived
};