import React, { useState } from 'react';

const JoinClassroomModal = ({ onClose, onSubmit }) => {
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roomCode.trim()) {
            setError('Please enter a room code');
            return;
        }
        onSubmit(roomCode.trim().toUpperCase());
    };

    const modalStyles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000
        },
        container: {
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            maxWidth: '28rem',
            width: '100%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            animation: 'modalFade 0.3s ease-out'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#2d3748'
        },
        formGroup: {
            marginBottom: '1rem'
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#4a5568',
            marginBottom: '0.5rem'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #e2e8f0',
            marginTop: '0.25rem',
            outline: 'none',
            transition: 'border-color 0.2s ease',
        },
        error: {
            color: '#e53e3e',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
        },
        buttonContainer: {
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
        },
        cancelButton: {
            padding: '0.5rem 1rem',
            color: '#4a5568',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        submitButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }
    };

    const styleTag = document.createElement('style');
    styleTag.textContent = `
        @keyframes modalFade {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(styleTag);

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.container}>
                <h2 style={modalStyles.title}>Join Classroom</h2>
                
                <form onSubmit={handleSubmit}>
                    <div style={modalStyles.formGroup}>
                        <label style={modalStyles.label}>Room Code</label>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => {
                                setRoomCode(e.target.value);
                                setError('');
                            }}
                            style={{
                                ...modalStyles.input,
                                borderColor: error ? '#fc8181' : '#e2e8f0'
                            }}
                            placeholder="Enter room code"
                            required
                        />
                        {error && (
                            <p style={modalStyles.error}>{error}</p>
                        )}
                    </div>

                    <div style={modalStyles.buttonContainer}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={modalStyles.cancelButton}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#edf2f7'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#f7fafc'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={modalStyles.submitButton}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
                        >
                            Join Classroom
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinClassroomModal;