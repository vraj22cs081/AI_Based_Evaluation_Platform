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
        </div>
    );
};

export default LandingPage;