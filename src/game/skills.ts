import { SkillName, Skills } from './types.ts';

export const SKILL_LIST: { name: SkillName; label: string; icon: string; color: string }[] = [
  { name: 'attack', label: 'Attack', icon: '⚔️', color: '#dc2626' },
  { name: 'strength', label: 'Strength', icon: '💪', color: '#16a34a' },
  { name: 'defence', label: 'Defence', icon: '🛡️', color: '#2563eb' },
  { name: 'hitpoints', label: 'Hitpoints', icon: '❤️', color: '#dc2626' },
  { name: 'ranged', label: 'Ranged', icon: '🏹', color: '#65a30d' },
  { name: 'prayer', label: 'Prayer', icon: '🙏', color: '#06b6d4' },
  { name: 'magic', label: 'Magic', icon: '🔮', color: '#7c3aed' },
  { name: 'cooking', label: 'Cooking', icon: '🍳', color: '#7c2d12' },
  { name: 'woodcutting', label: 'Woodcutting', icon: '🪓', color: '#854d0e' },
  { name: 'fishing', label: 'Fishing', icon: '🎣', color: '#0369a1' },
  { name: 'firemaking', label: 'Firemaking', icon: '🔥', color: '#ea580c' },
  { name: 'crafting', label: 'Crafting', icon: '🧵', color: '#9333ea' },
  { name: 'smithing', label: 'Smithing', icon: '🔨', color: '#4b5563' },
  { name: 'mining', label: 'Mining', icon: '⛏️', color: '#78716c' },
  { name: 'runecraft', label: 'Runecraft', icon: '✨', color: '#f59e0b' },
];

// XP table — same formula as OSRS
const XP_TABLE: number[] = [0];
let points = 0;
for (let lvl = 1; lvl < 100; lvl++) {
  points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
  XP_TABLE.push(Math.floor(points / 4));
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > 99) return XP_TABLE[99] || 13034431;
  return XP_TABLE[level - 1] || 0;
}

export function levelForXp(xp: number): number {
  for (let i = 98; i >= 0; i--) {
    if (xp >= XP_TABLE[i]) return i + 1;
  }
  return 1;
}

export function xpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevel = levelForXp(xp);
  if (currentLevel >= 99) return { current: xp, needed: 0, progress: 1 };
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  return { current: xpInLevel, needed: xpNeeded, progress: xpInLevel / xpNeeded };
}

export function createDefaultSkills(): Skills {
  const skills: Partial<Skills> = {};
  for (const s of SKILL_LIST) {
    if (s.name === 'hitpoints') {
      skills[s.name] = { level: 10, xp: xpForLevel(10) };
    } else {
      skills[s.name] = { level: 1, xp: 0 };
    }
  }
  return skills as Skills;
}

export function getTotalLevel(skills: Skills): number {
  return Object.values(skills).reduce((sum, s) => sum + s.level, 0);
}

export function getCombatLevel(skills: Skills): number {
  const base = 0.25 * (skills.defence.level + skills.hitpoints.level + Math.floor(skills.prayer.level / 2));
  const melee = 0.325 * (skills.attack.level + skills.strength.level);
  const range = 0.325 * Math.floor(skills.ranged.level * 1.5);
  const mage = 0.325 * Math.floor(skills.magic.level * 1.5);
  return Math.floor(base + Math.max(melee, range, mage));
}
