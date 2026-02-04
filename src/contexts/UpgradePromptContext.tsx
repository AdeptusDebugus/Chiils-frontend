import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UpgradePromptContextType {
    isUpgradePromptOpen: boolean;
    openUpgradePrompt: () => void;
    closeUpgradePrompt: () => void;
}

const UpgradePromptContext = createContext<UpgradePromptContextType | undefined>(undefined);

export const useUpgradePrompt = () => {
    const context = useContext(UpgradePromptContext);
    if (!context) {
        throw new Error('useUpgradePrompt must be used within an UpgradePromptProvider');
    }
    return context;
};

interface UpgradePromptProviderProps {
    children: ReactNode;
}

export const UpgradePromptProvider: React.FC<UpgradePromptProviderProps> = ({ children }) => {
    const [isUpgradePromptOpen, setIsUpgradePromptOpen] = useState(false);

    const openUpgradePrompt = () => setIsUpgradePromptOpen(true);
    const closeUpgradePrompt = () => setIsUpgradePromptOpen(false);

    return (
        <UpgradePromptContext.Provider value={{ isUpgradePromptOpen, openUpgradePrompt, closeUpgradePrompt }}>
            {children}
        </UpgradePromptContext.Provider>
    );
};
