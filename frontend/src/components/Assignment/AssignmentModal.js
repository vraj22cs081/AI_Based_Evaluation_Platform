import React, { useState } from 'react';
import axios from 'axios';

const AssignmentModal = ({ isEdit, initialData, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 16) : '',
        maxMarks: initialData?.maxMarks || ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            if (selectedFile.size <= 5 * 1024 * 1024) { // 5MB limit
                setFile(selectedFile);
                setError('');
            } else {
                setError('File size should be less than 5MB');
            }
        } else {
            setError('Please select a PDF file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        
        try {
            if (!formData.title || !formData.description || !formData.dueDate || !formData.maxMarks) {
                throw new Error('All fields are required');
            }

            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('dueDate', formData.dueDate);
            formDataObj.append('maxMarks', formData.maxMarks);
            
            if (file) {
                formDataObj.append('assignmentFile', file);
            }

            await onSubmit(formDataObj);
        } catch (error) {
            console.error('Error with assignment:', error);
            setError(error.message || 'Failed to process assignment');
        } finally {
            setUploading(false);
        }
    };

    // Add onChange handler for form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                zIndex: 1001
            }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 mb-0">{isEdit ? 'Edit Assignment' : 'Create Assignment'}</h2>
                    <button onClick={onClose} className="btn-close"></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    {/* Title */}
                    <div>
                        <label className="form-label small">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="form-control"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="form-label small">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-control"
                            rows="3"
                            required
                        />
                    </div>

                    {/* Due Date and Max Marks in one row */}
                    <div className="row">
                        <div className="col-md-6">
                            <label className="form-label small">Due Date</label>
                            <input
                                type="datetime-local"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small">Max Marks</label>
                            <input
                                type="number"
                                name="maxMarks"
                                value={formData.maxMarks}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="form-label small">Assignment File (PDF only, max 5MB)</label>
                        <div className="border rounded p-3 text-center bg-light">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                id="file-input"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-input" className="mb-0" style={{ cursor: 'pointer' }}>
                                <i className="bi bi-cloud-upload fs-4 text-primary"></i>
                                <div className="small mt-1">
                                    {file ? file.name : 'Click to upload PDF'}
                                </div>
                            </label>
                        </div>
                        {error && <div className="text-danger small mt-1">{error}</div>}
                    </div>

                    {/* Buttons */}
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button type="button" className="btn btn-light" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>
                            {uploading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Assignment' : 'Create Assignment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignmentModal;