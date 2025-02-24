// components/auth/SignUp.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './login.css';
import Header from '../header/Header';

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    });
    const [availableRoles, setAvailableRoles] = useState(['Admin', 'Faculty', 'Student']);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Add this useEffect to check admin count when component mounts
    useEffect(() => {
        checkAdminLimit();
    }, []);

    const checkAdminLimit = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/auth/check-admin-limit');
            if (response.data.adminLimitReached) {
                setAvailableRoles(['Faculty', 'Student']);
            }
        } catch (error) {
            console.error('Error checking admin limit:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(
                "http://localhost:9000/api/auth/signup",
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess("Registration successful! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed";
            setError(errorMessage);
            
            // If it's the admin limit error, update available roles
            if (errorMessage.includes("Maximum number of admins")) {
                setAvailableRoles(['Faculty', 'Student']);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="auth-container">
                <div className="auth-form-container">
                    <div className="form-wrapper">
                        <h2>Sign Up</h2>
                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        {success && (
                            <div className="success-message">{success}</div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="input-field">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="input-field">
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    required
                                    className="form-control"
                                >
                                    <option value="">Select Role</option>
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="auth-button">
                                Sign Up
                            </button>
                        </form>
                        <p className="mt-4 text-center">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUp;