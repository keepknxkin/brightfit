import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface Props {
  iconKey: string;
  color: string;
  size?: number;
}

export default function AchievementIcon({ iconKey, color, size = 24 }: Props) {
  const s = size;
  switch (iconKey) {

    // ── Mini achievement icons ────────────────────────────────────────────────

    case 'star':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17.8l-6.2 3.5 2.4-7.4L2 9.4h7.6z"
            fill={color}
          />
        </Svg>
      );

    case 'flame':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M12 2C10 6 7 9.5 7 13.5C7 17.09 9.24 20 12 20C14.76 20 17 17.09 17 13.5C17 9.5 14 6 12 2Z"
            fill={color}
          />
          <Path
            d="M12 10C11 12 10.5 13 10.5 14.5C10.5 16 11.1 17.5 12 17.5C12.9 17.5 13.5 16 13.5 14.5C13.5 13 13 12 12 10Z"
            fill="#0B0B0F"
            opacity={0.35}
          />
        </Svg>
      );

    case 'lightning':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" fill={color} />
        </Svg>
      );

    case 'dumbbell':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="1"    y="9"    width="3"   height="7"  rx="1.5" fill={color} />
          <Rect x="4"    y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
          <Rect x="6.5"  y="11.5" width="11"  height="2"  rx="1"   fill={color} />
          <Rect x="17.5" y="10.5" width="2.5" height="4"  rx="0.5" fill={color} />
          <Rect x="20"   y="9"    width="3"   height="7"  rx="1.5" fill={color} />
        </Svg>
      );

    case 'trophy':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M6 3h12v8a6 6 0 01-12 0V3z" fill={color} />
          <Path
            d="M6 5H3.5a2.5 2.5 0 000 5H6"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M18 5h2.5a2.5 2.5 0 010 5H18"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Rect x="10" y="17" width="4" height="3" rx="0.5" fill={color} />
          <Rect x="8"  y="20" width="8" height="2" rx="1"   fill={color} />
        </Svg>
      );

    case 'crown':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M3 18h18l-3-10-5 5-3-8-3 8-5-5z" fill={color} />
          <Rect x="3" y="19" width="18" height="2" rx="1" fill={color} />
        </Svg>
      );

    case 'chain':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx="5"  cy="12" r="3.5" stroke={color} strokeWidth="2.2" />
          <Circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="2.2" />
          <Circle cx="19" cy="12" r="3.5" stroke={color} strokeWidth="2.2" />
          <Path d="M8.5 12h3M15.5 12h0" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} />
          <Path
            d="M9 12l2 2 4-4"
            stroke="#0B0B0F"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'gem':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M12 2L2 9l10 13L22 9z" fill={color} />
          <Path
            d="M2 9h20M7 9l5-7 5 7"
            stroke="#0B0B0F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
            fill="none"
          />
        </Svg>
      );

    case 'sneaker':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M3 14.5C3 13.2 4.2 11 7 11L11 8.5C12.5 7.5 14.5 8 15.5 9.5L18.5 14H3V14.5Z"
            fill={color}
          />
          <Path
            d="M2 14.5H22V17A1.5 1.5 0 0120.5 18.5H3.5A1.5 1.5 0 012 17V14.5Z"
            fill={color}
            opacity={0.7}
          />
          <Path
            d="M8 11L9.5 13.5M11.5 9.5L13 12.5"
            stroke="#0B0B0F"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity={0.4}
            fill="none"
          />
        </Svg>
      );

    case 'target':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9"   stroke={color} strokeWidth="2"   />
          <Circle cx="12" cy="12" r="5.5" stroke={color} strokeWidth="2"   />
          <Circle cx="12" cy="12" r="2.5" fill={color}                     />
        </Svg>
      );

    case 'heartbeat':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 12h3.5l2-6.5 4.5 13 2.5-8.5L17 12h5"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'barbell':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Rect x="7"  y="10.5" width="10" height="3"  rx="0.8" fill={color} />
          <Rect x="1"  y="8"    width="4"  height="8"  rx="2"   fill={color} />
          <Rect x="19" y="8"    width="4"  height="8"  rx="2"   fill={color} />
          <Rect x="5"  y="9"    width="2"  height="6"  rx="0.5" fill={color} />
          <Rect x="17" y="9"    width="2"  height="6"  rx="0.5" fill={color} />
        </Svg>
      );

    case 'mountain':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M3 20L9 8l4.5 5.5L17 9l4 11H3z" fill={color} />
          <Path
            d="M9 8l2-3 2 3"
            stroke="#0B0B0F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />
        </Svg>
      );

    case 'sun':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="4" fill={color} />
          <Path
            d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'moon':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={color} />
        </Svg>
      );

    // ── Rank icons ────────────────────────────────────────────────────────────

    case 'rank_rookie':
      // Arrow up in circle — "start of the journey"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
          <Path
            d="M12 17V8M8 11.5l4-4 4 4"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'rank_challenger':
      // Bold lightning — "charging forward"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" fill={color} />
        </Svg>
      );

    case 'rank_dominant':
      // Trophy — "winning consistently"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M6 3h12v8a6 6 0 01-12 0V3z" fill={color} />
          <Path d="M6 5H3.5a2.5 2.5 0 000 5H6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M18 5h2.5a2.5 2.5 0 010 5H18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <Rect x="10" y="17" width="4" height="3" rx="0.5" fill={color} />
          <Rect x="8"  y="20" width="8" height="2" rx="1"   fill={color} />
        </Svg>
      );

    case 'rank_disciplined':
      // Shield with check — "protected by consistency"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} />
          <Path
            d="M9 12l2 2 4-4"
            stroke="#0B0B0F"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'rank_elite':
      // Crown — "royalty of the gym"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M3 18h18l-3-10-5 5-3-8-3 8-5-5z" fill={color} />
          <Rect x="3" y="19" width="18" height="2" rx="1" fill={color} />
        </Svg>
      );

    case 'rank_master':
      // Medal — "decorated veteran"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="9" r="6" fill={color} />
          <Path
            d="M9 15.5L7.5 22l4.5-2 4.5 2L15 15.5"
            fill={color}
            opacity={0.7}
          />
          <Path
            d="M12 6v3l2 1.5"
            stroke="#0B0B0F"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'rank_apex':
      // Mountain peak — "top of the mountain"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Path d="M3 20L9 8l4.5 5.5L17 9l4 11H3z" fill={color} />
          <Path
            d="M9 8l2-3 2 3"
            stroke="#0B0B0F"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
        </Svg>
      );

    case 'rank_luminary':
      // Radiant star — "legendary, shining bright"
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M12 2l1.8 5.5H20l-5 3.6 1.9 5.9L12 13.6l-4.9 3.4 1.9-5.9-5-3.6h6.2z"
            fill={color}
          />
          <Path
            d="M12 1v2M12 21v2M1 12h2M21 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={0.55}
            fill="none"
          />
        </Svg>
      );

    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" fill={color} opacity={0.3} />
        </Svg>
      );
  }
}
