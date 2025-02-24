import React, { useState, useEffect } from 'react';

const CreateClassroomModal = ({ onClose, onSubmit, isEdit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: '',
        studentEmails: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                subject: initialData.subject || '',
                description: initialData.description || '',
                studentEmails: Array.isArray(initialData.studentEmails) 
                    ? initialData.studentEmails.join(', ')
                    : ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const studentEmails = formData.studentEmails
            .split(',')
            .map(email => email.trim())
            .filter(email => email);
        
        onSubmit({
            ...formData,
            studentEmails
        });
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
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                width: '90%',
                maxWidth: '500px',
                position: 'relative',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                animation: 'modalFadeIn 0.3s ease'
            }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 mb-0">{isEdit ? 'Edit Classroom' : 'Create Classroom'}</h2>
                    <button onClick={onClose} className="btn-close"></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Classroom Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                required
                            />
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Subject</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                required
                            />
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151'
                            }}>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows="4"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Student Emails (comma-separated)
                            </label>
                            <textarea
                                value={formData.studentEmails}
                                onChange={(e) => setFormData({...formData, studentEmails: e.target.value})}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows="3"
                                placeholder="student1@example.com, student2@example.com"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Optional: Enter student emails to send invitations
                            </p>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            {isEdit ? 'Update Classroom' : 'Create Classroom'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateClassroomModal;