import React, { useState } from 'react';
import axios from 'axios';
import './AssignmentSubmissionModal.css';
import { getApiUrl } from '../../config/api.config';

const AssignmentSubmissionModal = ({ assignment, onClose, onSubmitSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                setSelectedFile(null);
                e.target.value = null;
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size should not exceed 10MB');
                setSelectedFile(null);
                e.target.value = null;
                return;
            }
            
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            setError('Please select a file to submit');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError(null);
            
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);
            
            // Create form data with field name 'file' for multer
            const formData = new FormData();
            formData.append('file', selectedFile);
            
            console.log('Submitting assignment:', assignment._id);
            console.log('File to upload:', selectedFile.name, selectedFile.type, selectedFile.size);
            
            const response = await axios.post(
                getApiUrl(`/student/assignments/${assignment._id}/submit`),
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('Submission response:', response.data);
            
            if (response.data.success) {
                setSuccess('Assignment submitted successfully');
                
                // Wait a bit to show success message
                setTimeout(() => {
                    onClose();
                    if (onSubmitSuccess) onSubmitSuccess();
                }, 1500);
            } else {
                throw new Error(response.data.message || 'Failed to submit assignment');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to submit assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if assignment is already submitted
    const isSubmitted = assignment.submission !== null;

    return (
        <div className="submission-modal">
            <div className="submission-header">
                <h2 className="submission-title">
                    <i className="fas fa-cloud-upload-alt"></i>
                    Submit Assignment
                </h2>
                <button onClick={onClose} className="close-button">
                    <i className="fas fa-times"></i>
                </button>
            </div>

            <h3 className="assignment-title">{assignment.title}</h3>

            <div className="assignment-details">
                <div className="detail-group">
                    <label className="detail-label">
                        <i className="fas fa-clock me-2"></i>
                        Due Date
                    </label>
                    <div className="detail-value">
                        {new Date(assignment.dueDate).toLocaleString()}
                    </div>
                </div>
                <div className="detail-group">
                    <label className="detail-label">
                        <i className="fas fa-star me-2"></i>
                        Maximum Marks
                    </label>
                    <div className="detail-value">{assignment.maxMarks}</div>
                </div>
            </div>

            {isSubmitted ? (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    This assignment has already been submitted.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="file-upload-container">
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
                                <i className="fas fa-file-upload file-upload-icon"></i>
                                <div>Drop your PDF file here, or click to select</div>
                                <div className="file-upload-hint">PDF only, max 10MB</div>
                            </div>
                            {selectedFile && (
                                <div className="selected-file">
                                    <i className="fas fa-file-pdf"></i>
                                    {selectedFile.name}
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    {success && (
                        <div className="success-message">{success}</div>
                    )}

                    <div className="button-container">
                        <button 
                            type="button" 
                            className="cancel-button" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            <i className="fas fa-times"></i>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={!selectedFile || isSubmitting || isSubmitted}
                        >
                            <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AssignmentSubmissionModal;