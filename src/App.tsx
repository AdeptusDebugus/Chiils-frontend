import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import LoginSuccess from './components/LoginSuccess';
import Profile from './components/Profile';
import LessonOrderForm from './components/LessonOrderForm';
import OpenLibrary from './components/OpenLibrary';
import LessonPage from './components/LessonPage';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import LessonMonitoringStatus from './components/LessonMonitoringStatus';
import './App.css';

function App() {
  const location = useLocation();
  
  // Hide sidebar and footer on login pages
  const isAuthRoute = ['/', '/login', '/login/success'].includes(location.pathname);
  const shouldShowSidebar = !isAuthRoute;
  const shouldShowFooter = !isAuthRoute;

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app">
          {/* Sidebar first in DOM order */}
          {shouldShowSidebar && <Sidebar />}
          
          {/* Main content area */}
          <div className={`main-content ${shouldShowSidebar ? '' : 'full-width'}`}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/success" element={<LoginSuccess />} />
              <Route path="/lesson-order" element={<LessonOrderForm />} />
              <Route path="/open-library" element={<OpenLibrary />} />
              <Route path="/lesson/:idx" element={<LessonPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          
          {/* Footer last in DOM order */}
          {shouldShowFooter && <Footer />}
          
          {/* Lesson monitoring status */}
          <LessonMonitoringStatus />
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
