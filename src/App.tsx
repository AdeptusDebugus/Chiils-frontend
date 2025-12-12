import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LessonBuilderProvider, useLessonBuilder } from './contexts/LessonBuilderContext';
import LessonBuilderPopup from './components/LessonBuilderPopup';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import Login from './components/Login';
import LoginSuccess from './components/LoginSuccess';
import Profile from './components/Profile';
import OpenLibrary from './components/OpenLibrary';
import LessonPage from './components/LessonPage';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import GlobalLessonMonitor from './components/GlobalLessonMonitor';
import TermsOfService from './components/TermsOfService.tsx';
import RefundPolicy from './components/RefundPolicy.tsx';
import PrivacyPolicy from './components/PrivacyPolicy.tsx';
import CookiePolicy from './components/CookiePolicy.tsx';
import TermlyBanner from './components/TermlyBanner';
import './App.css';

const LessonBuilderPopupWrapper = () => {
  const { isOpen, closeLessonBuilder } = useLessonBuilder();
  return isOpen ? <LessonBuilderPopup isOpen={isOpen} onClose={closeLessonBuilder} /> : null;
};

function App() {
  const location = useLocation();

  const authRoutes = ['/login', '/login/success'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  const standaloneRoutes = ['/', '/termsofservice', '/refundpolicy', '/privacypolicy', '/cookies'];
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
        <LessonBuilderProvider>
          <div className="app">
            {/* Sidebar first in DOM order */}
            {shouldShowSidebar && <Sidebar />}

            {/* Main content area */}
            <div className={mainContentClasses.join(' ')}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/login/success" element={<LoginSuccess />} />

                <Route path="/open-library" element={<OpenLibrary />} />
                <Route path="/lesson/:id" element={<LessonPage />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/refundpolicy" element={<RefundPolicy />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiePolicy />} />

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
            {/* Termly banner displayed globally so the consent modal is always available. */}
            <TermlyBanner />
            <LessonBuilderPopupWrapper />
          </div>
        </LessonBuilderProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
