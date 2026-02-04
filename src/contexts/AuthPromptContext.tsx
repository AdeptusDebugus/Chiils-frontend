import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthPromptContextType {
    isAuthPromptOpen: boolean;
    openAuthPrompt: () => void;
    closeAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export const useAuthPrompt = () => {
    const context = useContext(AuthPromptContext);
    if (!context) {
        throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
    }
    return context;
};

interface AuthPromptProviderProps {
    children: ReactNode;
}

export const AuthPromptProvider: React.FC<AuthPromptProviderProps> = ({ children }) => {
    const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

    const openAuthPrompt = () => setIsAuthPromptOpen(true);
    const closeAuthPrompt = () => setIsAuthPromptOpen(false);

    return (
        <AuthPromptContext.Provider value={{ isAuthPromptOpen, openAuthPrompt, closeAuthPrompt }}>
            {children}
        </AuthPromptContext.Provider>
    );
};
