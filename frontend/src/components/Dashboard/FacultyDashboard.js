import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';
import AssignmentModal from '../Assignment/AssignmentModal';
import AssignmentList from '../Assignment/AssignmentList';
import GradeSubmissionModal from '../Assignment/GradeSubmissionModal';
import CreateClassroomModal from '../Classroom/CreateClassroomModal';

const FacultyDashboard = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        description: ''
    });
    const { logout, userName, userRole } = useAuth();
    const navigate = useNavigate();
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [assignments, setAssignments] = useState([]);

    const fetchClassrooms = useCallback(async () => {
        try {
            setLoading(true);
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.get('http://localhost:9000/api/faculty/classrooms', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-Session-ID': sessionId
                }
            });

            if (response.data.success) {
                setClassrooms(response.data.classrooms);
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
                if (userRole !== 'Faculty') {
                    navigate('/login');
                    return;
                }
                await fetchClassrooms();
            } catch (error) {
                console.error('Auth check failed:', error);
                navigate('/login');
            }
        };
        
        checkAuth();
    }, [userRole, navigate, fetchClassrooms]);

    const handleCreateClassroom = async (formData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                'http://localhost:9000/api/faculty/classrooms',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Classroom created successfully');
                await fetchClassrooms();
                setShowCreateModal(false);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create classroom');
        }
    };

    const handleUpdateClassroom = async (formData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.put(
                `http://localhost:9000/api/faculty/classrooms/${selectedClassroom._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Classroom updated successfully');
                await fetchClassrooms();
                setShowEditModal(false);
                setSelectedClassroom(null);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update classroom');
        }
    };

    const handleDeleteClassroom = async (classroomId) => {
        if (window.confirm('Are you sure you want to delete this classroom?')) {
            try {
                const sessionId = sessionStorage.getItem('sessionId');
                const token = sessionStorage.getItem(`token_${sessionId}`);

                const response = await axios.delete(
                    `http://localhost:9000/api/faculty/classrooms/${classroomId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Classroom deleted successfully');
                    await fetchClassrooms();
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete classroom');
            }
        }
    };

    const handleRemoveStudent = async (classroomId, studentId) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.delete(
                `http://localhost:9000/api/faculty/classrooms/${classroomId}/students/${studentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Student removed successfully');
                await fetchClassrooms();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to remove student');
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

    const fetchAssignments = async (classroomId) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.get(
                `http://localhost:9000/api/faculty/classrooms/${classroomId}/assignments`,
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

    const handleCreateAssignment = async (assignmentData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.post(
                `http://localhost:9000/api/faculty/classrooms/${selectedClassroom._id}/assignments`,
                assignmentData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Assignment created successfully');
                setShowAssignmentModal(false);
                await fetchAssignments(selectedClassroom._id);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create assignment');
        }
    };

    const handleGradeSubmission = async (gradeData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.put(
                `http://localhost:9000/api/faculty/assignments/${selectedAssignment._id}/submissions/${selectedSubmission._id}`,
                gradeData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Submission graded successfully');
                setShowGradeModal(false);
                setSelectedAssignment(null);
                setSelectedSubmission(null);
                await fetchAssignments(selectedClassroom._id);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to grade submission');
        }
    };

    const renderClassroomActions = (classroom) => (
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => {
                    setSelectedClassroom(classroom);
                    setFormData({
                        name: classroom.name,
                        subject: classroom.subject,
                        description: classroom.description
                    });
                    setShowEditModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
            >
                Edit
            </button>
            <button
                onClick={() => handleDeleteClassroom(classroom._id)}
                className="text-red-600 hover:text-red-800 text-sm"
            >
                Delete
            </button>
        </div>
    );

    const renderStudentList = () => (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Enrolled Students</h3>
            {selectedClassroom?.students?.length > 0 ? (
                <ul className="space-y-2">
                    {selectedClassroom.students.map(student => (
                        <li key={student._id} className="flex justify-between items-center">
                            <span>{student.name} ({student.email})</span>
                            <button
                                onClick={() => handleRemoveStudent(selectedClassroom._id, student._id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No students enrolled yet</p>
            )}
        </div>
    );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
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
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                            >
                                Create
                            </button>
                        </div>
                        <div className="space-y-2">
                            {classrooms.map(classroom => (
                                <div key={classroom._id} className="border-b pb-2">
                                    <button
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
                                    {renderClassroomActions(classroom)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Classroom Details and Assignments */}
                    <div className="md:col-span-3">
                        {selectedClassroom ? (
                            <>
                                <div className="bg-white rounded-lg shadow p-6 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-semibold">{selectedClassroom.name}</h2>
                                        <button
                                            onClick={() => setShowAssignmentModal(true)}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        >
                                            Create Assignment
                                        </button>
                                    </div>
                                    <p className="text-gray-600">{selectedClassroom.description}</p>
                                    <p className="text-sm text-gray-500 mt-2">Room Code: {selectedClassroom.roomCode}</p>
                                    {renderStudentList()}
                                </div>

                                {/* Assignments List */}
                                <AssignmentList
                                    assignments={assignments}
                                    onGrade={(assignmentId, submission) => {
                                        setSelectedAssignment(assignments.find(a => a._id === assignmentId));
                                        setSelectedSubmission(submission);
                                        setShowGradeModal(true);
                                    }}
                                />
                            </>
                        ) : (
                            <div className="text-center text-gray-500">
                                Select a classroom to view details
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals */}
            {showCreateModal && (
                <CreateClassroomModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateClassroom}
                />
            )}

            {showEditModal && selectedClassroom && (
                <CreateClassroomModal
                    classroom={selectedClassroom}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedClassroom(null);
                    }}
                    onSubmit={handleUpdateClassroom}
                    isEditing={true}
                />
            )}

            {showAssignmentModal && selectedClassroom && (
                <AssignmentModal
                    classroom={selectedClassroom}
                    onClose={() => setShowAssignmentModal(false)}
                    onSubmit={handleCreateAssignment}
                />
            )}

            {showGradeModal && selectedAssignment && selectedSubmission && (
                <GradeSubmissionModal
                    assignment={selectedAssignment}
                    submission={selectedSubmission}
                    onClose={() => {
                        setShowGradeModal(false);
                        setSelectedAssignment(null);
                        setSelectedSubmission(null);
                    }}
                    onSubmit={handleGradeSubmission}
                />
            )}
        </div>
    );
};

export default FacultyDashboard;