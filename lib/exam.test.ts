import { describe, expect, it } from 'vitest';
import { remaining, transition, type ExamSession } from './exam';

const session: ExamSession = { id: 'test', status: 'EXAM_RUNNING', startedAt: 1000, durationMs: 60000, answers: {}, events: [], sync: 'synced', questionIndex: 0 };
describe('exam state machine', () => {
  it('accepts expected transitions and ignores invalid ones', () => {
    expect(transition('NOT_STARTED', 'EXAM_RUNNING')).toBe('EXAM_RUNNING');
    expect(transition('NOT_STARTED', 'COMPLETED')).toBe('NOT_STARTED');
  });
  it('derives remaining time from timestamps', () => {
    expect(remaining(session, 11000)).toBe(50000);
    expect(remaining({ ...session, status: 'PAUSED', pausedAt: 11000 }, 50000)).toBe(50000);
  });
});
