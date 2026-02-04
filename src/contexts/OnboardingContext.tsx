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
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [sessionClosed, setSessionClosed] = useState(false);

    const hasActivePlan = user?.plan || ['SMART', 'PLUS', 'PRO', 'OPEN_LIBRARY', 'ADMIN'].includes(user?.role || '');

    // Automatic onboarding logic
    useEffect(() => {
        const isAuthRoute = ['/login', '/login/success'].includes(location.pathname);
        const isLandingPage = location.pathname === '/';

        if (
            isAuthenticated &&
            user &&
            !hasActivePlan &&
            !sessionClosed &&
            !isAuthRoute &&
            !isLandingPage
        ) {
            setIsOnboardingOpen(true);
        }
    }, [isAuthenticated, user, hasActivePlan, sessionClosed, location.pathname]);

    const openOnboarding = (isManual = false) => {
        setIsOnboardingOpen(true);
        if (isManual) {
            // If manual, we don't care about sessionClosed
        }
    };

    const closeOnboarding = () => {
        setIsOnboardingOpen(false);
        setSessionClosed(true);
    };

    return (
        <OnboardingContext.Provider value={{ isOnboardingOpen, openOnboarding, closeOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
};
