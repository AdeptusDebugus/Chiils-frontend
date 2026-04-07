import { checkLessonReady, LessonReadyResponse } from './api';

export interface LessonMonitorConfig {
  lessonId: string;
  lessonName: string;
  onReady: (lessonId: string, lessonName: string) => void;
  onError: (lessonId: string, error: string) => void;
  initialDelayMs?: number; // Начальная задержка перед началом мониторинга, по умолчанию 5 минут
  intervalMs?: number; // Интервал проверки в миллисекундах, по умолчанию 30 секунд
  maxAttempts?: number; // Максимальное количество попыток, по умолчанию 100 (50 минут)
}

class LessonMonitoringService {
  private monitors: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private attemptCounts: Map<string, number> = new Map();
  private configs: Map<string, LessonMonitorConfig> = new Map();

  /**
   * Начинает мониторинг готовности урока
   */
  startMonitoring(config: LessonMonitorConfig): void {
    const { lessonId } = config;
    
    // Если уже мониторим этот урок, прекращаем предыдущий мониторинг
    if (this.monitors.has(lessonId)) {
      this.stopMonitoring(lessonId);
    }

    // Сохраняем конфигурацию
    this.configs.set(lessonId, config);
    this.attemptCounts.set(lessonId, 0);

    const initialDelay = config.initialDelayMs || 300000; // По умолчанию 5 минут (300000 мс)
    
    console.log(`Starting monitoring for lesson ${lessonId}: ${config.lessonName}`);
    console.log(`Initial delay: ${initialDelay / 1000} seconds before first check`);

    // Начальная задержка перед первой проверкой
    const initialTimeout = setTimeout(() => {
      console.log(`Initial delay completed for lesson ${lessonId}, starting checks`);
      
      // Создаем интервал для проверки
      const interval = setInterval(() => {
        this.checkLessonStatus(lessonId);
      }, config.intervalMs || 30000); // По умолчанию каждые 30 секунд

      this.monitors.set(lessonId, interval);

      // Первая проверка после задержки
      this.checkLessonStatus(lessonId);
    }, initialDelay);

    // Сохраняем timeout как монитор (для возможности остановки)
    this.monitors.set(lessonId, initialTimeout);
  }

  /**
   * Останавливает мониторинг урока
   */
  stopMonitoring(lessonId: string): void {
    const interval = this.monitors.get(lessonId);
    if (interval) {
      clearInterval(interval);
      this.monitors.delete(lessonId);
      this.attemptCounts.delete(lessonId);
      this.configs.delete(lessonId);
      console.log(`Stopped monitoring for lesson ${lessonId}`);
    }
  }

  /**
   * Проверяет статус конкретного урока
   */
  private async checkLessonStatus(lessonId: string): Promise<void> {
    const config = this.configs.get(lessonId);
    const currentAttempts = this.attemptCounts.get(lessonId) || 0;

    if (!config) {
      console.error(`No config found for lesson ${lessonId}`);
      return;
    }

    const maxAttempts = config.maxAttempts || 100;

    // Проверяем, не превышено ли максимальное количество попыток
    if (currentAttempts >= maxAttempts) {
      console.log(`Max attempts reached for lesson ${lessonId}, stopping monitoring`);
      this.stopMonitoring(lessonId);
      config.onError(lessonId, 'Превышено максимальное время ожидания. Попробуйте создать урок заново.');
      return;
    }

    try {
      console.log(`Checking lesson ${lessonId} status (attempt ${currentAttempts + 1}/${maxAttempts})`);
      
      const response: LessonReadyResponse = await checkLessonReady(lessonId);
      
      if (response.success && response.is_ready) {
        console.log(`Lesson ${lessonId} is ready!`);
        this.stopMonitoring(lessonId);
        config.onReady(lessonId, config.lessonName);
      } else if (response.status === 'ERROR') {
        console.log(`Lesson ${lessonId} failed with ERROR status`);
        this.stopMonitoring(lessonId);
        config.onError(lessonId, response.message || 'Ошибка генерации урока');
      } else {
        // Увеличиваем счетчик попыток
        this.attemptCounts.set(lessonId, currentAttempts + 1);
        console.log(`Lesson ${lessonId} not ready yet: ${response.message}`);
      }
    } catch (error) {
      console.error(`Error checking lesson ${lessonId} status:`, error);
      
      // Увеличиваем счетчик попыток даже при ошибке
      this.attemptCounts.set(lessonId, currentAttempts + 1);
      
      // Если это последняя попытка, вызываем onError
      if (currentAttempts + 1 >= maxAttempts) {
        this.stopMonitoring(lessonId);
        config.onError(lessonId, error instanceof Error ? error.message : 'Неизвестная ошибка');
      }
    }
  }

  /**
   * Получает список активных мониторингов
   */
  getActiveMonitors(): string[] {
    return Array.from(this.monitors.keys());
  }

  /**
   * Останавливает все активные мониторинги
   */
  stopAllMonitoring(): void {
    const activeLessonIds = Array.from(this.monitors.keys());
    activeLessonIds.forEach(lessonId => {
      this.stopMonitoring(lessonId);
    });
  }

  /**
   * Проверяет, мониторится ли урок
   */
  isMonitoring(lessonId: string): boolean {
    return this.monitors.has(lessonId);
  }
}

// Создаем единственный экземпляр сервиса
export const lessonMonitoringService = new LessonMonitoringService();

