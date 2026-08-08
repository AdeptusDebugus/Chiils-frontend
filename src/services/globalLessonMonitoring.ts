import { lessonMonitoringService } from './lessonMonitoringService';

interface SavedMonitoring {
  lessonId: string;
  lessonName: string;
  startTime: number;
}

class GlobalLessonMonitoring {
  private static instance: GlobalLessonMonitoring;
  private listeners: Set<(lessonId: string, lessonName: string) => void> = new Set();
  private errorListeners: Set<(lessonId: string, error: string) => void> = new Set();
  private silentMode: boolean = false;
  private readonly STORAGE_KEY = 'active_lesson_monitoring';
  private readonly SHOWN_ERRORS_KEY = 'shown_lesson_errors';

  private constructor() { }

  static getInstance(): GlobalLessonMonitoring {
    if (!GlobalLessonMonitoring.instance) {
      GlobalLessonMonitoring.instance = new GlobalLessonMonitoring();
    }
    return GlobalLessonMonitoring.instance;
  }

  // Подписка на событие готовности урока
  subscribe(callback: (lessonId: string, lessonName: string) => void) {
    this.listeners.add(callback);
    return () => { this.listeners.delete(callback); };
  }

  // Подписка на ошибку генерации урока
  subscribeToError(callback: (lessonId: string, error: string) => void) {
    this.errorListeners.add(callback);
    return () => { this.errorListeners.delete(callback); };
  }

  setSilentMode(silent: boolean) {
    this.silentMode = silent;
  }

  private notifyListeners(lessonId: string, lessonName: string) {
    this.listeners.forEach(cb => cb(lessonId, lessonName));
  }

  private notifyErrorListeners(lessonId: string, error: string) {
    this.errorListeners.forEach(cb => cb(lessonId, error));
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

  // Работа с ошибками
  private getShownErrors(): string[] {
    try {
      const saved = localStorage.getItem(this.SHOWN_ERRORS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  private isErrorShown(lessonId: string): boolean {
    return this.getShownErrors().includes(lessonId);
  }

  markErrorAsShown(lessonId: string) {
    const shown = this.getShownErrors();
    if (!shown.includes(lessonId)) {
      shown.push(lessonId);
      localStorage.setItem(this.SHOWN_ERRORS_KEY, JSON.stringify(shown));
    }
  }

  // Запускаем мониторинг урока
  startMonitoring(lessonId: string, lessonName: string) {

    // Сохраняем в localStorage
    this.saveActiveMonitoring(lessonId, lessonName);

    lessonMonitoringService.startMonitoring({
      lessonId,
      lessonName,
      onReady: (id: string, name: string) => {
        this.removeActiveMonitoring(id);
        this.notifyListeners(id, name);
      },
      onError: (id: string, error: string) => {
        this.removeActiveMonitoring(id);
        if (!this.isErrorShown(id)) {
          this.notifyErrorListeners(id, error);
        }
        this.notifyListeners(id, lessonName); // Still notify completion (even if error) to refresh lists
      },
      initialDelayMs: 300000, // Начальная задержка 5 минут перед первой проверкой
      intervalMs: 30000,      // Проверяем каждые 30 секунд
      maxAttempts: 100        // Максимум 100 попыток (50 минут активного мониторинга)
    });
  }

  // Останавливаем мониторинг конкретного урока
  stopMonitoring(lessonId: string) {
    this.removeActiveMonitoring(lessonId);
    lessonMonitoringService.stopMonitoring(lessonId);
  }

  // Останавливаем все мониторинги
  stopAllMonitoring() {
    this.clearActiveMonitoring();
    lessonMonitoringService.stopAllMonitoring();
  }

  // Восстанавливаем мониторинги при загрузке приложения
  restoreMonitoring() {
    const active = this.getActiveMonitoring();

    active.forEach(({ lessonId, lessonName, startTime }) => {
      // Проверяем, что мониторинг не старше 2 часов
      const twoHours = 2 * 60 * 60 * 1000;
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < twoHours) {

        // Если прошло больше 5 минут, начинаем мониторинг без задержки
        const fiveMinutes = 5 * 60 * 1000;
        const shouldSkipDelay = elapsedTime > fiveMinutes;

        if (shouldSkipDelay) {
          lessonMonitoringService.startMonitoring({
            lessonId,
            lessonName,
            onReady: (id: string, name: string) => {
              this.removeActiveMonitoring(id);
              this.notifyListeners(id, name);
            },
            onError: (id: string, error: string) => {
              this.removeActiveMonitoring(id);
              if (!this.isErrorShown(id)) {
                this.notifyErrorListeners(id, error);
              }
              this.notifyListeners(id, lessonName);
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
        this.removeActiveMonitoring(lessonId);
      }
    });
  }

}

// Создаем единственный экземпляр
export const globalLessonMonitoring = GlobalLessonMonitoring.getInstance();
