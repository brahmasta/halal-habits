// Islamic style primitives: khatam (8-point-star lattice) pattern, 8-point star, mihrab arch radius.
import React, { useLayoutEffect, useRef } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Path, Polygon, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

/** 8-point star: 16-vertex polygon, outer radius 11, inner 0.62×, starting at −90°. */
export function Star({ size = 10, color = '#A8843A', style }: { size?: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const pts = Array.from({ length: 16 })
    .map((_, i) => {
      const r = i % 2 ? 0.62 : 1;
      const a = (Math.PI * i) / 8 - Math.PI / 2;
      return `${(12 + 11 * r * Math.cos(a)).toFixed(2)},${(12 + 11 * r * Math.sin(a)).toFixed(2)}`;
    })
    .join(' ');
  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Polygon points={pts} fill={color} />
      </Svg>
    </View>
  );
}

let patternSeq = 0;

/**
 * Khatam lattice tiled over the parent (absolute fill). `fade` masks it:
 *  - 'down': opaque at top → transparent at bottom (screen backgrounds)
 *  - 'left': opaque at right → transparent towards the left (next-prayer band)
 * The mask is an overlay gradient in `maskColor` (the surface behind the pattern).
 */
export function Khatam({ color, opacity = 0.1, tile = 56, fade, maskColor, style }: { color: string; opacity?: number; tile?: number; fade?: 'down' | 'left'; maskColor?: string; style?: StyleProp<ViewStyle> }) {
  const id = React.useMemo(() => `khatam${patternSeq++}`, []);
  const s = tile / 56;
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, overflow: 'hidden' }, style]}>
      <Svg width="100%" height="100%" style={{ opacity }}>
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={tile} height={tile}>
            <Rect x={16 * s} y={16 * s} width={24 * s} height={24 * s} fill="none" stroke={color} strokeWidth={1} />
            <Rect x={16 * s} y={16 * s} width={24 * s} height={24 * s} fill="none" stroke={color} strokeWidth={1} transform={`rotate(45 ${28 * s} ${28 * s})`} />
            <Path d={`M0 0L${16 * s} ${16 * s}M${56 * s} 0L${40 * s} ${16 * s}M0 ${56 * s}L${16 * s} ${40 * s}M${56 * s} ${56 * s}L${40 * s} ${40 * s}M${28 * s} 0V${11 * s}M${28 * s} ${56 * s}V${45 * s}M0 ${28 * s}H${11 * s}M${56 * s} ${28 * s}H${45 * s}`} fill="none" stroke={color} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {fade && maskColor ? (
        <LinearGradient
          pointerEvents="none"
          colors={[hexAlpha(maskColor, 0), maskColor]}
          start={fade === 'down' ? { x: 0, y: 0 } : { x: 1, y: 0 }}
          end={fade === 'down' ? { x: 0, y: 1 } : { x: 0.25, y: 0 }}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
      ) : null}
    </View>
  );
}

function hexAlpha(c: string, a: number): string {
  if (c.startsWith('#') && (c.length === 7 || c.length === 4)) {
    const h = c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  return c.replace(/rgba?\(([^)]+)\)/, (_m, inner) => {
    const [r, g, b] = inner.split(',').map((x: string) => x.trim());
    return `rgba(${r},${g},${b},${a})`;
  });
}

/**
 * Mihrab arch: elliptical dome on top, radius r at the bottom.
 * Web gets the exact CSS (`50% 50% r r / 0.42h 0.42h r r`); native approximates the dome with
 * circular top corners of 0.42h (clamped to half the width).
 */
export function archStyle(h: number, r = 22, w?: number): ViewStyle {
  const dome = Math.round(h * 0.42);
  if (Platform.OS === 'web') {
    return { borderRadius: `50% 50% ${r}px ${r}px / ${dome}px ${dome}px ${r}px ${r}px` } as unknown as ViewStyle;
  }
  const top = w ? Math.min(dome, Math.floor(w / 2)) : dome;
  return { borderTopLeftRadius: top, borderTopRightRadius: top, borderBottomLeftRadius: r, borderBottomRightRadius: r };
}

/**
 * Arch shape as a ref + style pair. react-native-web rejects the elliptical border-radius string,
 * so on web the radius is written straight onto the DOM node after layout; native uses `archStyle`.
 */
export function useArch(h: number, r = 22, w?: number): { ref: React.RefObject<any>; style: ViewStyle } {
  const ref = useRef<any>(null);
  const dome = Math.round(h * 0.42);
  const css = `50% 50% ${r}px ${r}px / ${dome}px ${dome}px ${r}px ${r}px`;
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as HTMLElement | null;
    if (el && el.style) el.style.borderRadius = css;
  });
  return { ref, style: Platform.OS === 'web' ? {} : archStyle(h, r, w) };
}
