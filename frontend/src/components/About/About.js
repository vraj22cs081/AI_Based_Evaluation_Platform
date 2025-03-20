import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';
import logo from '../../assets/Logo4.png';

const About = () => {
    return (
        <div className="about-container">
            <header className="about-header">
                <div className="about-logo">
                    <img src={logo} alt="Logo" />
                    <span>AI Evaluation</span>
                </div>
                <div className="header-links">
                    <Link to="/" className="nav-link">
                        <i className="fas fa-home"></i>
                        Home
                    </Link>
                    <Link to="/login" className="login-button">
                        Login <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                </div>
            </header>

            <main className="about-content">
                <h1 className="about-title">About Us</h1>
                <div className="about-sections">
                    <section className="about-section">
                        <h2>Our Mission</h2>
                        <p>
                            To revolutionize educational assessment through cutting-edge AI technology,
                            making evaluation more efficient, consistent, and insightful for both
                            educators and students.
                        </p>
                    </section>

                    <section className="team-section">
                        <h2>Our Leadership</h2>
                        <div className="team-grid">
                            <div className="team-member">
                                <div className="member-image">
                                    <img 
                                        src="https://media.licdn.com/dms/image/v2/D4D03AQHWaFQzxhYyCg/profile-displayphoto-shrink_800_800/B4DZQIp7oRHYAg-/0/1735311999448?e=1747872000&v=beta&t=zW72TOTF4Rc0k1EQVhTMXqA1vp6Z5qVACekBKRWcMhU" 
                                        alt="Utsav Shah"
                                    />
                                </div>
                                <h3 className="member-name">Utsav Shah</h3>
                                <div className="member-role">Chief Executive Officer</div>
                                <p className="member-bio">
                                    A visionary leader with extensive experience in EdTech and AI. 
                                    Utsav drives innovation and strategic direction at AI Evaluation Platform, 
                                    ensuring we remain at the forefront of educational technology.
                                </p>
                            </div>

                            <div className="team-member">
                                <div className="member-image">
                                    <img 
                                        src="https://media.licdn.com/dms/image/v2/D4E03AQEEUSepAUqZlA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1727781107992?e=1747872000&v=beta&t=yugl8d9JtgBJV_3kZGfCBLFxXq-dKY-SAjmIBdscpEE" 
                                        alt="Vraj Shah"
                                    />
                                </div>
                                <h3 className="member-name">Vraj Shah</h3>
                                <div className="member-role">Chief Technology Officer</div>
                                <p className="member-bio">
                                    A tech innovator with deep expertise in AI and machine learning. 
                                    Vraj leads our technical initiatives, developing cutting-edge solutions 
                                    that power our automated assessment platform.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h2>What We Do</h2>
                        <div className="features-grid">
                            <div className="feature">
                                <i className="fas fa-robot"></i>
                                <h3>AI-Powered Grading</h3>
                                <p>Automated assessment using advanced machine learning algorithms</p>
                            </div>
                            <div className="feature">
                                <i className="fas fa-comments"></i>
                                <h3>Smart Feedback</h3>
                                <p>Detailed and personalized feedback for improved learning</p>
                            </div>
                            <div className="feature">
                                <i className="fas fa-chart-line"></i>
                                <h3>Analytics</h3>
                                <p>Comprehensive insights into student performance</p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h2>Our Vision</h2>
                        <p>
                            We envision a future where AI enhances education by providing fair,
                            efficient, and insightful assessment tools that help educators focus
                            more on teaching and students focus more on learning.
                        </p>
                    </section>
                </div>
            </main>

            {/* Reuse the same footer from LandingPage */}
        </div>
    );
};

export default About;