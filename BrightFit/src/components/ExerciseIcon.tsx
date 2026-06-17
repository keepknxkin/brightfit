/**
 * Maps the legacy exercise `emoji` string to a proper SVG icon.
 * Groups similar emojis → same icon shape; falls back to a generic dumbbell.
 */
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface Props {
  emoji: string;
  size?: number;
  color?: string;
}

// ── Individual icon shapes ────────────────────────────────────────────────

function Flame({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C10 6 7 9.5 7 13.5a5 5 0 0010 0C17 9.5 14 6 12 2z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
      <Path
        d="M12 17a2 2 0 002-2"
        stroke={color} strokeWidth="1.6" strokeLinecap="round"
      />
    </Svg>
  );
}

function Dumbbell({ size, color }: { size: number; color: string }) {
  const s = size / 24;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="1"    y="9"    width="3"   height="7"  rx="1.5" fill={color} />
      <Rect x="4"    y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
      <Rect x="6.5"  y="11.5" width="11"  height="2"  rx="1"   fill={color} />
      <Rect x="17.5" y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
      <Rect x="20"   y="9"    width="3"   height="7"  rx="1.5" fill={color} />
    </Svg>
  );
}

function Barbell({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="7"  y="10.5" width="10" height="3"  rx="1"   fill={color} />
      <Rect x="1"  y="8"    width="4"  height="8"  rx="1.5" fill={color} />
      <Rect x="19" y="8"    width="4"  height="8"  rx="1.5" fill={color} />
      <Rect x="5"  y="9"    width="2"  height="6"  rx="0.5" fill={color} />
      <Rect x="17" y="9"    width="2"  height="6"  rx="0.5" fill={color} />
    </Svg>
  );
}

function Lightning({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2L4 14h7l-1 8 9-12h-6L13 2z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function CycleArrows({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v3l4-4-4-4v3A7 7 0 105 12h2a5 5 0 115-5z"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonStretch({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="4" r="2.2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M6 10l6 2 6-2M9 12l-2 6m10-6l2 6M9 12l1 5h4l1-5"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function LegIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3h6v7l2 7a2 2 0 01-2 2H9a2 2 0 01-2-2l2-7V3z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
      <Path
        d="M9 10h6"
        stroke={color} strokeWidth="1.6" strokeLinecap="round"
      />
    </Svg>
  );
}

function Wave({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 10c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      <Path
        d="M2 15c2-2.5 4-2.5 6 0s4 2.5 6 0 4-2.5 6 0"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
    </Svg>
  );
}

function GluteCircles({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8.5"  cy="14" r="5" stroke={color} strokeWidth="1.8" />
      <Circle cx="15.5" cy="14" r="5" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

function Target({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9"   stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="12" cy="12" r="2"   fill={color} />
    </Svg>
  );
}

function Stopwatch({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="8"   stroke={color} strokeWidth="1.8" />
      <Path d="M12 9v4l2.5 2.5"       stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9.5 3h5M12 3v2"       stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

function Runner({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="14" cy="3.5" r="2" fill={color} />
      <Path
        d="M7 8l4 2 3-3 4 1M11 10l-2 5 3 4m0-9l2 4-3 4"
        stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function Mountain({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20L9 8l4.5 5.5L17 9l4 11H3z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"
      />
    </Svg>
  );
}

function Heart({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
    </Svg>
  );
}

function Shield({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color} strokeWidth="1.8" strokeLinejoin="round"
      />
    </Svg>
  );
}

function BallSplat({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Path
        d="M5 7.5c2 1 4 .5 5.5 2S11.5 13 13 14s3.5 1.5 5.5 2.5"
        stroke={color} strokeWidth="1.6" strokeLinecap="round"
      />
      <Path
        d="M7 16.5c1.5-1.5 3.5-1.5 5-3"
        stroke={color} strokeWidth="1.6" strokeLinecap="round"
      />
    </Svg>
  );
}

function JumpArrow({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20V4M5 11l7-7 7 7"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

function Bird({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12c3-4 7-4 10-2 3-2 7-2 10 2"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
      <Path
        d="M12 10v6"
        stroke={color} strokeWidth="1.8" strokeLinecap="round"
      />
    </Svg>
  );
}

function Worm({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="4"  cy="12" r="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="10" cy="12" r="2.5" stroke={color} strokeWidth="1.8" />
      <Circle cx="16" cy="12" r="2.5" stroke={color} strokeWidth="1.8" />
      <Path d="M6.5 12h1M12.5 12h1" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

// ── Emoji → icon map ─────────────────────────────────────────────────────────

type IconFn = (props: { size: number; color: string }) => JSX.Element;

const EMOJI_MAP: Record<string, IconFn> = {
  // Fire / intensity
  '🔥': Flame,
  '💥': Flame,

  // Strength / weight
  '💪': Dumbbell,
  '🏋️': Barbell,
  '🦸': Shield,
  '🪖': Shield,

  // Power / electricity
  '⚡': Lightning,

  // Rotation / mobility
  '🌀': CycleArrows,
  '🔄': CycleArrows,
  '🔀': CycleArrows,

  // Stretching / body poses
  '🤸': PersonStretch,
  '🧘': PersonStretch,
  '🙆': PersonStretch,

  // Legs / feet
  '🦵': LegIcon,
  '🦶': LegIcon,

  // Waves / flow
  '🌊': Wave,
  '🌅': Wave,

  // Glutes
  '🍑': GluteCircles,

  // Target / precision
  '🎯': Target,

  // Timer
  '⏱️': Stopwatch,

  // Running / walking / jumping
  '🏃': Runner,
  '🚶': Runner,
  '🦘': JumpArrow,
  '🦿': LegIcon,

  // Mountain / outdoors
  '🏔️': Mountain,

  // Star / award
  '⭐': Star,
  '🥇': Star,

  // Heart / nature
  '🫶': Heart,
  '🕊️': Bird,

  // Ball / slam
  '⚽': BallSplat,

  // Crawl / core
  '🐛': Worm,
  '🐕': Worm,
};

const DEFAULT_ICON: IconFn = Dumbbell;

// ── Public component ─────────────────────────────────────────────────────────

export default function ExerciseIcon({ emoji, size = 24, color = '#FFB800' }: Props) {
  const Icon = EMOJI_MAP[emoji] ?? DEFAULT_ICON;
  return <Icon size={size} color={color} />;
}
