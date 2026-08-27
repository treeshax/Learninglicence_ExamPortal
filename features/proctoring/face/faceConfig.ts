/** Tuned for responsive local monitoring rather than forensic identification. */
export const FACE_CONFIG = {
  detectionIntervalMs: 80,
  multipleFaceConfirmationMs: 1000,
  noFaceViolationMs: 2000,
  lookingAwayWarningMs: 2000,
  lookingAwayViolationMs: 5000,
  yawThresholdDegrees: 25,
  pitchThresholdDegrees: 20,
  movementThreshold: 0.22,
  maxFaces: 2,
  model: 'MediaPipe Face Landmarker',
} as const;
