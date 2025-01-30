// Updated StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';
import StudentAssignmentView from '../Assignment/StudentAssignmentView';
import AssignmentSubmissionModal from '../Assignment/AssignmentSubmissionModal';
import JoinClassroomModal from '../Classroom/JoinClassroomModal';

const StudentDashboard = () => {
    const [enrolledClassrooms, setEnrolledClassrooms] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const { logout, userName, userRole } = useAuth();
    const navigate = useNavigate();

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
                setAssignments(response.data.assignments);
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
                { submissionUrl: fileUrl },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Assignment submitted successfully');
                setShowSubmissionModal(false);
                setSelectedAssignment(null);
                await fetchAssignments(selectedClassroom._id);
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
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to join classroom');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Student Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span>Welcome, {userName}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-4">
                {error && (
                    <Notification 
                        type="error" 
                        message={error} 
                        onClose={() => setError('')}
                    />
                )}
                {success && (
                    <Notification 
                        type="success" 
                        message={success} 
                        onClose={() => setSuccess('')}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Classroom List */}
                    <div className="md:col-span-1 bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">My Classrooms</h2>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                                Join Class
                            </button>
                        </div>
                        <div className="space-y-2">
                            {enrolledClassrooms.map(classroom => (
                                <button
                                    key={classroom._id}
                                    onClick={() => {
                                        setSelectedClassroom(classroom);
                                        fetchAssignments(classroom._id);
                                    }}
                                    className={`w-full text-left p-2 rounded ${
                                        selectedClassroom?._id === classroom._id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50'
                                    }`}
                                >
                                    {classroom.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assignments View */}
                    <div className="md:col-span-3">
                        {selectedClassroom ? (
                            <>
                                <h2 className="text-xl font-semibold mb-4">
                                    Assignments for {selectedClassroom.name}
                                </h2>
                                <StudentAssignmentView
                                    assignments={assignments}
                                    onSubmit={(assignment) => {
                                        setSelectedAssignment(assignment);
                                        setShowSubmissionModal(true);
                                    }}
                                />
                            </>
                        ) : (
                            <div className="text-center text-gray-500">
                                Select a classroom to view assignments
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Assignment Submission Modal */}
            {showSubmissionModal && selectedAssignment && (
                <AssignmentSubmissionModal
                    assignment={selectedAssignment}
                    onClose={() => {
                        setShowSubmissionModal(false);
                        setSelectedAssignment(null);
                    }}
                    onSubmit={handleSubmitAssignment}
                />
            )}

            {/* Join Classroom Modal */}
            {showJoinModal && (
                <JoinClassroomModal
                    onClose={() => setShowJoinModal(false)}
                    onSubmit={handleJoinClassroom}
                />
            )}
        </div>
    );
};

export default StudentDashboard;