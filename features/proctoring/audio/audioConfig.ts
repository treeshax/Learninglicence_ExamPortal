/** Conservative defaults: short environmental noises do not become violations. */
export const AUDIO_CONFIG = {
  analysisIntervalMs: 200,
  fftSize: 1024,
  minimumRms: 0.018,
  noiseMultiplier: 3,
  speechDetectionMs: 600,
  sustainedSpeechMs: 1800,
  activityCooldownMs: 5000,
  speechCooldownMs: 10000,
  repeatWindowMs: 30000,
  recordingChunkMs: 5000,
} as const;
