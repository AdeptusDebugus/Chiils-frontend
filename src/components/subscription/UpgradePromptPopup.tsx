import { useUpgradePrompt } from '../../contexts/UpgradePromptContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import './UpgradePromptPopup.css';

const UpgradePromptPopup: React.FC = () => {
    const { isUpgradePromptOpen, closeUpgradePrompt } = useUpgradePrompt();
    const { openOnboarding } = useOnboarding();

    if (!isUpgradePromptOpen) return null;

    const handleUpgrade = () => {
        closeUpgradePrompt();
        openOnboarding(true);
    };

    return (
        <div className="upgrade-prompt-overlay" onClick={closeUpgradePrompt}>
            <div className="upgrade-prompt-container" onClick={e => e.stopPropagation()}>
                <h2 className="upgrade-sorry">Sorry...</h2>

                <p className="upgrade-description">
                    Lesson Builder isn’t available on your current plan. Upgrade to unlock it and create your own lessons just in a couple of clicks.
                </p>

                <div className="upgrade-actions-row">
                    <button className="upgrade-stay-btn" onClick={closeUpgradePrompt}>
                        Stay on current plan
                    </button>
                    <button className="upgrade-now-btn" onClick={handleUpgrade}>
                        Upgrade now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradePromptPopup;
