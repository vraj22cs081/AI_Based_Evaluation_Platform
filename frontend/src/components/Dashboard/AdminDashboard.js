import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import LoadingSpinner from '../LoadingSpinner';
import Notification from '../Notification';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const { logout, userName } = useAuth();
    const navigate = useNavigate();

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const [usersRes, classroomsRes] = await Promise.all([
                axios.get('http://localhost:9000/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:9000/api/admin/classrooms', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setUsers(usersRes.data.users);
            setClassrooms(classroomsRes.data.classrooms);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter and Search Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = (
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredClassrooms = classrooms.filter(classroom =>
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classroom.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const currentClassrooms = filteredClassrooms.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(
        (activeTab === 'users' ? filteredUsers.length : filteredClassrooms.length) / itemsPerPage
    );

    // Action Handlers
    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:9000/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('User deleted successfully');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleDeleteClassroom = async (classroomId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:9000/api/admin/classrooms/${classroomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Classroom deleted successfully');
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete classroom');
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:9000/api/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            logout();
            navigate('/login');
        } catch (error) {
            setError('Logout failed');
        }
    };

    // Render Functions
    const renderPagination = () => (
        <div className="flex justify-center mt-4 gap-2">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Previous
            </button>
            <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );

    const renderSearchAndFilters = () => (
        <div className="mb-4 flex gap-4">
            <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border rounded-lg"
            />
            {activeTab === 'users' && (
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="all">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Student">Student</option>
                </select>
            )}
        </div>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-md p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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

            {/* Main Content */}
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

                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setActiveTab('users');
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'users' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('classrooms');
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'classrooms' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            Classrooms
                        </button>
                    </div>
                </div>

                {renderSearchAndFilters()}

                {/* Content */}
                <div className="bg-white rounded-lg shadow p-6">
                    {activeTab === 'users' ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4">User Management</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Email</th>
                                            <th className="px-6 py-3 text-left">Role</th>
                                            <th className="px-6 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentUsers.map(user => (
                                            <tr key={user._id}>
                                                <td className="px-6 py-4">{user.name}</td>
                                                <td className="px-6 py-4">{user.email}</td>
                                                <td className="px-6 py-4">{user.role}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Classroom Management</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Name</th>
                                            <th className="px-6 py-3 text-left">Subject</th>
                                            <th className="px-6 py-3 text-left">Faculty</th>
                                            <th className="px-6 py-3 text-left">Students</th>
                                            <th className="px-6 py-3 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentClassrooms.map(classroom => (
                                            <tr key={classroom._id}>
                                                <td className="px-6 py-4">{classroom.name}</td>
                                                <td className="px-6 py-4">{classroom.subject}</td>
                                                <td className="px-6 py-4">{classroom.faculty.name}</td>
                                                <td className="px-6 py-4">{classroom.students.length}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDeleteClassroom(classroom._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {renderPagination()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard; 