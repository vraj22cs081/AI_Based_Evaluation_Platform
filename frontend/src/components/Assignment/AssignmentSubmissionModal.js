import React, { useState } from 'react';
import axios from 'axios';
import './AssignmentSubmissionModal.css';

const AssignmentSubmissionModal = ({ assignment, onClose }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        
        if (selectedFile.type !== 'application/pdf') {
            setMessage({ type: 'error', text: 'Only PDF files are allowed.' });
            return;
        }
        if (selectedFile.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
            return;
        }
        
        setFile(selectedFile);
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file to upload.' });
            return;
        }
        
        setUploading(true);
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);
            
            const formData = new FormData();
            formData.append('file', file);
            
            const { data: uploadData } = await axios.post(
                'http://localhost:9000/api/student/upload',
                formData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
            );
            
            if (uploadData.success) {
                const { data: submitData } = await axios.post(
                    `http://localhost:9000/api/student/assignments/${assignment._id}/submit`,
                    { submissionFile: uploadData.fileUrl },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                
                if (submitData.success) {
                    setMessage({ type: 'success', text: 'Assignment submitted successfully!' });
                    setTimeout(onClose, 2000);
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="submission-modal">
            {/* Header */}
            <div className="submission-header">
                <h2 className="submission-title">Submit Assignment</h2>
                <button onClick={onClose} className="close-button">×</button>
            </div>

            {/* Assignment Title */}
            <h3 className="assignment-title">{assignment.title}</h3>

            {/* Assignment Details */}
            <div className="assignment-details">
                <div className="detail-group">
                    <label className="detail-label">Due Date</label>
                    <div className="detail-value">
                        {new Date(assignment.dueDate).toLocaleString()}
                    </div>
                </div>
                <div className="detail-group">
                    <label className="detail-label">Maximum Marks</label>
                    <div className="detail-value">{assignment.maxMarks}</div>
                </div>
            </div>

            {/* File Upload */}
            <div className="justify-content-center file-upload-container">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-area">
                    <div className="file-upload-text">
                        Drop your PDF file here, or click to select
                    </div>
                    <div className="file-upload-hint">PDF only, max 5MB</div>
                    {file && <div className="selected-file">{file.name}</div>}
                </label>
            </div>

            {/* Status Messages */}
            {message.text && (
                <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
            )}

            {/* Buttons */}
            <div className="button-container">
                <button onClick={onClose} className="cancel-button">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !file}
                    className="submit-button"
                >
                    {uploading ? 'Submitting...' : 'Submit Assignment'}
                </button>
            </div>
        </div>
    );
};

export default AssignmentSubmissionModal;