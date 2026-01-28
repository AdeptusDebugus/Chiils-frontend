import { lessonMonitoringService } from './lessonMonitoringService';
import { createLessonReadyNotification, createLessonErrorNotification } from './lessonMonitoringService';

interface SavedMonitoring {
  lessonId: string;
  lessonName: string;
  startTime: number;
}

class GlobalLessonMonitoring {
  private static instance: GlobalLessonMonitoring;
  private notificationCallback: ((notification: any) => void) | null = null;
  private listeners: Set<(lessonId: string) => void> = new Set();
  private silentMode: boolean = false;
  private readonly STORAGE_KEY = 'active_lesson_monitoring';

  private constructor() { }

  static getInstance(): GlobalLessonMonitoring {
    if (!GlobalLessonMonitoring.instance) {
      GlobalLessonMonitoring.instance = new GlobalLessonMonitoring();
    }
    return GlobalLessonMonitoring.instance;
  }

  // Подписка на событие готовности урока
  subscribe(callback: (lessonId: string) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(lessonId: string) {
    this.listeners.forEach(cb => cb(lessonId));
  }

  // Устанавливаем callback для показа уведомлений
  setNotificationCallback(callback: (notification: any) => void) {
    this.notificationCallback = callback;
  }

  setSilentMode(silent: boolean) {
    this.silentMode = silent;
  }

  // Показываем уведомление через callback
  private showNotification(notification: any) {
    if (this.silentMode) {
      console.log('Global: Silent mode active, suppressing notification', notification);
      return;
    }
    if (this.notificationCallback) {
      this.notificationCallback(notification);
    } else {
      console.warn('Notification callback not set');
    }
  }

  // Сохраняем активный мониторинг в localStorage
  private saveActiveMonitoring(lessonId: string, lessonName: string) {
    const saved: SavedMonitoring = {
      lessonId,
      lessonName,
      startTime: Date.now()
    };

    const active = this.getActiveMonitoring();
    active.push(saved);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(active));
  }

  // Получаем активные мониторинги из localStorage
  private getActiveMonitoring(): SavedMonitoring[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading active monitoring:', error);
      return [];
    }
  }

  // Удаляем мониторинг из localStorage
  private removeActiveMonitoring(lessonId: string) {
    const active = this.getActiveMonitoring();
    const filtered = active.filter(m => m.lessonId !== lessonId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Очищаем все сохраненные мониторинги
  private clearActiveMonitoring() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Запускаем мониторинг урока
  startMonitoring(lessonId: string, lessonName: string) {
    console.log('Global: Starting monitoring for lesson:', lessonId);

    // Сохраняем в localStorage
    this.saveActiveMonitoring(lessonId, lessonName);

    lessonMonitoringService.startMonitoring({
      lessonId,
      lessonName,
      onReady: (id: string, name: string) => {
        console.log('Global: Lesson ready:', id, name);
        this.removeActiveMonitoring(id);
        this.showNotification(createLessonReadyNotification(id, name));
        this.notifyListeners(id);
      },
      onError: (id: string, error: string) => {
        console.log('Global: Lesson error:', id, error);
        this.removeActiveMonitoring(id);
        this.showNotification(createLessonErrorNotification(id, error));
        this.notifyListeners(id);
      },
      initialDelayMs: 300000, // Начальная задержка 5 минут перед первой проверкой
      intervalMs: 30000,      // Проверяем каждые 30 секунд
      maxAttempts: 100        // Максимум 100 попыток (50 минут активного мониторинга)
    });
  }

  // Останавливаем мониторинг конкретного урока
  stopMonitoring(lessonId: string) {
    console.log('Global: Stopping monitoring for lesson:', lessonId);
    this.removeActiveMonitoring(lessonId);
    lessonMonitoringService.stopMonitoring(lessonId);
  }

  // Останавливаем все мониторинги
  stopAllMonitoring() {
    console.log('Global: Stopping all monitoring');
    this.clearActiveMonitoring();
    lessonMonitoringService.stopAllMonitoring();
  }

  // Восстанавливаем мониторинги при загрузке приложения
  restoreMonitoring() {
    const active = this.getActiveMonitoring();
    console.log('Global: Restoring monitoring for', active.length, 'lessons');

    active.forEach(({ lessonId, lessonName, startTime }) => {
      // Проверяем, что мониторинг не старше 2 часов
      const twoHours = 2 * 60 * 60 * 1000;
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < twoHours) {
        console.log('Global: Restoring monitoring for lesson:', lessonId);

        // Если прошло больше 5 минут, начинаем мониторинг без задержки
        const fiveMinutes = 5 * 60 * 1000;
        const shouldSkipDelay = elapsedTime > fiveMinutes;

        if (shouldSkipDelay) {
          console.log('Global: Skipping initial delay for restored lesson:', lessonId);
          lessonMonitoringService.startMonitoring({
            lessonId,
            lessonName,
            onReady: (id: string, name: string) => {
              console.log('Global: Lesson ready:', id, name);
              this.removeActiveMonitoring(id);
              this.showNotification(createLessonReadyNotification(id, name));
              this.notifyListeners(id);
            },
            onError: (id: string, error: string) => {
              console.log('Global: Lesson error:', id, error);
              this.removeActiveMonitoring(id);
              this.showNotification(createLessonErrorNotification(id, error));
              this.notifyListeners(id);
            },
            initialDelayMs: 0,  // Без задержки для восстановленных уроков
            intervalMs: 30000,  // Проверяем каждые 30 секунд
            maxAttempts: 100    // Максимум 100 попыток
          });
        } else {
          // Обычный мониторинг с задержкой
          this.startMonitoring(lessonId, lessonName);
        }
      } else {
        console.log('Global: Skipping expired monitoring for lesson:', lessonId);
        this.removeActiveMonitoring(lessonId);
      }
    });
  }

}

// Создаем единственный экземпляр
export const globalLessonMonitoring = GlobalLessonMonitoring.getInstance();
