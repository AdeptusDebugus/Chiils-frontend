import React, { useEffect, useState } from 'react';
import './Notification.css';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  lessonId?: string;
  lessonLink?: string; // Ссылка на урок
}

interface NotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Только анимация появления, без автоматического скрытия
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Время анимации исчезновения
  };

  const handleLessonClick = () => {
    if (notification.lessonLink) {
      window.open(notification.lessonLink, '_blank');
    } else if (notification.lessonId) {
      // Переходим на страницу урока
      window.location.href = `/lesson/${notification.lessonId}`;
    }
  };

  return (
    <div 
      className={`notification ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
      data-node-id="243:933"
    >
      <div className="notification-content">
        <p className="notification-text">
          Урок готов! Можно забрать в профиле или по{' '}
          <span 
            className="notification-link"
            onClick={handleLessonClick}
          >
            ссылке
          </span>.
        </p>
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Закрыть уведомление"
        >
          <img src="/src/assets/close-icon.svg" alt="Закрыть" width="17" height="17" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
