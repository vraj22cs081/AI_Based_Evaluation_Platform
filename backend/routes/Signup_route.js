const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is in your .env file

// Sign Up Route
router.post("/api/auth/signup", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login Route
router.post("/api/auth/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || user.role !== role) {
            return res.status(401).json({ message: "Invalid credentials or role mismatch" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        // Determine redirection or message based on role
        // let redirectUrl;
        // switch (role) {
        //     case "admin":
        //         redirectUrl = "/admin/dashboard"; // Replace with your frontend's admin dashboard URL
        //         break;
        //     case "faculty":
        //         redirectUrl = "/faculty/dashboard"; // Replace with your frontend's faculty dashboard URL
        //         break;
        //     case "student":
        //         redirectUrl = "/student/dashboard"; // Replace with your frontend's student dashboard URL
        //         break;
        //     default:
        //         return res.status(400).json({ message: "Unknown role" });
        // }

        res.status(200).json({
            token,
            role: user.role,
            message: `You are successfully logged in as ${user.role}`,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});


module.exports = router;
