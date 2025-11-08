import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Home/Dashboard.jsx";
import InterviewPrep from "./pages/InterviewPrep/InterviewPrep.jsx";
import UserProvider from "./context/userContext.jsx";
import MockInterviewBot from "./components/MockInterview/MockInterviewBot";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected / User Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mock-interview" element={<MockInterviewBot />} />

            {/* Fix: Added :sessionId param */}
            <Route path="/interview-prep/:sessionId" element={<InterviewPrep />} />
          </Routes>
        </Router>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </UserProvider>
  );
};

export default App;
