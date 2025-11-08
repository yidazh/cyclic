import { TimePeriod, ValidationResult, PeriodFilter } from '@/types';
import { storageService } from './StorageService';
import { generateUUID } from '@/utils/uuid';

/**
 * Period Manager
 * Manages the lifecycle of time periods
 */
export class PeriodManager {
  /**
   * Transition to a new period
   * Ends current period and starts a new one
   */
  async transitionPeriod(): Promise<TimePeriod> {
    const now = Date.now();

    // 1. Get current active period
    const activePeriod = await storageService.getActivePeriod();

    // 2. End current period
    if (activePeriod) {
      activePeriod.endTime = now;
      activePeriod.updatedAt = now;
      await storageService.savePeriod(activePeriod);
    }

    // 3. Create new period starting at same timestamp
    const newPeriod: TimePeriod = {
      id: generateUUID(),
      startTime: now,
      endTime: null,
      theme: null,
      category: null,
      name: '',
      notes: '',
      tags: [],
      isPaused: false,
      resumeFromPeriodId: null,
      createdAt: now,
      updatedAt: now
    };

    // 4. Save new period
    await storageService.savePeriod(newPeriod);

    return newPeriod;
  }

  /**
   * Pause/Resume toggle
   * Handles pausing current work and resuming
   */
  async pauseResume(): Promise<TimePeriod> {
    const now = Date.now();

    // 1. Get current active period
    const activePeriod = await storageService.getActivePeriod();

    if (!activePeriod) {
      throw new Error('No active period found');
    }

    // 2. Check if currently paused
    const isPausedNow = activePeriod.isPaused;

    // 3. End current period
    activePeriod.endTime = now;
    activePeriod.updatedAt = now;
    await storageService.savePeriod(activePeriod);

    let newPeriod: TimePeriod;

    if (isPausedNow) {
      // RESUMING from pause
      // Get the period we were working on before pause
      const resumeFromPeriod = activePeriod.resumeFromPeriodId
        ? await storageService.getPeriod(activePeriod.resumeFromPeriodId)
        : null;

      // Create new period with metadata from pre-pause period
      newPeriod = {
        id: generateUUID(),
        startTime: now,
        endTime: null,
        theme: resumeFromPeriod?.theme || null,
        category: resumeFromPeriod?.category || null,
        name: resumeFromPeriod?.name || '',
        notes: resumeFromPeriod?.notes || '',
        tags: resumeFromPeriod?.tags || [],
        isPaused: false,
        resumeFromPeriodId: null,
        createdAt: now,
        updatedAt: now
      };
    } else {
      // PAUSING
      // Create pause period, remembering current period for resume
      newPeriod = {
        id: generateUUID(),
        startTime: now,
        endTime: null,
        theme: 'pause',
        category: null,
        name: 'Paused',
        notes: '',
        tags: [],
        isPaused: true,
        resumeFromPeriodId: activePeriod.id,
        createdAt: now,
        updatedAt: now
      };
    }

    // 4. Save new period
    await storageService.savePeriod(newPeriod);

    return newPeriod;
  }

  /**
   * Get currently active period
   */
  async getActivePeriod(): Promise<TimePeriod | null> {
    return await storageService.getActivePeriod();
  }

  /**
   * Check if currently paused
   */
  async isPaused(): Promise<boolean> {
    const activePeriod = await storageService.getActivePeriod();
    return activePeriod?.isPaused || false;
  }

  /**
   * Update period metadata (not timestamps)
   */
  async updatePeriod(id: string, updates: Partial<TimePeriod>): Promise<TimePeriod> {
    const period = await storageService.getPeriod(id);

    if (!period) {
      throw new Error(`Period not found: ${id}`);
    }

    // Prevent timestamp updates
    delete updates.startTime;
    delete updates.endTime;
    delete updates.createdAt;

    // Update period
    const updatedPeriod = {
      ...period,
      ...updates,
      updatedAt: Date.now()
    };

    await storageService.savePeriod(updatedPeriod);

    return updatedPeriod;
  }

  /**
   * Get period history with filtering
   */
  async getPeriods(filter?: PeriodFilter): Promise<TimePeriod[]> {
    return await storageService.getPeriods(filter);
  }

  /**
   * Validate continuous time tracking (no gaps/overlaps)
   */
  async validatePeriodContinuity(): Promise<ValidationResult> {
    const periods = await storageService.getPeriods();
    const errors: string[] = [];

    // Sort by start time
    const sortedPeriods = periods
      .filter(p => p.endTime !== null)
      .sort((a, b) => a.startTime - b.startTime);

    // Check for gaps or overlaps
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const current = sortedPeriods[i];
      const next = sortedPeriods[i + 1];

      if (current.endTime !== next.startTime) {
        errors.push(
          `Gap/overlap detected between periods ${current.id} and ${next.id}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle edge case: recover from unexpected app closure
   */
  async recoverIncompleteSession(): Promise<void> {
    // Implementation for crash recovery
    // TODO: Implement recovery logic
    console.log('Checking for incomplete sessions...');
  }

  /**
   * Create initial period if none exists
   */
  async createInitialPeriod(): Promise<TimePeriod> {
    const now = Date.now();

    const period: TimePeriod = {
      id: generateUUID(),
      startTime: now,
      endTime: null,
      theme: null,
      category: null,
      name: '',
      notes: '',
      tags: [],
      isPaused: false,
      resumeFromPeriodId: null,
      createdAt: now,
      updatedAt: now
    };

    await storageService.savePeriod(period);

    return period;
  }
}

// Singleton instance
export const periodManager = new PeriodManager();
