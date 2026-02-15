import React, { useState, useEffect } from 'react';
import './Login.css'; // We'll add styles to Login.css

const LoginNotification: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isClosed = localStorage.getItem('loginNotificationClosed');
        if (!isClosed) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('loginNotificationClosed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="login-notification">
            <span className="notification-text">Student? Use the email you gave your teacher.</span>
            <button onClick={handleClose} className="notification-close-btn">
                <img src="/assets/home/close-circle.svg" alt="Close" />
            </button>
        </div>
    );
};

export default LoginNotification;
