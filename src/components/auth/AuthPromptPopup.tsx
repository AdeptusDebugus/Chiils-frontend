import React from 'react';
import { useAuthPrompt } from '../../contexts/AuthPromptContext';
import './AuthPromptPopup.css';

const AuthPromptPopup: React.FC = () => {
    const { isAuthPromptOpen, closeAuthPrompt } = useAuthPrompt();

    if (!isAuthPromptOpen) return null;

    const handleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        window.location.href = `${apiUrl}/oauth2/authorization/google`;
    };

    return (
        <div className="auth-prompt-overlay" onClick={closeAuthPrompt}>
            <div className="auth-prompt-container" onClick={e => e.stopPropagation()}>
                <h2 className="auth-welcome">Welcome!</h2>

                <p className="auth-description">
                    You’re currently in preview mode. Some of the features are locked. Sign up or log in to see full interactive lessons.
                </p>

                <div className="auth-actions-row">
                    <button className="auth-guest-btn" onClick={closeAuthPrompt}>
                        Continue as a guest
                    </button>
                    <button className="auth-login-btn" onClick={handleLogin}>
                        Sign up / Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPromptPopup;
