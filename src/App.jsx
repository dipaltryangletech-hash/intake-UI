import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Clients from './Clients.jsx'
import Users from "./users.jsx";
import Header from "./header.jsx";
import ClientDashboard from './clientdasboard.jsx';
import UserDetails from "./userdetails.jsx";
import Signup from "./signup.jsx";
import Assignments from "./assignments.jsx";
import AssignmentBuilder from "./assignmentbuilder.jsx";
import MasterChecklist from "./masterchecklist.jsx";
import MasterChecklistBuilder from "./masterchecklistbuilder.jsx";
import ClientPortal from "./clientportal.jsx";
import ClientAssignment from "./clientassignment.jsx";
import ReviewWorkspace from "./reviewclarification.jsx";
import LoginPage from "./login.jsx";
import MasterChecklistPopup from "./masterchecklistpopup.jsx";
import ClientAssignmentFill from "./clientassignmentfill.jsx";
import AdminAssignmentReview from "./adminassignmentreview.jsx";
import MasterChecklistView from './masterchecklistview.jsx';
import AssignmentView from "./assignmentview.jsx";
import ChatBot from "./chatbot.jsx";
import Documents from "./Documents.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />

        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Specific Routes */}
          <Route path="/assignments" element={<ProtectedRoute allowedRoles={['admin', 'client']}><Assignments /></ProtectedRoute>} />
          <Route path="/create-assignment" element={<ProtectedRoute allowedRoles={['admin']}><AssignmentBuilder /></ProtectedRoute>} />
          <Route path="/assignments/view/:id" element={<ProtectedRoute allowedRoles={['admin']}><AssignmentView /></ProtectedRoute>} />
          <Route path="/assignments/edit/:id" element={<ProtectedRoute allowedRoles={['admin']}><AssignmentBuilder /></ProtectedRoute>} />
          <Route path="/adminassignmentreview" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssignmentReview /></ProtectedRoute>} />
          <Route path="/adminassignmentreview/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminAssignmentReview /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin']}><Clients /></ProtectedRoute>} />
          <Route path="/client-details" element={<ProtectedRoute allowedRoles={['admin']}><ClientDashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
          <Route path="/masterchecklist" element={<ProtectedRoute allowedRoles={['admin']}><MasterChecklist /></ProtectedRoute>} />
          <Route path="/builder" element={<ProtectedRoute allowedRoles={['admin']}><MasterChecklistBuilder /></ProtectedRoute>} />
          <Route path="/masterchecklistview/:id" element={<ProtectedRoute allowedRoles={['admin']}><MasterChecklistView /></ProtectedRoute>} />
          <Route path="/masterchecklistpopup" element={<ProtectedRoute allowedRoles={['admin']}><MasterChecklistPopup /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute allowedRoles={['admin']}><Documents /></ProtectedRoute>} />
          <Route path="/review" element={<ProtectedRoute allowedRoles={['admin']}><ReviewWorkspace /></ProtectedRoute>} />

          {/* Client Specific Routes */}
          <Route path="/clientportal" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />
          <Route path="/assignment-fill/:id" element={<ProtectedRoute allowedRoles={['client']}><ClientAssignmentFill /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute allowedRoles={['client', 'admin']}><ChatBot /></ProtectedRoute>} />

          {/* Shared / Profile Routes */}
          <Route path="/userdetails" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;