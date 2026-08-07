import React from 'react';
import './LessonBuilderStartedNotification.css';

type LessonBuilderStartedNotificationProps = {
  onClose: () => void;
};

const LessonBuilderStartedNotification: React.FC<LessonBuilderStartedNotificationProps> = ({ onClose }) => {
  return (
    <div className="lb-started-notification" aria-live="polite" role="status">
      <div className="lb-started-card">
        <p className="lb-started-title">Your lesson&apos;s on the way</p>
        <div className="lb-started-body">
          <p className="lb-started-text">
            Close this and carry on. Nothing gets lost.
            <br />
            Give it 5-7 min, more if the video&apos;s long. Hang tight.
          </p>
          <button type="button" className="lb-started-button" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonBuilderStartedNotification;

