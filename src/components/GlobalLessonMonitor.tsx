import React, { useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { globalLessonMonitoring } from '../services/globalLessonMonitoring';

const GlobalLessonMonitor: React.FC = () => {
  const { showNotification } = useNotification();

  useEffect(() => {
    // Устанавливаем callback для показа уведомлений
    globalLessonMonitoring.setNotificationCallback(showNotification);
    
    // Восстанавливаем мониторинги при инициализации
    globalLessonMonitoring.restoreMonitoring();
    
    console.log('Global lesson monitor initialized');
    
    // Очистка при размонтировании приложения (не компонента)
    return () => {
      console.log('Global lesson monitor cleanup - stopping all monitoring');
      globalLessonMonitoring.stopAllMonitoring();
    };
  }, [showNotification]);

  // Этот компонент не рендерит ничего видимого
  return null;
};

export default GlobalLessonMonitor;
