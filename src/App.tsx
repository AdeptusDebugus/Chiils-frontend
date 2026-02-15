import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LessonBuilderProvider, useLessonBuilder } from './contexts/LessonBuilderContext';
import LessonBuilderPopup from './components/main-page/lesson-builder/LessonBuilderPopup.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/main-page/home/HomePage.tsx';
import LandingPage from './components/lending/LandingPage.tsx';
import Login from './components/auth/Login.tsx';
import LoginSuccess from './components/auth/LoginSuccess.tsx';

import OpenLibrary from './components/main-page/open-library/OpenLibrary.tsx';
import LessonPage from './components/main-page/lesson/LessonPage.tsx';
import WordSetsPage from './components/main-page/home/WordSetsPage.tsx';
import Sidebar from './components/main-page/sidebar/Sidebar.tsx';
import Footer from './components/footer/Footer.tsx';
import GlobalLessonMonitor from './components/main-page/lesson/GlobalLessonMonitor.tsx';
import TermsOfService from './components/policy/TermsOfService.tsx';
import RefundPolicy from './components/policy/RefundPolicy.tsx';
import PrivacyPolicy from './components/policy/PrivacyPolicy.tsx';
import CookiePolicy from './components/policy/CookiePolicy.tsx';
import TermlyBanner from './components/policy/TermlyBanner.tsx';
import './App.css';

import { useAuth } from './contexts/AuthContext';
import OnboardingPlanPopup from './components/subscription/OnboardingPlanPopup.tsx';
import { AuthPromptProvider, useAuthPrompt } from './contexts/AuthPromptContext.tsx';
import AuthPromptPopup from './components/auth/AuthPromptPopup.tsx';
import { UpgradePromptProvider } from './contexts/UpgradePromptContext.tsx';
import UpgradePromptPopup from './components/subscription/UpgradePromptPopup.tsx';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext.tsx';

const LessonBuilderPopupWrapper = () => {
  const { isOpen, closeLessonBuilder } = useLessonBuilder();
  return isOpen ? <LessonBuilderPopup isOpen={isOpen} onClose={closeLessonBuilder} /> : null;
};

const AppContent = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isOnboardingOpen, closeOnboarding } = useOnboarding();

  const authRoutes = ['/login', '/login/success'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  const standaloneRoutes = ['/', '/termsofservice', '/refundpolicy', '/privacypolicy', '/cookies'];
  const isStandaloneRoute = standaloneRoutes.includes(location.pathname);

  const shouldShowSidebar = !isAuthRoute && !isStandaloneRoute;
  const shouldShowFooter = !isAuthRoute && !isStandaloneRoute;

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
    const isAuth = isAuthRoute;
    if (isAuth) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAuthRoute]);



  return (
    <div className="app">
      {/* Sidebar first in DOM order */}
      {shouldShowSidebar && <Sidebar />}

      {/* Main content area */}
      <div className={mainContentClasses.join(' ')}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/open-library" element={<OpenLibrary />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/word-sets" element={<ProtectedRoute><WordSetsPage /></ProtectedRoute>} />
          <Route path="/termsofservice" element={<TermsOfService />} />
          <Route path="/refundpolicy" element={<RefundPolicy />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* Protected routes */}


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

      {/* Onboarding Flow */}
      {isOnboardingOpen && <OnboardingPlanPopup onClose={closeOnboarding} />}

      {/* Auth Prompt for guests */}
      <AuthPromptPopup />

      {/* Upgrade Prompt for restricted plans */}
      <UpgradePromptPopup />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LessonBuilderProvider>
          <AuthPromptProvider>
            <UpgradePromptProvider>
              <OnboardingProvider>
                <AppContent />
              </OnboardingProvider>
            </UpgradePromptProvider>
          </AuthPromptProvider>
        </LessonBuilderProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
