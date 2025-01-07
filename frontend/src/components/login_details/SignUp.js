import React, { useState } from "react";
import axios from "axios";

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Student", // Default role
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post("http://localhost:9000/sign/api/auth/signup", formData);
        setMessage(response.data.message);
        } catch (error) {
        setMessage("Error during sign-up. Please try again.");
        }
    };

    return (
        <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            />
            <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            />
            <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            />
            <select name="role" value={formData.role} onChange={handleChange}>
            <option value="Admin">Admin</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
            </select>
            <button type="submit">Sign Up</button>
        </form>
        {message && <p>{message}</p>}
        </div>
    );
};

export default SignUp;
