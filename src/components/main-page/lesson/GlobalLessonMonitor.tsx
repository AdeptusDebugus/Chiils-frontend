import React, { useEffect, useState } from 'react';
import { globalLessonMonitoring } from '../../../services/globalLessonMonitoring.ts';
import LessonErrorNotification from '../home/LessonErrorNotification.tsx';

const GlobalLessonMonitor: React.FC = () => {
  const [errorLessonId, setErrorLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Восстанавливаем мониторинги при инициализации
    globalLessonMonitoring.restoreMonitoring();

    // Подписка на ошибки
    const unsubscribeError = globalLessonMonitoring.subscribeToError((lessonId, error) => {
      setErrorLessonId(lessonId);
    });
    
    // Очистка при размонтировании приложения (не компонента)
    return () => {
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
