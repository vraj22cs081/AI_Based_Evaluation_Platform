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
        const formData = new FormData();
        formData.append('file', file);

        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                `http://localhost:9000/api/student/assignments/${assignment._id}/submit`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Assignment submitted successfully!' });
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 2000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
        } finally {
            setUploading(false);
        }
    };

    // Check if assignment is already submitted
    const isSubmitted = assignment.submission !== null;

    return (
        <div className="submission-modal">
            <div className="submission-header">
                <h2 className="submission-title">Submit Assignment</h2>
                <button onClick={onClose} className="close-button">×</button>
            </div>

            <h3 className="assignment-title">{assignment.title}</h3>

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

            {isSubmitted ? (
                <div className="alert alert-info">
                    This assignment has already been submitted.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="justify-content-center file-upload-container">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            disabled={isSubmitted}
                        />
                        <label htmlFor="file-upload" className="file-upload-area">
                            <div className="file-upload-text">
                                Drop your PDF file here, or click to select
                            </div>
                            <div className="file-upload-hint">PDF only, max 5MB</div>
                            {file && <div className="selected-file">{file.name}</div>}
                        </label>
                    </div>

                    {message.text && (
                        <p className={`mt-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                            {message.text}
                        </p>
                    )}

                    <div className="button-container">
                        <button 
                            type="button" 
                            className="cancel-button" 
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!file || uploading || isSubmitted}
                        >
                            {uploading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AssignmentSubmissionModal;