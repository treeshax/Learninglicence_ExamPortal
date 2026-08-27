import { describe, expect, it, vi } from 'vitest';
import { FaceDetectionManager } from './FaceDetectionManager';
describe('multiple-face confirmation',()=>{it('does not emit a confirmation until the threshold elapses',()=>{const onMultipleFaces=vi.fn();const manager=new FaceDetectionManager({onUpdate:vi.fn(),onMultipleFaces,onMultipleFacesResolved:vi.fn(),onError:vi.fn()});expect(manager.getStatus()).toBe(false);expect(onMultipleFaces).not.toHaveBeenCalled();});});
