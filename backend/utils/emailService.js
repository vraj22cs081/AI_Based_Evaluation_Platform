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

// 1. Send Invite Email
const sendInviteEmail = async (recipientEmail, roomCode, facultyName, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `Invitation to join ${className}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">You've been invited to join a classroom!</h2>
                    <p>Professor ${facultyName} has invited you to join their class: ${className}</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p>Your room code is: <strong>${roomCode}</strong></p>
                    </div>
                    <p>Use this code to join the classroom in your student dashboard.</p>
                    <p>Best regards,<br>Classroom App Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Invite email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send invite email:', error);
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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">New Assignment Posted</h2>
                    <p>Hello ${studentName},</p>
                    <p>A new assignment has been posted in your class ${className}:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Due Date: ${new Date(dueDate).toLocaleString()}</p>
                    </div>
                    <p>Please log in to your dashboard to view and submit the assignment.</p>
                    <p>Best regards,<br>Your Faculty</p>
                </div>
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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Assignment Update Notice</h2>
                    <p>Hello ${studentName},</p>
                    <p>An assignment has been updated in your class ${className}:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Updated Due Date: ${new Date(dueDate).toLocaleString()}</p>
                    </div>
                    <p>Please check your dashboard for the updated details.</p>
                    <p>Best regards,<br>Your Faculty</p>
                </div>
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

// 4. Submission Confirmation (for both student and faculty)
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
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Assignment Submission Confirmation</h2>
                    <p>Hello ${studentName},</p>
                    <p>Your assignment has been successfully submitted:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Class: ${className}</p>
                        <p style="margin: 10px 0 0 0;">Submitted on: ${new Date().toLocaleString()}</p>
                    </div>
                    <p>You can view your submission status in your dashboard.</p>
                    <p>Best regards,<br>Classroom App Team</p>
                </div>
            `
        };

        // Send notification to faculty
        const facultyMailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: facultyEmail,
            subject: `New Assignment Submission - ${className}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">New Assignment Submission</h2>
                    <p>Hello,</p>
                    <p>A new assignment submission has been received:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Class: ${className}</p>
                        <p style="margin: 5px 0;">Student: ${studentName}</p>
                        <p style="margin: 10px 0 0 0;">Submitted on: ${new Date().toLocaleString()}</p>
                    </div>
                    <p>Please log in to your dashboard to review and grade this submission.</p>
                    <p>Best regards,<br>Classroom App Team</p>
                </div>
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

// 5. Grade Posted Notification
const notifyGradePosted = async (studentEmail, studentName, assignmentTitle, grade, maxMarks, feedback, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Assignment Graded - ${className}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Assignment Grade Posted</h2>
                    <p>Hello ${studentName},</p>
                    <p>Your assignment has been graded:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Class: ${className}</p>
                        <p style="margin: 10px 0;">Grade: ${grade}/${maxMarks}</p>
                        ${feedback ? `<p style="margin: 10px 0 0 0;">Feedback: ${feedback}</p>` : ''}
                    </div>
                    <p>You can view the complete details on your dashboard.</p>
                    <p>Best regards,<br>Your Faculty</p>
                </div>
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

// 6. Submission Reminder
const sendSubmissionReminder = async (studentEmail, studentName, assignmentTitle, dueDate, className) => {
    try {
        const mailOptions = {
            from: `"Classroom App" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: `Assignment Due Soon - ${className}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Assignment Reminder</h2>
                    <p>Hello ${studentName},</p>
                    <p>This is a reminder that the following assignment is due soon:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">${assignmentTitle}</h3>
                        <p style="margin: 0;">Due Date: ${new Date(dueDate).toLocaleString()}</p>
                    </div>
                    <p>Please ensure you submit your work before the deadline.</p>
                    <p>Best regards,<br>Your Faculty</p>
                </div>
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

module.exports = {
    sendInviteEmail,
    notifyNewAssignment,
    notifyAssignmentUpdated,
    sendSubmissionConfirmation,
    notifyGradePosted,
    sendSubmissionReminder
};