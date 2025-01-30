// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SignUp from "./components/login_details/SignUp";
import Login from "./components/login_details/Login";
import ErrorBoundary from './components/ErrorBoundary';
// import LoadingSpinner from './components/LoadingSpinner';
// import Notification from './components/Notification';
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import FacultyDashboard from "./components/Dashboard/FacultyDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
// import StudentAssignmentList from "./components/Assignment/StudentAssignmentList";
// import FacultyAssignmentList from "./components/Assignment/FacultyAssignmentList";
// import ClassroomList from "./components/Classroom/ClassroomList";
// import CreateClassroom from "./components/Classroom/CreateClassroom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect based on role
        switch (userRole) {
            case 'Admin':
                return <Navigate to="/admin-dashboard" />;
            case 'Faculty':
                return <Navigate to="/faculty-dashboard" />;
            case 'Student':
                return <Navigate to="/student-dashboard" />;
            default:
                return <Navigate to="/login" />;
        }
    }

    return children;
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/faculty-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["Faculty"]}>
                                <FacultyDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/student-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["Student"]}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* <Route path="/classroom/:id/student-assignments" element={
                        <ProtectedRoute allowedRoles={["Student"]}>
                            <StudentAssignmentList />
                        </ProtectedRoute>
                    } />
                    <Route path="/classroom/:id/faculty-assignments" element={
                        <ProtectedRoute allowedRoles={["Faculty"]}>
                            <FacultyAssignmentList />
                        </ProtectedRoute>
                    } />
                    <Route path="/classrooms" element={
                        <ProtectedRoute allowedRoles={["Faculty"]}>
                            <ClassroomList />
                        </ProtectedRoute>
                    } />
                    <Route path="/create-classroom" element={
                        <ProtectedRoute allowedRoles={["Faculty"]}>
                            <CreateClassroom />
                        </ProtectedRoute>
                    } /> */}
                </Routes>
            </Router>
        </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;