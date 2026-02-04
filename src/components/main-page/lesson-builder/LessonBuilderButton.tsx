import React from 'react';
import { useLessonBuilder } from '../../../contexts/LessonBuilderContext.tsx';
import { useAuth } from '../../../contexts/AuthContext.tsx';
import { useAuthPrompt } from '../../../contexts/AuthPromptContext.tsx';
import { useUpgradePrompt } from '../../../contexts/UpgradePromptContext.tsx';
import './LessonBuilderButton.css';

const LessonBuilderButton: React.FC = () => {
    const { openLessonBuilder, isOpen } = useLessonBuilder();
    const { isAuthenticated, user } = useAuth();
    const { openAuthPrompt } = useAuthPrompt();
    const { openUpgradePrompt } = useUpgradePrompt();

    const handleClick = () => {
        if (!isAuthenticated) {
            openAuthPrompt();
            return;
        }

        // If authenticated but doesn't have builder permission
        if (user?.permissions && !user.permissions.can_use_builder) {
            openUpgradePrompt();
            return;
        }

        openLessonBuilder();
    };

    return (
        <button className={`lesson-builder-button ${isOpen ? 'expanded' : ''}`} onClick={handleClick}>
            <span className="button-text">Lesson Builder</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="106" height="104" viewBox="0 0 106 104" fill="none">
                <g opacity="1">
                    <path d="M62.9046 92.9489C62.9046 98.5398 58.2804 103.073 52.5773 103.073C46.8742 103.073 42.25 98.5398 42.25 92.9489C42.25 87.358 52.5773 49.8926 52.5773 49.8926C52.5773 49.8926 62.9046 87.358 62.9046 92.9489Z" fill="black" />
                    <path d="M30.0041 87.9796C25.9693 91.935 19.432 91.935 15.3972 87.9796C11.3624 84.0242 11.3624 77.6155 15.3972 73.6601C19.432 69.7047 53.7596 50.3809 53.7596 50.3809C53.7596 50.3809 34.0389 84.0331 30.0131 87.9885L30.0041 87.9796Z" fill="black" />
                    <path d="M10.3273 61.6603C4.62417 61.6603 0 57.1271 0 51.5362C0 45.9453 4.62417 41.4121 10.3273 41.4121C16.0304 41.4121 54.2477 51.5362 54.2477 51.5362C54.2477 51.5362 16.0304 61.6603 10.3273 61.6603Z" fill="black" />
                    <path d="M15.3972 29.4111C11.3624 25.4557 11.3624 19.047 15.3972 15.0916C19.432 11.1361 25.9693 11.1361 30.0041 15.0916C34.0389 19.047 53.7505 52.6992 53.7505 52.6992C53.7505 52.6992 19.4229 33.3665 15.3881 29.42L15.3972 29.4111Z" fill="black" />
                    <path d="M42.2441 10.1241C42.2441 4.53318 46.8683 0 52.5714 0C58.2745 0 62.8987 4.53318 62.8987 10.1241C62.8987 15.715 52.5714 53.1804 52.5714 53.1804C52.5714 53.1804 42.2441 15.715 42.2441 10.1241Z" fill="black" />
                    <path d="M75.1382 15.0916C79.173 11.1361 85.7103 11.1361 89.7451 15.0916C93.7799 19.047 93.7799 25.4557 89.7451 29.4111C85.7103 33.3665 51.3828 52.6903 51.3828 52.6903C51.3828 52.6903 71.1034 19.0381 75.1291 15.0827L75.1382 15.0916Z" fill="black" />
                    <path d="M94.8228 41.4121C100.526 41.4121 105.15 45.9453 105.15 51.5362C105.15 57.1271 100.526 61.6603 94.8228 61.6603C89.1197 61.6603 50.9023 51.5362 50.9023 51.5362C50.9023 51.5362 89.1197 41.4121 94.8228 41.4121Z" fill="black" />
                    <path d="M89.7516 73.6592C93.7864 77.6146 93.7864 84.0233 89.7516 87.9787C85.7168 91.9341 79.1796 91.9341 75.1448 87.9787C71.11 84.0233 51.3984 50.3711 51.3984 50.3711C51.3984 50.3711 85.7259 69.7038 89.7607 73.6503L89.7516 73.6592Z" fill="black" />
                </g>
            </svg>
        </button>
    );
};

export default LessonBuilderButton;
