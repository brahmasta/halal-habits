import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export type IconName =
  | 'home' | 'clock' | 'map-pin' | 'utensils' | 'msg' | 'bell' | 'settings' | 'search' | 'layers'
  | 'arrow' | 'back' | 'check' | 'star' | 'heart' | 'bookmark' | 'send' | 'walk' | 'sunrise'
  | 'sparkle' | 'book' | 'mosque-glyph' | 'plus' | 'compass' | 'sun' | 'moon';

// Thin-line set: 1.35px stroke on a 24px grid, round caps and joins.
const PATHS: Record<IconName, React.ReactNode> = {
  home: <><Path d="M3 11l9-8 9 8" /><Path d="M5 9.5V20h14V9.5" /></>,
  clock: <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></>,
  'map-pin': <><Path d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><Circle cx="12" cy="10" r="2.5" /></>,
  utensils: <><Path d="M7 2v8a3 3 0 003 3v9" /><Path d="M11 2v7" /><Path d="M17 2c-2 0-3 2-3 5s1 5 3 5v9" /></>,
  msg: <Path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" />,
  bell: <><Path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" /><Path d="M10 21a2 2 0 004 0" /></>,
  settings: <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  search: <><Circle cx="11" cy="11" r="7" /><Path d="M21 21l-4.3-4.3" /></>,
  layers: <><Path d="M12 3l9 5-9 5-9-5z" /><Path d="M3 13l9 5 9-5" /></>,
  arrow: <><Path d="M5 12h14" /><Path d="M13 5l7 7-7 7" /></>,
  back: <><Path d="M19 12H5" /><Path d="M11 19l-7-7 7-7" /></>,
  check: <Path d="M5 12l5 5L20 7" />,
  star: <Path d="M12 2l3 7 7 .8-5.5 4.7L18 22l-6-3.7L6 22l1.5-7.5L2 9.8 9 9z" />,
  heart: <Path d="M12 21s-7-4.5-7-10a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 5.5-7 10-7 10z" />,
  bookmark: <Path d="M6 3h12v18l-6-4-6 4z" />,
  send: <><Path d="M22 2L11 13" /><Path d="M22 2l-7 20-4-9-9-4z" /></>,
  walk: <><Circle cx="13" cy="4" r="2" /><Path d="M9 21l1.5-6.5L7 11l3-6 4 3 3 1" /><Path d="M14 14l3 3-1 4" /></>,
  sunrise: <><Path d="M17 18a5 5 0 00-10 0" /><Path d="M12 2v7M5.6 7.6l1.4 1.4M18.4 7.6L17 9M2 18h20M5 22h14" /></>,
  sparkle: <><Path d="M12 3l1.8 4.7L19 9l-4.5 1.8L13 16l-1.8-5.2L6 9l5.2-1.3z" /><Path d="M19 18l.6 1.6L21 20l-1.4.4L19 22l-.6-1.6L17 20l1.4-.4z" /></>,
  book: <><Path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4z" /><Path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7z" /></>,
  'mosque-glyph': <><Path d="M12 2c-1.5 3-3 4-3 6a3 3 0 006 0c0-2-1.5-3-3-6z" /><Path d="M5 11a7 7 0 0114 0v10H5z" /><Path d="M9 21v-5a3 3 0 016 0v5" /></>,
  plus: <Path d="M12 5v14M5 12h14" />,
  compass: <><Circle cx="12" cy="12" r="9" /><Path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  sun: <><Circle cx="12" cy="12" r="4" /><Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <Path d="M21 13A9 9 0 1111 3a7 7 0 0010 10z" />,
};

export function Icon({ name, size = 18, color = '#121412', stroke = 1.35, fill }: { name: IconName; size?: number; color?: string; stroke?: number; fill?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill ?? 'none'} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </Svg>
  );
}
