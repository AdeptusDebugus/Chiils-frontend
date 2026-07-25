import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paddleService } from '../../services/paddleService';
import ComparePlansPopup from '../lending/ComparePlansPopup';
import './OnboardingPlanPopup.css';

const iconClose = "/assets/home/close-circle.svg";
const logoChiils = "/assets/subscription/chiils-log.svg";

interface OnboardingPlanPopupProps {
    onClose: () => void;
}

const OnboardingPlanPopup: React.FC<OnboardingPlanPopupProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [showCompare, setShowCompare] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'open-library' | 'smart' | 'plus' | 'pro' | null>(null);

    const handlePlanSelect = (plan: 'open-library' | 'smart' | 'plus' | 'pro') => {
        setSelectedPlan(plan);
    };

    const handleSubscribe = () => {
        if (!selectedPlan) return;

        let priceId = '';
        switch (selectedPlan) {
            case 'open-library':
                priceId = import.meta.env.VITE_PADDLE_PRICE_OPEN_LIBRARY;
                break;
            case 'smart':
                priceId = import.meta.env.VITE_PADDLE_PRICE_START;
                break;
            case 'plus':
                priceId = import.meta.env.VITE_PADDLE_PRICE_PLUS;
                break;
            case 'pro':
                priceId = import.meta.env.VITE_PADDLE_PRICE_PRO;
                break;
        }

        if (priceId && user) {
            paddleService.openCheckout(priceId, user.id, user.email);
        }
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container">
                <button className="close-onboarding" onClick={onClose}>
                    <img src={iconClose} alt="Close" />
                </button>

                <div className="onboarding-layout">
                    {/* Left Side - Image/Brand */}
                    <div className="onboarding-visual">
                        <img src={logoChiils} alt="Chiils" className="visual-brand-logo" />
                    </div>

                    {/* Right Side - Plans */}
                    <div className="onboarding-content">
                        <h2 className="onboarding-title">Language is a thrill, not a drill</h2>
                        <p className="onboarding-subtitle">Choose a plan that suits you</p>

                        <div className="onboarding-plans-grid">
                            <div
                                className={`onboarding-plan-card library-card ${selectedPlan === 'open-library' ? 'selected' : ''}`}
                                onClick={() => handlePlanSelect('open-library')}
                            >
                                <div className="plan-card-info">
                                    <h3>Open Library</h3>
                                    <p className="plan-card-desc">Community lessons, interactive exercises, flashcards and grammar hints</p>
                                </div>
                                <div className="plan-card-price">€5</div>
                            </div>

                            <div className="plus-card-wrapper">
                                <div className="onboarding-recommended-badge">Recommended 🔥</div>
                                <div
                                    className={`onboarding-plan-card plus-card ${selectedPlan === 'plus' ? 'selected' : ''}`}
                                    onClick={() => handlePlanSelect('plus')}
                                >
                                    <div className="plan-card-info">
                                        <h3>Plus</h3>
                                        <p className="plan-card-desc">7-day free trial, everything on Start, 600 mins of Lesson Builder, personal collections and more</p>
                                    </div>
                                    <div className="plan-card-price">€20</div>
                                </div>
                            </div>

                            <div
                                className={`onboarding-plan-card start-card ${selectedPlan === 'smart' ? 'selected' : ''}`}
                                onClick={() => handlePlanSelect('smart')}
                            >
                                <div className="plan-card-info">
                                    <h3>Start</h3>
                                    <p className="plan-card-desc">7-day free trial, everything on Open Library, 300 mins of Lesson Builder</p>
                                </div>
                                <div className="plan-card-price">€10</div>
                            </div>

                            <div
                                className={`onboarding-plan-card pro-card ${selectedPlan === 'pro' ? 'selected' : ''}`}
                                onClick={() => handlePlanSelect('pro')}
                            >
                                <div className="plan-card-info">
                                    <h3>Pro</h3>
                                    <p className="plan-card-desc">7-day free trial, everything on Plus, 800 mins of Lesson Builder, student progress and more</p>
                                </div>
                                <div className="plan-card-price">€30</div>
                            </div>
                        </div>

                        <div className="onboarding-actions">
                            <button className="compare-plans-link" onClick={() => setShowCompare(true)}>
                                Compare plans →
                            </button>
                            <button
                                className={`onboarding-subscribe-btn ${!selectedPlan ? 'disabled' : ''}`}
                                onClick={handleSubscribe}
                                disabled={!selectedPlan}
                            >
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showCompare && <ComparePlansPopup onClose={() => setShowCompare(false)} />}
        </div>
    );
};

export default OnboardingPlanPopup;
