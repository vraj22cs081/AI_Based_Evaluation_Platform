import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/login_details/SignUp";
import Login from "./components/login_details/Login";
// import AdminDashboard from "./AdminDashboard";
// import FacultyDashboard from "./FacultyDashboard";
// import StudentDashboard from "./StudentDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
