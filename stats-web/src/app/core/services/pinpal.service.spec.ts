import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SqlJsStatic } from 'sql.js';

import { PinpalService } from './pinpal.service';
import { AppDB } from './db.service';
import { Game } from './pinpal.model';

describe('PinpalService', () => {
  let service: PinpalService;

  beforeEach(() => {
    // Mock window.initSqlJs before TestBed configuration
    const mockDatabase = {
      close: vi.fn(),
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn(),
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn(),
        free: vi.fn(),
      }),
    };
    const mockSqlJs = {
      Database: vi.fn().mockImplementation(() => mockDatabase),
    };
    const mockInitSqlJs = vi.fn().mockResolvedValue(mockSqlJs);
    (mockInitSqlJs as any).default = mockInitSqlJs;
    window.initSqlJs = mockInitSqlJs as unknown as typeof window.initSqlJs;

    // Mock AppDB service to avoid IndexedDB access
    const mockAppDB = {
      databaseFiles: {
        get: vi.fn().mockResolvedValue(null),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AppDB, useValue: mockAppDB },
      ],
    });
    service = TestBed.inject(PinpalService);
  });

  afterEach(() => {
    // Clean up the mock
    delete (window as any).initSqlJs;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadGameStats', () => {
    it('should return all zero stats for empty games array', async () => {
      const stats = await service.loadGameStats([]);
      expect(stats.average).toBe(0);
      expect(stats.high).toBe(0);
      expect(stats.count).toBe(0);
      expect(stats.cleanCount).toBe(0);
      expect(stats.strikesPercent).toBe(0);
      expect(stats.pocketHitsPercent).toBe(0);
      expect(stats.opensPercent).toBe(0);
      expect(stats.sparesPercent).toBe(0);
      expect(stats.singlePinPickupPercent).toBe(0);
      expect(stats.gutters).toBe(0);
    });

    it('should return all zero stats when database is not loaded', async () => {
      const stats = await service.loadGameStats([
        { pk: 1 } as Game,
      ]);
      // When sqlDB is null, should return all zeros
      expect(stats.average).toBe(0);
      expect(stats.strikesPercent).toBe(0);
    });
  });

  describe('calculatePercent', () => {
    it('should calculate percentage correctly', () => {
      // Access private method through any for testing
      const result = (service as any).calculatePercent(25, 100);
      expect(result).toBe(25);
    });

    it('should round percentage to nearest integer', () => {
      const result = (service as any).calculatePercent(1, 3);
      expect(result).toBe(33);
    });

    it('should return 0 when denominator is 0', () => {
      const result = (service as any).calculatePercent(10, 0);
      expect(result).toBe(0);
    });

    it('should return 100 for full percentage', () => {
      const result = (service as any).calculatePercent(100, 100);
      expect(result).toBe(100);
    });
  });
});
