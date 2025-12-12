import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LessonBuilderContextType {
    isOpen: boolean;
    openLessonBuilder: () => void;
    closeLessonBuilder: () => void;
}

const LessonBuilderContext = createContext<LessonBuilderContextType | undefined>(undefined);

export const LessonBuilderProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openLessonBuilder = () => setIsOpen(true);
    const closeLessonBuilder = () => setIsOpen(false);

    return (
        <LessonBuilderContext.Provider value={{ isOpen, openLessonBuilder, closeLessonBuilder }}>
            {children}
        </LessonBuilderContext.Provider>
    );
};

export const useLessonBuilder = () => {
    const context = useContext(LessonBuilderContext);
    if (context === undefined) {
        throw new Error('useLessonBuilder must be used within a LessonBuilderProvider');
    }
    return context;
};
