import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

interface OnboardingContextType {
    isOnboardingOpen: boolean;
    openOnboarding: (isManual?: boolean) => void;
    closeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
};

interface OnboardingProviderProps {
    children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isManualOpen, setIsManualOpen] = useState(false);

    // Use sessionStorage to persist closed state for current tab/window session
    const [sessionClosed, setSessionClosed] = useState(() => {
        return sessionStorage.getItem('sessionOnboardingClosed') === 'true';
    });

    const hasActivePlan = !!(user?.plan || user?.permissions?.can_access_library || ['SMART', 'PLUS', 'PRO', 'ADMIN'].includes(user?.role || ''));

    // Automatic onboarding logic
    useEffect(() => {
        // If user already has a plan and popup is open (AND it wasn't opened manually), close it
        if (!isManualOpen && hasActivePlan && isOnboardingOpen) {
            setIsOnboardingOpen(false);
            return;
        }

        const isAuthRoute = ['/login', '/login/success'].includes(location.pathname);
        const isLandingPage = location.pathname === '/';

        if (
            !isLoading &&
            isAuthenticated &&
            user &&
            !hasActivePlan &&
            !sessionClosed &&
            !isAuthRoute &&
            !isLandingPage
        ) {
            setIsOnboardingOpen(true);
            setIsManualOpen(false);
        }
    }, [isAuthenticated, user, hasActivePlan, sessionClosed, location.pathname, isLoading, isOnboardingOpen, isManualOpen]);

    const openOnboarding = (isManual = false) => {
        setIsManualOpen(isManual);
        setIsOnboardingOpen(true);
    };

    const closeOnboarding = () => {
        setIsOnboardingOpen(false);
        setIsManualOpen(false);
        setSessionClosed(true);
        sessionStorage.setItem('sessionOnboardingClosed', 'true');
    };

    return (
        <OnboardingContext.Provider value={{ isOnboardingOpen, openOnboarding, closeOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
};
