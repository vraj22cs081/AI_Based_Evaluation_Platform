import React, { useState } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { getBaseUrl } from '../../config/api.config';

const GradeSubmissionModal = ({ assignment, submission, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        grade: submission?.grade || '',
        feedback: submission?.feedback || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            if (!formData.grade || formData.grade > assignment.maxMarks || formData.grade < 0) {
                throw new Error(`Grade must be between 0 and ${assignment.maxMarks}`);
            }

            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting grade:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
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
                {error && (
                    <div className="alert alert-danger mb-3">{error}</div>
                )}
                <div className="modal-header" style={{
                    borderBottom: '1px solid #e5e7eb',
                    padding: '1rem 0',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#1f2937'
                    }}>Grade Submission</h2>
                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            border: 'none',
                            background: 'none',
                            fontSize: '1.5rem',
                            color: '#6b7280',
                            cursor: 'pointer'
                        }}
                    >&times;</button>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#374151' }}>{assignment.title}</h3>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        Maximum Marks: {assignment.maxMarks}
                    </p>
                </div>

                <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                    }}>
                        <h4 style={{ 
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#4b5563'
                        }}>Student Submission</h4>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }}>
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </span>
                    </div>

                    {submission.submissionUrl && (
                        <a
                            href={getBaseUrl(`${submission.submissionUrl}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm d-flex align-items-center gap-2"
                            style={{
                                width: 'fit-content',
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                transition: 'all 0.2s ease',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#e5e7eb';
                                e.currentTarget.style.color = '#1f2937';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.color = '#4b5563';
                            }}
                        >
                            <i className="bi bi-file-earmark-text" style={{ color: '#6366f1' }}></i>
                            View Submission Document
                        </a>
                    )}
                </div>

                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px'
                    }}>
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151'
                                }}>Grade (out of {assignment.maxMarks})</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={assignment.maxMarks}
                                    value={formData.grade}
                                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
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
                                }}>Feedback</label>
                                <textarea
                                    value={formData.feedback}
                                    onChange={(e) => setFormData({...formData, feedback: e.target.value})}
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

                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '1rem',
                                marginTop: '2rem'
                            }}>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={loading}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.375rem',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        opacity: loading ? '0.5' : '1'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.375rem',
                                        border: 'none',
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        cursor: 'pointer',
                                        opacity: loading ? '0.5' : '1'
                                    }}
                                >
                                    {loading ? 'Saving...' : 'Submit Grade'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default GradeSubmissionModal;