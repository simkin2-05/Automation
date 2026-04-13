import { UpgradeDefinition } from '../types/game';

export const UPGRADE_DEFINITIONS: UpgradeDefinition[] = [
  {
    key: 'engine',
    label: 'Engine',
    description: 'Higher top speed for faster passenger runs.',
    costs: [120, 250, 420],
  },
  {
    key: 'tyres',
    label: 'Tyres',
    description: 'Stronger braking and tighter turn handling.',
    costs: [100, 210, 360],
  },
  {
    key: 'tintedWindows',
    label: 'Tinted Windows',
    description: 'Reduce police detection range while escaping.',
    costs: [150, 290, 460],
  },
];
