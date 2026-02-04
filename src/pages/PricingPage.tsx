
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paddleService } from '../services/paddleService';
import './PricingPage.css';

const PricingPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    console.log("PricingPage Env:", import.meta.env);

    const handleSubscribe = (plan: 'smart' | 'plus' | 'open-library') => {
        if (!isAuthenticated || !user) {
            // Redirect to login or show alert
            alert("Please login to subscribe");
            return;
        }

        let priceId = '';
        switch (plan) {
            case 'smart':
                priceId = import.meta.env.VITE_PADDLE_PRICE_SMART;
                break;
            case 'plus':
                priceId = import.meta.env.VITE_PADDLE_PRICE_PLUS;
                break;
            case 'open-library':
                priceId = import.meta.env.VITE_PADDLE_PRICE_OPEN_LIBRARY;
                break;
        }

        if (!priceId) {
            console.error("Price ID not configured for plan: " + plan);
            alert("Configuration error: Price ID missing");
            return;
        }

        console.log("Subscribing User:", user);
        paddleService.openCheckout(priceId, user.id, user.email);
    };

    return (
        <div className="pricing-page">
            <h1>Upgrade Your Learning</h1>
            <div className="plans-container">

                {/* Open Library Plan */}
                <div className="plan-card open-library">
                    <h2>Open Library</h2>
                    <p className="price">$4.99 / month</p>
                    <ul>
                        <li>Full Open Library Access</li>
                        <li>Community Lessons</li>
                    </ul>
                    <button onClick={() => handleSubscribe('open-library')}>Subscribe to Library</button>
                </div>

                {/* Smart Plan */}
                <div className="plan-card smart">
                    <h2>Smart</h2>
                    <p className="price">$9.99 / month</p>
                    <ul>
                        <li>Open Library + Community Lessons</li>
                        <li>Lesson Builder (300 mins)</li>
                    </ul>
                    <button onClick={() => handleSubscribe('smart')}>Subscribe to Smart</button>
                </div>

                {/* Plus Plan */}
                <div className="plan-card plus">
                    <h2>Plus</h2>
                    <p className="price">$19.99 / month</p>
                    <ul>
                        <li>Smart features</li>
                        <li>Lesson Builder (600 mins)</li>
                        <li>Collections</li>
                        <li>Lesson Scenarios</li>
                    </ul>
                    <button onClick={() => handleSubscribe('plus')}>Subscribe to Plus</button>
                </div>

                {/* Pro Plan */}
                <div className="plan-card pro disabled">
                    <h2>Pro</h2>
                    <p className="price">Coming Soon</p>
                    <ul>
                        <li>Advanced features</li>
                        <li>Priority Support</li>
                    </ul>
                    <button disabled>Coming Soon</button>
                </div>

            </div>
        </div>
    );
};

export default PricingPage;
