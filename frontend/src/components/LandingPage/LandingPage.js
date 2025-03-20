import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import logo from '../../assets/Logo4.png';  // Update import

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Header */}
            <header className="landing-header">
                <div className="landing-logo">
                    <img src={logo} alt="Logo" />
                    <span>AI Evaluation</span>
                </div>
                <Link to="/login" className="login-button">
                    Login <i className="fas fa-arrow-right ms-2"></i>
                </Link>
            </header>

            {/* Main Content */}
            <main className="landing-content">
                <div className="landing-text">
                    <h1 className="landing-title">
                        AI-Powered Assignment Evaluation Platform
                    </h1>
                    <p className="landing-subtitle">
                        Transform your classroom experience with our innovative AI-based assessment system. 
                        Streamline grading, provide instant feedback, and enhance learning outcomes.
                    </p>

                    <div className="landing-features">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-robot"></i>
                            </div>
                            <h3 className="feature-title">AI Grading</h3>
                            <p className="feature-description">
                                Automated assessment powered by advanced AI algorithms for quick and consistent grading
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-comments"></i>
                            </div>
                            <h3 className="feature-title">Smart Feedback</h3>
                            <p className="feature-description">
                                Detailed, personalized feedback to help students understand and improve
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3 className="feature-title">Analytics</h3>
                            <p className="feature-description">
                                Comprehensive insights into student performance and learning progress
                            </p>
                        </div>
                    </div>
                </div>

                <div className="landing-image">
                    <img 
                        src="https://img.freepik.com/free-vector/artificial-intelligence-ai-robot-server-room-digital-technology-banner-computer-equipment_39422-767.jpg"
                        alt="AI Evaluation Platform"
                        loading="lazy"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="footer-logo">
                            <img src={logo} alt="Logo" />
                            <span>AI Evaluation</span>
                        </div>
                        <p className="footer-description">
                            Transforming education through AI-powered assessment and evaluation solutions.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4 className="text-white font-semibold mb-2">Quick Links</h4>
                        <div className="footer-links">
                            <Link to="/">
                                <i className="fas fa-home"></i>
                                Home
                            </Link>
                            <Link to="/about">
                                <i className="fas fa-info-circle"></i>
                                About
                            </Link>
                            <Link to="/login">
                                <i className="fas fa-sign-in-alt"></i>
                                Login
                            </Link>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4 className="text-white font-semibold mb-2">Contact</h4>
                        <div className="footer-links">
                            <a href="mailto:contact@aievaluation.com">
                                <i className="fas fa-envelope"></i>
                                contact@aievaluation.com
                            </a>
                            <a href="tel:+1234567890">
                                <i className="fas fa-phone"></i>
                                +1 (234) 567-890
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4 className="text-white font-semibold mb-2">Follow Us</h4>
                        <div className="social-links">
                            <a href="#" className="social-link">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a href="#" className="social-link">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} AI Evaluation Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;