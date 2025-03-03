// Updated StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';
import StudentAssignmentView from '../Assignment/StudentAssignmentView';
import AssignmentSubmissionModal from '../Assignment/AssignmentSubmissionModal';
import JoinClassroomModal from '../Classroom/JoinClassroomModal';
import Header from '../header/Header';
import { useUpdate } from '../../context/UpdateContext';


const StudentDashboard = () => {
    const [enrolledClassrooms, setEnrolledClassrooms] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showSubmissionView, setShowSubmissionView] = useState(false);
    const { userName, logout, userRole } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { updateTrigger, triggerUpdate } = useUpdate();

    // Add state for assignment counts
    const [assignmentCounts, setAssignmentCounts] = useState({});

    // Fetch assignment counts for each classroom
    const fetchAssignmentCount = async (classroomId) => {
        try {
            const response = await axios.get(`/api/classrooms/${classroomId}/assignments/count`);
            setAssignmentCounts(prev => ({
                ...prev,
                [classroomId]: response.data.count
            }));
        } catch (error) {
            console.error('Error fetching assignment count:', error);
        }
    };

    // Handle classroom exit
    const handleExitClassroom = async (classroomId, e) => {
        e.stopPropagation(); // Prevent card click event
        
        if (window.confirm('Are you sure you want to exit this classroom?')) {
            try {
                const sessionId = sessionStorage.getItem('sessionId');
                const token = sessionStorage.getItem(`token_${sessionId}`);

                const response = await axios.post(
                    `http://localhost:9000/api/student/classrooms/${classroomId}/exit`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (response.data.success) {
                    setEnrolledClassrooms(prev => 
                        prev.filter(classroom => classroom._id !== classroomId)
                    );
                    setSuccess('Successfully exited the classroom');
                    setSelectedClassroom(null);
                    triggerUpdate();
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to exit classroom');
            }
        }
    };

    // Wrap fetchEnrolledClassrooms in useCallback
    const fetchEnrolledClassrooms = useCallback(async () => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.get('http://localhost:9000/api/student/classrooms/enrolled', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Session-ID': sessionId
                }
            });

            if (response.data.success) {
                setEnrolledClassrooms(response.data.classrooms);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch classrooms');
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (userRole !== 'Student') {
                    navigate('/login');
                    return;
                }
                await fetchEnrolledClassrooms();
            } catch (error) {
                console.error('Auth check failed:', error);
                navigate('/login');
            }
        };
        
        checkAuth();
    }, [userRole, navigate, fetchEnrolledClassrooms]);

    useEffect(() => {
        if (updateTrigger > 0) {
            const timer = setTimeout(async () => {
                await fetchEnrolledClassrooms();
                if (selectedClassroom) {
                    await fetchAssignments(selectedClassroom._id);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [updateTrigger, selectedClassroom, fetchEnrolledClassrooms]);

    const fetchAssignments = async (classroomId) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.get(
                `http://localhost:9000/api/student/classrooms/${classroomId}/assignments`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setAssignments(response.data.assignments.map(assignment => ({
                    ...assignment,
                    maxMarks: assignment.maxMarks || 0,
                    submission: assignment.submission || null
                })));
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch assignments');
        }
    };

    const handleSubmitAssignment = async (fileUrl) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                `http://localhost:9000/api/student/assignments/${selectedAssignment._id}/submit`,
                { submissionFile: fileUrl },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Assignment submitted successfully');
                setShowSubmissionModal(false);
                setSelectedAssignment(null);
                setSearchParams({});
                triggerUpdate();
                // Reset selected classroom and redirect
                setSelectedClassroom(null);
                navigate('/student/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit assignment');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            setError('Logout failed');
        }
    };

    const handleJoinClassroom = async (roomCode) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                'http://localhost:9000/api/student/classrooms/join',
                { roomCode },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Successfully joined classroom');
                await fetchEnrolledClassrooms();
                setShowJoinModal(false);
                triggerUpdate();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to join classroom');
        }
    };

    // Add this function with your other handlers
    const handleViewSubmission = (assignment) => {
        // For now, just show the submission modal with the submitted assignment
        setSelectedAssignment(assignment);
        setShowSubmissionView(true);
        // Add assignment ID to URL
        setSearchParams({ modal: 'submit', assignmentId: assignment._id });
    };

    // Add this useEffect to handle URL parameters
    useEffect(() => {
        const modal = searchParams.get('modal');
        const assignmentId = searchParams.get('assignmentId');

        if (modal === 'submit' && assignmentId) {
            // Find the assignment from your assignments array
            const assignment = assignments.find(a => a._id === assignmentId);
            if (assignment) {
                setSelectedAssignment(assignment);
                setShowSubmissionView(true);
            }
        }
    }, [searchParams, assignments]);

    // Modify your modal close handler
    const handleCloseModal = () => {
        setShowSubmissionView(false);
        setSelectedAssignment(null);
        // Remove parameters from URL
        setSearchParams({});
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="relative">
            <div className="min-vh-100 bg-light">
                <Header />
                
                <div className="container-fluid pt-4" style={{ 
    marginTop: '80px', 
    paddingLeft: '5px',    // Reduced from 10px
    paddingRight: '5px',   // Reduced from 10px
    maxWidth: '98%',       // This will create some margin on both sides
    margin: '80px auto 0'  // Centers the container and maintains top margin
}}>
                    {error && <Notification type="error" message={error} onClose={() => setError('')} />}
                    {success && <Notification type="success" message={success} onClose={() => setSuccess('')} />}

                    {/* Welcome Section */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="mb-1">Welcome back, {userName}</h2>
                                <p className="text-muted mb-0">{enrolledClassrooms.length} Active Classrooms</p>
                            </div>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="btn btn-primary px-4"
                                style={{
                                    background: '#6366f1',
                                    borderColor: '#6366f1',
                                    borderRadius: '8px'
                                }}
                            >
                                + Join Classroom
                            </button>
                        </div>
                    </div>

                    {!selectedClassroom ? (
                        // Classroom Cards Grid
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {enrolledClassrooms.map((classroom, index) => (
                                <div className="col" key={classroom._id}>
                                    <div 
                                        className="card h-100 border-0 shadow-sm"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            setSelectedClassroom(classroom);
                                            fetchAssignments(classroom._id);
                                        }}
                                    >
                                        {/* Colored Header */}
                                        <div 
                                            className="card-header border-0 text-white py-5 text-center"
                                            style={{
                                                background: getBackgroundColor(index),
                                                borderRadius: '12px 12px 0 0'
                                            }}
                                        >
                                            <h3 className="display-4 mb-2">{classroom.name}</h3>
                                            <span className="badge bg-white bg-opacity-25">
                                                {classroom.subject}
                                            </span>
                                        </div>

                                        {/* Room Code Footer */}
                                        <div className="card-footer bg-light border-0 py-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <small className="text-muted">Room Code:</small>
                                                    <span className="ms-2 fw-semibold">{classroom.roomCode}</span>
                                                </div>
                                                <button 
                                                    className="btn btn-link text-danger p-0"
                                                    onClick={(e) => handleExitClassroom(classroom._id, e)}
                                                >
                                                    Exit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Modern Assignments View with Cards
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <h4 className="mb-1">{selectedClassroom.name}</h4>
                                        <p className="text-muted mb-0">
                                            {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <button 
                                        className="btn btn-light d-flex align-items-center gap-2"
                                        onClick={() => setSelectedClassroom(null)}
                                    >
                                        <i className="bi bi-arrow-left"></i>
                                        Back
                                    </button>
                                </div>

                                {showSubmissionView && selectedAssignment ? (
                                    <div className="w-full max-w-2xl mx-auto bg-white rounded shadow">
                                        <AssignmentSubmissionModal
                                            assignment={selectedAssignment}
                                            onClose={handleCloseModal}
                                            onSubmit={handleSubmitAssignment}
                                        />
                                    </div>
                                ) : (
                                    // Show assignment cards
                                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                                        {assignments.map((assignment) => (
                                            <div className="col" key={assignment._id}>
                                                <div 
                                                    className="card h-100 border-0 shadow-sm hover-shadow"
                                                    style={{ 
                                                        transition: 'all 0.3s ease',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#f8faff'
                                                    }}
                                                >
                                                    {/* Assignment Header with Color */}
                                                    <div 
                                                        className="card-header border-0 p-4"
                                                        style={{
                                                            background: getAssignmentColor(assignment.title[0]),
                                                            borderRadius: '12px 12px 0 0'
                                                        }}
                                                    >
                                                        <div className="d-flex flex-column">
                                                            <h5 className="text-white mb-2 fw-bold">{assignment.title}</h5>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="badge bg-white bg-opacity-25">
                                                                    {assignment.maxMarks || 0} Points
                                                                </div>
                                                                <span className={`badge ${
                                                                    assignment.submission 
                                                                        ? 'bg-success' 
                                                                        : isAssignmentOverdue(assignment.dueDate)
                                                                            ? 'bg-danger'
                                                                            : 'bg-white text-dark'
                                                                }`}>
                                                                    {assignment.submission 
                                                                        ? 'Submitted' 
                                                                        : isAssignmentOverdue(assignment.dueDate)
                                                                            ? 'Overdue'
                                                                            : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="card-body p-4" style={{ backgroundColor: '#f8faff' }}>
                                                        {/* Due Date with Consistent Format */}
                                                        <div className="d-flex align-items-center mb-3">
                                                            <i className="bi bi-calendar3 me-2 text-muted"></i>
                                                            <div>
                                                                <div className="text-muted">
                                                                    Due: {formatDate(assignment.dueDate)}
                                                                </div>
                                                                <small className={`${
                                                                    isAssignmentOverdue(assignment.dueDate)
                                                                        ? 'text-danger'
                                                                        : 'text-success'
                                                                }`}>
                                                                    {getFormattedTimeRemaining(assignment.dueDate)}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        <p className="card-text mb-4" style={{ fontSize: '0.95rem' }}>
                                                            {assignment.description || 'No description provided'}
                                                        </p>

                                                        {/* Faculty Assignment File */}
                                                        {assignment.assignmentFile && (
                                                            <div className="mb-4">
                                                                <h6 className="text-muted mb-2" style={{
                                                                    color: '#4b5563',
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    <i className="bi bi-file-earmark-text me-2" style={{ color: '#6366f1' }}></i>
                                                                    Assignment Document
                                                                </h6>
                                                                <a
                                                                    href={`http://localhost:9000${assignment.assignmentFile}`}
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
                                                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
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
                                                                    <i className="bi bi-download" style={{ color: '#6366f1' }}></i>
                                                                    Reference Document
                                                                </a>
                                                            </div>
                                                        )}

                                                        {/* Marks and Submission Status */}
                                                        <div className="mb-4">
                                                            <div className="d-flex justify-content-between align-items-center p-3 rounded"
                                                                 style={{ backgroundColor: '#ffffff' }}>
                                                                <div>
                                                                    <h6 className="mb-1">Marks</h6>
                                                                    {assignment.submission && assignment.submission.grade !== undefined ? (
                                                                        <span className="text-success fw-semibold">
                                                                            {assignment.submission.grade} / {assignment.maxMarks}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted">
                                                                            -- / {assignment.maxMarks}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {assignment.submission && assignment.submission.feedback && (
                                                                    <div>
                                                                        <h6 className="mb-1">Feedback</h6>
                                                                        <small className="text-muted">
                                                                            {assignment.submission.feedback}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Submission Status or Submit Button */}
                                                        {assignment.submission ? (
                                                            <div className="p-3 rounded" style={{ backgroundColor: '#ffffff' }}>
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <small className="text-muted d-block">
                                                                            Submitted: {formatDate(assignment.submission.submittedAt)}
                                                                        </small>
                                                                        {assignment.submission.submissionUrl && (
                                                                            <a 
                                                                                href={`http://localhost:9000${assignment.submission.submissionUrl}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-link btn-sm p-0 text-primary"
                                                                            >
                                                                                View Submission
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setShowSubmissionView(true);
                                                                }}
                                                                className={`btn w-100 ${
                                                                    assignment.submission 
                                                                        ? isAssignmentOverdue(assignment.dueDate)
                                                                            ? 'btn-secondary disabled'
                                                                            : 'btn-warning' 
                                                                        : isAssignmentOverdue(assignment.dueDate)
                                                                            ? 'btn-outline-danger'
                                                                            : 'btn-primary'
                                                                }`}
                                                                disabled={isAssignmentOverdue(assignment.dueDate) && assignment.submission}
                                                            >
                                                                <i className={`bi ${
                                                                    assignment.submission 
                                                                        ? isAssignmentOverdue(assignment.dueDate)
                                                                            ? 'bi-check-circle'
                                                                            : 'bi-arrow-repeat' 
                                                                        : 'bi-upload'
                                                                } me-2`}></i>
                                                                {assignment.submission 
                                                                    ? isAssignmentOverdue(assignment.dueDate)
                                                                        ? 'Submitted'
                                                                        : 'Resubmit' 
                                                                    : isAssignmentOverdue(assignment.dueDate)
                                                                        ? 'Deadline Passed'
                                                                        : 'Submit Assignment'
                                                                }
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Move modals here and update styling */}
            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <JoinClassroomModal
                            onClose={() => setShowJoinModal(false)}
                            onSubmit={handleJoinClassroom}
                        />
                    </div>
                </div>
            )}

            {showSubmissionModal && selectedAssignment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AssignmentSubmissionModal
                            assignment={selectedAssignment}
                            onClose={() => {
                                setShowSubmissionModal(false);
                                setSelectedAssignment(null);
                                setSearchParams({});
                                setSelectedClassroom(null);
                            }}
                            triggerUpdate={triggerUpdate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function for background colors
const getBackgroundColor = (index) => {
    const colors = [
        '#4F46E5', // Indigo
        '#7C3AED', // Purple
        '#2563EB', // Blue
        '#059669', // Emerald
        '#DC2626', // Red
        '#0891B2', // Cyan
        '#2E3280', // Dark Blue
        '#7E22CE', // Purple
        '#0369A1', // Sky Blue
        '#BE123C'  // Rose
    ];
    return colors[index % colors.length];
};

// Add this helper function at the top of your file or with other helper functions
const isAssignmentOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
};

// Helper functions
const getAssignmentColor = (letter) => {
    const colors = {
        'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1',
        'D': '#96CEB4', 'E': '#4A90E2', 'F': '#9B59B6',
        'G': '#3498DB', 'H': '#1ABC9C', 'I': '#F1C40F',
        'J': '#E74C3C', 'K': '#2ECC71', 'L': '#34495E',
        'M': '#16A085', 'N': '#27AE60', 'O': '#2980B9',
        'P': '#8E44AD', 'Q': '#2C3E50', 'R': '#F39C12',
        'S': '#D35400', 'T': '#C0392B', 'U': '#7F8C8D',
        'V': '#BDC3C7', 'W': '#95A5A6', 'X': '#6C7A89',
        'Y': '#D24D57', 'Z': '#674172'
    };
    return colors[letter.toUpperCase()] || '#4361ee';
};

const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        pdf: 'file-pdf',
        doc: 'file-word',
        docx: 'file-word',
        xls: 'file-excel',
        xlsx: 'file-excel',
        ppt: 'file-ppt',
        pptx: 'file-ppt',
        jpg: 'file-image',
        jpeg: 'file-image',
        png: 'file-image',
        txt: 'file-text',
        zip: 'file-zip'
    };
    return icons[ext] || 'file-earmark';
};

const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) return 'Past due';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    return 'Due soon';
};

// Add these helper functions
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getFormattedTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (now > due) return 'Past due';
    
    const diffTime = Math.abs(due - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    }
    if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
    return 'Due soon';
};

export default StudentDashboard;
