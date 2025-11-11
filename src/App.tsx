import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import GlobalLessonMonitor from './components/GlobalLessonMonitor';
import TermsOfService from './components/TermsOfService.tsx';
import './App.css';

function App() {
  const location = useLocation();

  const authRoutes = ['/', '/login', '/login/success'];
  const standaloneRoutes = ['/termsofservice'];

  const isAuthRoute = authRoutes.includes(location.pathname);
  const isStandaloneRoute = standaloneRoutes.includes(location.pathname);

  const shouldShowSidebar = !isAuthRoute && !isStandaloneRoute;
  const shouldShowFooter = !isAuthRoute && !isStandaloneRoute;
  const shouldDisableScroll = isAuthRoute;

  const mainContentClasses = ['main-content'];
  if (!shouldShowSidebar) {
    mainContentClasses.push('no-sidebar');
  }
  if (isAuthRoute) {
    mainContentClasses.push('auth-layout');
  }
  if (isStandaloneRoute) {
    mainContentClasses.push('standalone');
  }

  // Prevent body scrolling on auth routes (Login pages)
  useEffect(() => {
    if (shouldDisableScroll) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAuthRoute]);

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="app">
          {/* Sidebar first in DOM order */}
          {shouldShowSidebar && <Sidebar />}
          
          {/* Main content area */}
          <div className={mainContentClasses.join(' ')}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/login/success" element={<LoginSuccess />} />
              <Route path="/lesson-order" element={<LessonOrderForm />} />
              <Route path="/open-library" element={<OpenLibrary />} />
              <Route path="/lesson/:id" element={<LessonPage />} />
              <Route path="/termsofservice" element={<TermsOfService />} />
              
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
          
          {/* Global lesson monitor */}
          <GlobalLessonMonitor />
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
