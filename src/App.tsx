import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import LoginSuccess from './components/LoginSuccess';
import Profile from './components/Profile';
import LessonOrderForm from './components/LessonOrderForm';
import LessonPage from './components/LessonPage';
import MyLessons from './components/MyLessons';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const location = useLocation();
  
  // Hide sidebar on login pages
  const shouldShowSidebar = !['/', '/login', '/login/success'].includes(location.pathname);

  return (
    <AuthProvider>
      <div className="app">
        {shouldShowSidebar && <Sidebar />}
        <div className={`main-content ${shouldShowSidebar ? '' : 'full-width'}`}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/success" element={<LoginSuccess />} />
            <Route path="/lesson-order" element={<LessonOrderForm />} />
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
            <Route 
              path="/my-lessons" 
              element={
                <ProtectedRoute>
                  <MyLessons />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-lessons/:idx" 
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
