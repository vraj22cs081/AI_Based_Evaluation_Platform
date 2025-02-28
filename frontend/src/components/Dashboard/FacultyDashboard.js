import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';
import AssignmentModal from '../Assignment/AssignmentModal';
import GradeSubmissionModal from '../Assignment/GradeSubmissionModal';
import CreateClassroomModal from '../Classroom/CreateClassroomModal';
import Header from '../header/Header';
import './Dashboard.css';
import { useUpdate } from '../../context/UpdateContext';

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
        description: '',
        studentEmails: []
    });
    const { logout, userName, userRole } = useAuth();
    const navigate = useNavigate();
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [activeView, setActiveView] = useState('assignments');
    const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [showSubmissions, setShowSubmissions] = useState(false);
    const { updateTrigger, triggerUpdate } = useUpdate();

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

    const getAssignmentColor = (letter) => {
        const colors = {
            'A': '#4F46E5', // Indigo
            'B': '#2563EB', // Blue
            'C': '#0891B2', // Cyan
            'D': '#059669', // Emerald
            'E': '#0369A1', // Sky Blue
            'F': '#7C3AED', // Purple
            'G': '#BE123C', // Rose
            'H': '#2E3280', // Dark Blue
            'I': '#7E22CE', // Purple
            'J': '#DC2626', // Red
            'K': '#0369A1', // Sky Blue
            'L': '#4F46E5', // Indigo
            'M': '#2563EB', // Blue
            'N': '#059669', // Emerald
            'O': '#0891B2', // Cyan
            'P': '#7C3AED', // Purple
            'Q': '#BE123C', // Rose
            'R': '#2E3280', // Dark Blue
            'S': '#7E22CE', // Purple
            'T': '#DC2626', // Red
            'U': '#0369A1', // Sky Blue
            'V': '#4F46E5', // Indigo
            'W': '#2563EB', // Blue
            'X': '#059669', // Emerald
            'Y': '#0891B2', // Cyan
            'Z': '#7C3AED'  // Purple
        };
        return colors[letter.toUpperCase()] || '#4F46E5'; // Default color
    };

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
        const diff = due - now;

        if (diff < 0) return 'Past due';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days} days remaining`;
        if (hours > 0) return `${hours} hours remaining`;
        return 'Due soon';
    };

    const getTimeRemainingClass = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        return due < now ? 'text-danger' : 'text-success';
    };

    // Add this function at the top of the file with other utility functions
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Update the fetchClassrooms function to include assignments count
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
                // Fetch assignments for each classroom
                const classroomsWithData = await Promise.all(
                    response.data.classrooms.map(async (classroom) => {
                        const assignmentsResponse = await axios.get(
                            `http://localhost:9000/api/faculty/classrooms/${classroom._id}/assignments`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'X-Session-ID': sessionId
                                }
                            }
                        );
                        return {
                            ...classroom,
                            assignmentsCount: assignmentsResponse.data.assignments?.length || 0
                        };
                    })
                );
                setClassrooms(classroomsWithData);
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

    useEffect(() => {
        if (updateTrigger > 0) {
            const timer = setTimeout(async () => {
                if (selectedClassroom) {
                    // Fetch updated assignments
                    await fetchAssignments(selectedClassroom._id);
                } else {
                    // Fetch updated classrooms list
                    await fetchClassrooms();
                }
            }, 1000); // Reduced timeout for faster refresh

            return () => clearTimeout(timer);
        }
    }, [updateTrigger, selectedClassroom]);

    // Add this useEffect to handle assignment updates
    useEffect(() => {
        const refreshAssignments = async () => {
            if (selectedClassroom && showSubmissions) {
                const updatedAssignments = await fetchAssignments(selectedClassroom._id);
                if (selectedAssignment) {
                    const updatedAssignment = updatedAssignments?.find(
                        a => a._id === selectedAssignment._id
                    );
                    if (updatedAssignment) {
                        setSelectedAssignment(updatedAssignment);
                    }
                }
            }
        };

        refreshAssignments();
    }, [updateTrigger]);

    // Modify handleCreateClassroom
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
                // Show success notification
                setSuccess('Classroom created successfully');
                setShowCreateModal(false);
                
                // Update local state immediately
                setClassrooms(prevClassrooms => [...prevClassrooms, response.data.classroom]);
                
                // Trigger background refresh
                triggerUpdate();
                
                // Fetch fresh data after a short delay
                setTimeout(async () => {
                    await fetchClassrooms();
                }, 1000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create classroom');
        }
    };

    // Modify handleUpdateClassroom
    const handleUpdateClassroom = async (updatedData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.put(
                `http://localhost:9000/api/faculty/classrooms/${selectedClassroom._id}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                // Show success notification
                setSuccess('Classroom updated successfully');
                setShowEditModal(false);
                
                // Update local state immediately
                setClassrooms(prevClassrooms => 
                    prevClassrooms.map(classroom => 
                        classroom._id === selectedClassroom._id 
                            ? { ...classroom, ...updatedData }
                            : classroom
                    )
                );
                
                // Update selected classroom if viewing it
                if (selectedClassroom) {
                    setSelectedClassroom(prev => ({
                        ...prev,
                        ...updatedData
                    }));
                }
                
                // Trigger background refresh
                triggerUpdate();
                
                // Fetch fresh data after a short delay
                setTimeout(async () => {
                    await fetchClassrooms();
                }, 1000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update classroom');
        }
    };

    // Modify handleDeleteClassroom
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
                    // Show success notification
                    setSuccess('Classroom deleted successfully');
                    
                    // Update local state immediately
                    setClassrooms(prevClassrooms => 
                        prevClassrooms.filter(classroom => classroom._id !== classroomId)
                    );
                    
                    // If viewing the deleted classroom, go back to list
                    if (selectedClassroom?._id === classroomId) {
                        setSelectedClassroom(null);
                    }
                    
                    // Trigger background refresh
                    triggerUpdate();
                    
                    // Fetch fresh data after a short delay
                    setTimeout(async () => {
                        await fetchClassrooms();
                    }, 1000);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete classroom');
            }
        }
    };

    const handleRemoveStudent = async (classroomId, studentId) => {
        if (window.confirm('Are you sure you want to remove this student?')) {
            try {
                const sessionId = sessionStorage.getItem('sessionId');
                const token = sessionStorage.getItem(`token_${sessionId}`);

                const response = await axios.delete(
                    `http://localhost:9000/api/faculty/classrooms/${classroomId}/students/${studentId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Student removed successfully');
                    // Update the local state immediately
                    setSelectedClassroom(prevClassroom => ({
                        ...prevClassroom,
                        students: prevClassroom.students.filter(student => student._id !== studentId)
                    }));
                    // Trigger global update
                    triggerUpdate();
                    // Force refresh classroom data
                    setTimeout(async () => {
                        await fetchClassrooms();
                        if (selectedClassroom) {
                            const updatedClassroomResponse = await axios.get(
                                `http://localhost:9000/api/faculty/classrooms/${classroomId}`,
                                {
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'X-Session-ID': sessionId
                                    }
                                }
                            );
                            if (updatedClassroomResponse.data.success) {
                                setSelectedClassroom(updatedClassroomResponse.data.classroom);
                            }
                        }
                    }, 1000);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to remove student');
            }
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

    const handleCreateAssignment = async (formData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            // Upload file first if it exists
            if (formData.get('assignmentFile')) {
                const fileFormData = new FormData();
                fileFormData.append('file', formData.get('assignmentFile'));

                const uploadResponse = await axios.post(
                    'http://localhost:9000/api/faculty/upload',
                    fileFormData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Session-ID': sessionId,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (uploadResponse.data.success) {
                    formData.set('assignmentFile', uploadResponse.data.fileUrl);
                }
            }

            const response = await axios.post(
                `http://localhost:9000/api/faculty/classrooms/${selectedClassroom._id}/assignments`,
                {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    dueDate: formData.get('dueDate'),
                    maxMarks: formData.get('maxMarks'),
                    assignmentFile: formData.get('assignmentFile')
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Assignment created successfully');
                setShowAssignmentModal(false);
                await fetchAssignments(selectedClassroom._id);
                triggerUpdate();
            }
        } catch (error) {
            console.error('Assignment creation error:', error);
            setError(error.response?.data?.message || 'Failed to create assignment');
            throw error;
        }
    };

    // Add this function after handleCreateAssignment
    const handleDeleteAssignment = async (assignmentId) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                const sessionId = sessionStorage.getItem('sessionId');
                const token = sessionStorage.getItem(`token_${sessionId}`);

                const response = await axios.delete(
                    `http://localhost:9000/api/faculty/assignments/${assignmentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'X-Session-ID': sessionId
                        }
                    }
                );

                if (response.data.success) {
                    setSuccess('Assignment deleted successfully');
                    await fetchAssignments(selectedClassroom._id);
                    triggerUpdate();
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to delete assignment');
            }
        }
    };

    // Modify the handleGradeSubmission function
    const handleGradeSubmission = async (gradeData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            const response = await axios.put(
                `http://localhost:9000/api/faculty/assignments/${selectedAssignment._id}/submissions/${selectedSubmission._id}/grade`,
                {
                    grade: parseInt(gradeData.grade),
                    feedback: gradeData.feedback || ''
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                // Show success notification
                setSuccess('Submission graded successfully');
                
                // Close the modal
                setShowGradeModal(false);
                setSelectedSubmission(null);
                
                // Immediately update the UI
                setAssignments(prevAssignments => 
                    prevAssignments.map(assignment => {
                        if (assignment._id === selectedAssignment._id) {
                            const updatedSubmissions = assignment.submissions.map(sub => {
                                if (sub._id === selectedSubmission._id) {
                                    return {
                                        ...sub,
                                        grade: parseInt(gradeData.grade),
                                        feedback: gradeData.feedback,
                                        status: 'graded' // Update the status
                                    };
                                }
                                return sub;
                            });
                            return { ...assignment, submissions: updatedSubmissions };
                        }
                        return assignment;
                    })
                );

                // Update selected assignment if in submission view
                if (showSubmissions && selectedAssignment) {
                    setSelectedAssignment(prev => ({
                        ...prev,
                        submissions: prev.submissions.map(sub => {
                            if (sub._id === selectedSubmission._id) {
                                return {
                                    ...sub,
                                    grade: parseInt(gradeData.grade),
                                    feedback: gradeData.feedback,
                                    status: 'graded'
                                };
                            }
                            return sub;
                        })
                    }));
                }

                // Trigger background refresh
                triggerUpdate();

                // Fetch fresh data after a short delay
                setTimeout(async () => {
                    await fetchAssignments(selectedClassroom._id);
                }, 1000);
            }
        } catch (error) {
            console.error('Error grading submission:', error);
            setError(error.response?.data?.message || 'Failed to grade submission');
        }
    };

    const handleEditAssignment = async (formData) => {
        try {
            const sessionId = sessionStorage.getItem('sessionId');
            const token = sessionStorage.getItem(`token_${sessionId}`);

            // First handle file upload if there's a new file
            let assignmentFileUrl = editingAssignment.assignmentFile;
            if (formData.get('assignmentFile')) {
                const fileFormData = new FormData();
                fileFormData.append('file', formData.get('assignmentFile'));

                const uploadResponse = await axios.post(
                    'http://localhost:9000/api/faculty/upload',
                    fileFormData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'X-Session-ID': sessionId,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                if (uploadResponse.data.success) {
                    assignmentFileUrl = uploadResponse.data.fileUrl;
                }
            }

            // Now update the assignment
            const response = await axios.put(
                `http://localhost:9000/api/faculty/assignments/${editingAssignment._id}`,
                {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    dueDate: formData.get('dueDate'),
                    maxMarks: formData.get('maxMarks'),
                    assignmentFile: assignmentFileUrl
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-Session-ID': sessionId
                    }
                }
            );

            if (response.data.success) {
                setSuccess('Assignment updated successfully');
                setShowEditAssignmentModal(false);
                setEditingAssignment(null);
                await fetchAssignments(selectedClassroom._id);
                triggerUpdate();
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            setError(error.response?.data?.message || 'Failed to update assignment');
        }
    };

    const handleEditClick = (classroom, e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedClassroom(classroom); // Need this for updating
        setFormData({
            name: classroom.name || '',
            subject: classroom.subject || '',
            description: classroom.description || '',
            studentEmails: classroom.students?.map(student => student.email).join(', ') || ''
        });
        setShowEditModal(true);
    };

    const handleClassroomClick = (classroom) => {
        setSelectedClassroom(classroom);
        setActiveView('assignments');
        fetchAssignments(classroom._id);
    };

    // const renderStudentList = () => (
    //     <div className="mt-4">
    //         <h3 className="text-lg font-semibold mb-2">Enrolled Students</h3>
    //         {selectedClassroom?.students?.length > 0 ? (
    //             <ul className="space-y-2">
    //                 {selectedClassroom.students.map(student => (
    //                     <li key={student._id} className="flex justify-between items-center">
    //                         <span>{student.name} ({student.email})</span>
    //                         <button
    //                             onClick={() => handleRemoveStudent(selectedClassroom._id, student._id)}
    //                             className="text-red-600 hover:text-red-800 text-sm"
    //                         >
    //                             Remove
    //                         </button>
    //                     </li>
    //                 ))}
    //             </ul>
    //         ) : (
    //             <p className="text-gray-500">No students enrolled yet</p>
    //         )}
    //     </div>
    // );

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="relative">
            <div className="min-vh-100 bg-light">
                <Header 
                    userName={userName}
                    onLogout={handleLogout}
                />
                
                <div className="container-fluid pt-4" style={{ 
                    marginTop: '80px', 
                    paddingLeft: '5px',
                    paddingRight: '5px',
                    maxWidth: '98%',
                    margin: '80px auto 0'
                }}>
                    {error && <Notification type="error" message={error} onClose={() => setError('')} />}
                    {success && <Notification type="success" message={success} onClose={() => setSuccess('')} />}

                    {/* Welcome Section */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="mb-1">Welcome back, {userName}</h2>
                                <p className="text-muted mb-0">{classrooms.length} Active Classrooms</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn btn-primary px-4"
                                style={{
                                    background: '#6366f1',
                                    borderColor: '#6366f1',
                                    borderRadius: '8px'
                                }}
                            >
                                + Create Classroom
                            </button>
                        </div>
                    </div>

                    {!selectedClassroom ? (
                        // Classroom Cards Grid
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                            {classrooms.map((classroom, index) => (
                                <div className="col" key={classroom._id}>
                                    <div 
                                        className="card h-100 border-0 shadow-sm"
                                        onClick={() => handleClassroomClick(classroom)}
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

                                        <div className="card-body border-bottom" style={{ padding: '1rem' }}>
                                            <div className="d-flex justify-content-around">
                                                <div className="text-center">
                                                    <h6 className="mb-1" style={{ 
                                                        color: '#4b5563', 
                                                        fontSize: '0.875rem', 
                                                        fontWeight: '600' 
                                                    }}>
                                                        <i className="bi bi-people me-2" style={{ color: '#6366f1' }}></i>
                                                        Students
                                                    </h6>
                                                    <span className="fw-semibold" style={{ fontSize: '1.25rem' }}>
                                                        {classroom.students?.length || 0}
                                                    </span>
                                                </div>
                                                <div className="border-start" style={{ width: '1px', backgroundColor: '#e5e7eb' }}></div>
                                                <div className="text-center">
                                                    <h6 className="mb-1" style={{ 
                                                        color: '#4b5563', 
                                                        fontSize: '0.875rem', 
                                                        fontWeight: '600' 
                                                    }}>
                                                        <i className="bi bi-journal-text me-2" style={{ color: '#6366f1' }}></i>
                                                        Assignments
                                                    </h6>
                                                    <span className="fw-semibold" style={{ fontSize: '1.25rem' }}>
                                                        {classroom.assignmentsCount || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Room Code Footer */}
                                        <div className="card-footer bg-light border-0 py-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <small className="text-muted">Room Code:</small>
                                                    <span className="ms-2 fw-semibold">{classroom.roomCode}</span>
                                                </div>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        className="btn btn-link text-primary p-0 me-3"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleEditClick(classroom, e);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-link text-danger p-0"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteClassroom(classroom._id);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Assignments View
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <div>
                                        <h4 className="mb-1">{selectedClassroom.name}</h4>
                                        <p className="text-muted mb-0">
                                            {activeView === 'assignments' 
                                                ? `${assignments.length} Assignment${assignments.length !== 1 ? 's' : ''}`
                                                : `${selectedClassroom.students?.length || 0} Student${selectedClassroom.students?.length !== 1 ? 's' : ''}`
                                            }
                                        </p>
                                    </div>
                                    <div className="d-flex gap-3 align-items-center">
                                        {/* Toggle Buttons */}
                                        <div className="btn-group" role="group" aria-label="View toggle">
                                            <button
                                                className={`btn ${activeView === 'assignments' ? 'btn-primary' : 'btn-light'}`}
                                                onClick={() => setActiveView('assignments')}
                                                style={{
                                                    background: activeView === 'assignments' ? '#6366f1' : '#fff',
                                                    borderColor: activeView === 'assignments' ? '#6366f1' : '#e5e7eb',
                                                    color: activeView === 'assignments' ? '#fff' : '#374151'
                                                }}
                                            >
                                                <i className="bi bi-journal-text me-2"></i>
                                                Assignments
                                            </button>
                                            <button
                                                className={`btn ${activeView === 'students' ? 'btn-primary' : 'btn-light'}`}
                                                onClick={() => setActiveView('students')}
                                                style={{
                                                    background: activeView === 'students' ? '#6366f1' : '#fff',
                                                    borderColor: activeView === 'students' ? '#6366f1' : '#e5e7eb',
                                                    color: activeView === 'students' ? '#fff' : '#374151'
                                                }}
                                            >
                                                <i className="bi bi-people me-2"></i>
                                                Students
                                            </button>
                                        </div>
                                        
                                        {activeView === 'assignments' && (
                                            <button 
                                                className="btn btn-primary"
                                                onClick={() => setShowAssignmentModal(true)}
                                                style={{
                                                    background: '#6366f1',
                                                    borderColor: '#6366f1'
                                                }}
                                            >
                                                + Create Assignment
                                            </button>
                                        )}
                                        <button 
                                            className="btn btn-light d-flex align-items-center gap-2"
                                            onClick={() => {
                                                setSelectedClassroom(null);
                                                setShowSubmissions(false);
                                                setSelectedAssignment(null);
                                                setAssignments([]);
                                                setActiveView('assignments');
                                            }}
                                        >
                                            <i className="bi bi-arrow-left"></i>
                                            Back
                                        </button>
                                    </div>
                                </div>

                                {/* Content Area */}
                                {activeView === 'assignments' ? (
                                    showSubmissions ? (
                                        // Submissions View
                                        <div className="bg-white rounded-lg p-4">
                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <div>
                                                    <h4 className="mb-2">{selectedAssignment.title}</h4>
                                                    <p className="text-muted">
                                                        Total Submissions: {selectedAssignment.submissions?.length || 0}
                                                    </p>
                                                </div>
                                                <button
                                                    className="btn btn-light"
                                                    onClick={() => {
                                                        setShowSubmissions(false);
                                                        setSelectedAssignment(null);
                                                    }}
                                                >
                                                    Back to Assignments
                                                </button>
                                            </div>

                                            {selectedAssignment.submissions?.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>Student</th>
                                                                <th>Submitted On</th>
                                                                <th>Status</th>
                                                                <th>Grade</th>
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedAssignment.submissions.map((submission) => (
                                                                <tr key={submission._id}>
                                                                    <td>{submission.student.name}</td>
                                                                    <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                                                                    <td>
                                                                        <span className={`badge ${submission.grade ? 'bg-success' : 'bg-warning'}`}>
                                                                            {submission.grade ? 'Graded' : 'Pending'}
                                                                        </span>
                                                                    </td>
                                                                    <td>{submission.grade || '--'}/{selectedAssignment.maxMarks}</td>
                                                                    <td>
                                                                        <div className="d-flex gap-2">
                                                                            <a
                                                                                href={`http://localhost:9000${submission.submissionUrl}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-light"
                                                                            >
                                                                                View
                                                                            </a>
                                                                            <button
                                                                                className="btn btn-sm btn-primary"
                                                                                onClick={() => {
                                                                                    setSelectedSubmission(submission);
                                                                                    setShowGradeModal(true);
                                                                                }}
                                                                            >
                                                                                {submission.grade ? 'Update Grade' : 'Grade'}
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-muted">No submissions yet</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // Existing assignments grid view
                                        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                                            {assignments.map((assignment) => (
                                                <div className="col" key={assignment._id}>
                                                    <div 
                                                        className="card h-100 border-0 shadow-sm hover-shadow"
                                                        style={{ 
                                                            transition: 'all 0.3s ease',
                                                            backgroundColor: '#f8faff'
                                                        }}
                                                    >
                                                        {/* Colored Header Section */}
                                                        <div className="card-header border-0 p-4" style={{
                                                            background: getAssignmentColor(assignment.title[0]),
                                                            borderRadius: '12px 12px 0 0'
                                                        }}>
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="d-flex flex-column text-white">
                                                                    <h5 className="mb-2 fw-bold">{assignment.title}</h5>
                                                                    <div className="d-flex gap-2">
                                                                        <div className="badge bg-white bg-opacity-25">
                                                                            {assignment.maxMarks} Points
                                                                        </div>
                                                                        <div className="badge bg-white text-dark">
                                                                            {assignment.submissions?.length || 0} Submissions
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex gap-2">
                                                                    <button 
                                                                        className="btn btn-sm btn-light d-flex align-items-center gap-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingAssignment(assignment);
                                                                            setShowEditAssignmentModal(true);
                                                                        }}
                                                                        style={{
                                                                            fontSize: '0.875rem',
                                                                            padding: '0.25rem 0.75rem'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-pencil"></i>
                                                                        <span>Edit</span>
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm btn-light d-flex align-items-center gap-1"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (window.confirm('Are you sure you want to delete this assignment?')) {
                                                                                handleDeleteAssignment(assignment._id);
                                                                            }
                                                                        }}
                                                                        style={{
                                                                            fontSize: '0.875rem',
                                                                            padding: '0.25rem 0.75rem'
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                        <span>Delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Content Section */}
                                                        <div className="card-body p-4">
                                                            {/* Description */}
                                                            <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                                                                {assignment.description || 'No description provided'}
                                                            </p>

                                                            {/* Due Date */}
                                                            <div className="d-flex align-items-center mb-3">
                                                                <i className="bi bi-calendar3 me-2 text-muted"></i>
                                                                <div>
                                                                    <div className="text-muted">Due: {formatDate(assignment.dueDate)}</div>
                                                                    <small className={getTimeRemainingClass(assignment.dueDate)}>
                                                                        {getFormattedTimeRemaining(assignment.dueDate)}
                                                                    </small>
                                                                </div>
                                                            </div>

                                                            {/* Reference Document */}
                                                            {assignment.assignmentFile && (
                                                                <div className="mb-3">
                                                                    <a
                                                                        href={`http://localhost:9000${assignment.assignmentFile}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-light d-inline-flex align-items-center gap-2"
                                                                    >
                                                                        <i className="bi bi-file-earmark-text"></i>
                                                                        Reference Document
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* View Submissions Button */}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAssignment(assignment);
                                                                    setShowSubmissions(true);
                                                                }}
                                                                className="btn btn-primary w-100"
                                                                style={{
                                                                    background: '#6366f1',
                                                                    borderColor: '#6366f1'
                                                                }}
                                                            >
                                                                <i className="bi bi-eye me-2"></i>
                                                                View Submissions
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="mb-4">
                                            <h5 className="text-lg font-medium text-gray-900">Enrolled Students</h5>
                                            <p className="text-sm text-gray-500">
                                                Total Students: {selectedClassroom.students?.length || 0}
                                            </p>
                                        </div>
                                        
                                        {selectedClassroom.students?.length > 0 ? (
                                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                <table className="table table-hover">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" style={{ width: '50px' }}></th>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Email</th>
                                                            <th scope="col">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedClassroom.students.map((student) => (
                                                            <tr key={student._id}>
                                                                <td>
                                                                    <div style={{
                                                                        width: '35px',
                                                                        height: '35px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: '#6366f1',
                                                                        color: 'white',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.875rem',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        {getInitials(student.name)}
                                                                    </div>
                                                                </td>
                                                                <td className="align-middle">{student.name}</td>
                                                                <td className="align-middle">{student.email}</td>
                                                                <td className="align-middle">
                                                                    <button
                                                                        onClick={() => handleRemoveStudent(selectedClassroom._id, student._id)}
                                                                        className="btn btn-link text-danger p-0"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                No students enrolled yet
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateClassroomModal
                            onClose={() => setShowCreateModal(false)}
                            onSubmit={handleCreateClassroom}
                        />
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateClassroomModal
                            isEdit={true}
                            initialData={formData}
                            onClose={() => {
                                setShowEditModal(false);
                                setFormData({ name: '', subject: '', description: '', studentEmails: [] });
                            }}
                            onSubmit={handleUpdateClassroom}
                        />
                    </div>
                </div>
            )}

            {showAssignmentModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AssignmentModal
                            onClose={() => setShowAssignmentModal(false)}
                            onSubmit={handleCreateAssignment}
                            classroomId={selectedClassroom?._id}
                        />
                    </div>
                </div>
            )}

            {showGradeModal && selectedAssignment && selectedSubmission && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <GradeSubmissionModal
                            assignment={selectedAssignment}
                            submission={selectedSubmission}
                            onClose={() => {
                                setShowGradeModal(false);
                                setSelectedSubmission(null);
                            }}
                            onSubmit={handleGradeSubmission}
                        />
                    </div>
                </div>
            )}

            {showEditAssignmentModal && editingAssignment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AssignmentModal
                            isEdit={true}
                            initialData={editingAssignment}
                            onClose={() => {
                                setShowEditAssignmentModal(false);
                                setEditingAssignment(null);
                            }}
                            onSubmit={handleEditAssignment}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;