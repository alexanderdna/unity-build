export const UnityBuildTargetNames = [
  'Standalone',
  'Win',
  'Win64',
  'OSXUniversal',
  'Linux64',
  'iOS',
  'Android',
  'WebGL',
  'XboxOne',
  'PS4',
  'WindowsStoreApps',
  'Switch',
  'tvOS',
] as const;

export function isValidTarget(t: string): boolean {
  return UnityBuildTargetNames.indexOf(t as UnityBuildTarget) >= 0;
}

export type UnityBuildTarget = typeof UnityBuildTargetNames[number];
