import React, { useEffect, useState } from 'react';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import LessonErrorNotification from '../home/LessonErrorNotification.tsx';

const GlobalLessonMonitor: React.FC = () => {
  const [errorLessonId, setErrorLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Восстанавливаем мониторинги при инициализации
    globalLessonMonitoring.restoreMonitoring();
    
    console.log('Global lesson monitor initialized');

    // Подписка на ошибки
    const unsubscribeError = globalLessonMonitoring.subscribeToError((lessonId, error) => {
      console.log(`Global monitor: Error detected for lesson ${lessonId}`);
      setErrorLessonId(lessonId);
    });
    
    // Очистка при размонтировании приложения (не компонента)
    return () => {
      console.log('Global lesson monitor cleanup - stopping all monitoring');
      globalLessonMonitoring.stopAllMonitoring();
      unsubscribeError();
    };
  }, []);

  const handleCloseError = () => {
    if (errorLessonId) {
      globalLessonMonitoring.markErrorAsShown(errorLessonId);
      setErrorLessonId(null);
    }
  };

  return (
    <>
      {errorLessonId && <LessonErrorNotification onClose={handleCloseError} />}
    </>
  );
};

export default GlobalLessonMonitor;
