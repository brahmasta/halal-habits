import React from 'react';
import { Pressable, PressableProps, ScrollView, StyleProp, Text, TextProps, TextStyle, View, ViewStyle, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts, PRIMARY_BTN_SHADOW, SKY, SKY_ORDER, Tokens, bezelShadow, ringShadow, roundShadow } from '@/constants/theme';
import { useTheme } from './ThemeContext';
import { Icon, IconName } from './Icon';
import { enter } from './enter';
import { useNow } from '@/store/now';
import { Khatam, Star, useArch } from './ornament';

// ── Text ────────────────────────────────────────────────────────────────────

type TP = TextProps & { size?: number; color?: string; weight?: 400 | 500 | 600; lh?: number; style?: StyleProp<TextStyle> };

/** Display: Bricolage Grotesque, tight tracking. */
export function D({ size = 24, color, weight = 600, lh, style, ...p }: TP) {
  const t = useTheme();
  const family = weight === 600 ? Fonts.display : weight === 500 ? Fonts.displayMedium : Fonts.displayRegular;
  return <Text {...p} style={[{ fontFamily: family, fontSize: size, color: color ?? t.ink, letterSpacing: -0.035 * size, lineHeight: lh ? lh * size : size * 1.05 }, style]} />;
}

/** Accent: Instrument Serif Italic, ~8% larger than the surrounding display size. */
export function I({ size = 26, color, lh, style, ...p }: TP) {
  const t = useTheme();
  return <Text {...p} style={[{ fontFamily: Fonts.serifItalic, fontSize: size, color: color ?? t.ink, letterSpacing: -0.01 * size, lineHeight: lh ? lh * size : undefined }, style]} />;
}

/** Body: Geist, tabular numerals. */
export function B({ size = 14, color, weight = 400, lh, style, ...p }: TP) {
  const t = useTheme();
  const family = weight === 600 ? Fonts.semibold : weight === 500 ? Fonts.medium : Fonts.body;
  return <Text {...p} style={[{ fontFamily: family, fontSize: size, color: color ?? t.ink, fontVariant: ['tabular-nums'], lineHeight: lh ? lh * size : undefined }, style]} />;
}

export function Ar({ size = 20, color, style, ...p }: TP) {
  const t = useTheme();
  return <Text {...p} style={[{ fontFamily: Fonts.arabic, fontSize: size, color: color ?? t.ink, writingDirection: 'rtl' }, style]} />;
}

export function Mono({ size = 9.5, color, style, ...p }: TP) {
  const t = useTheme();
  return <Text {...p} style={[{ fontFamily: Fonts.mono, fontSize: size, color: color ?? t.muted, letterSpacing: 0.12 * size, textTransform: 'uppercase' }, style]} />;
}

// ── Tap (press → scale 0.98) ────────────────────────────────────────────────

export function Tap({ style, children, ...p }: PressableProps & { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  return (
    <Pressable {...p} style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.98 }] }]}>
      {children}
    </Pressable>
  );
}

// ── Bezel card ──────────────────────────────────────────────────────────────

export function bezel(t: Tokens, bg?: string, r = 26, tint?: string): ViewStyle {
  const colour = bg ?? t.surface;
  const coloured = colour !== t.surface;
  return {
    backgroundColor: colour,
    borderRadius: r,
    boxShadow: bezelShadow(t, coloured, tint ?? (coloured ? colour : t.shadow)),
  } as ViewStyle;
}

export function Bezel({ bg, r = 26, tint, style, children, onPress }: { bg?: string; r?: number; tint?: string; style?: StyleProp<ViewStyle>; children?: React.ReactNode; onPress?: () => void }) {
  const t = useTheme();
  const s = [bezel(t, bg, r, tint), style];
  if (onPress) return <Tap onPress={onPress} style={s}>{children}</Tap>;
  return <View style={s}>{children}</View>;
}

/** Pill / row with the lighter 1px ring. */
export function Ring({ bg, r = 999, style, children, onPress }: { bg?: string; r?: number; style?: StyleProp<ViewStyle>; children?: React.ReactNode; onPress?: () => void }) {
  const t = useTheme();
  const s = [{ backgroundColor: bg ?? t.surface, borderRadius: r, boxShadow: ringShadow(t) } as ViewStyle, style];
  if (onPress) return <Tap onPress={onPress} style={s}>{children}</Tap>;
  return <View style={s}>{children}</View>;
}

// ── Eyebrow tag ─────────────────────────────────────────────────────────────

export function Tag({ children, color, bg, ring, dot, style }: { children: React.ReactNode; color?: string; bg?: string; ring?: string; dot?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const rg = ring ?? t.ring;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: bg ?? t.shell, boxShadow: rg === 'transparent' ? undefined : `0 0 0 1px ${rg}`, alignSelf: 'flex-start' } as ViewStyle, style]}>
      {t.islamic ? <Star size={9} color={dot ?? (color === undefined || color === t.muted ? t.gold : color)} /> : dot ? <View style={{ width: 6, height: 6, borderRadius: 9, backgroundColor: dot }} /> : null}
      <Text style={{ fontFamily: Fonts.medium, fontSize: 9.5, letterSpacing: 0.2 * 9.5, textTransform: 'uppercase', color: color ?? t.muted }} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

// ── Primary button (button-in-button) ───────────────────────────────────────

export function Btn({ children, kind = 'primary', icon = 'arrow', onPress, disabled, style }: { children: React.ReactNode; kind?: 'primary' | 'brand' | 'ghost'; icon?: IconName; onPress?: () => void; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const k = {
    primary: { bg: t.ink, color: t.bg, ic: 'rgba(243,241,236,0.12)', sh: PRIMARY_BTN_SHADOW },
    brand: { bg: t.brand, color: t.brandInk, ic: 'rgba(243,241,236,0.14)', sh: `inset 0 1px 0 rgba(255,255,255,0.14), 0 16px 30px -16px ${t.shadow}` },
    ghost: { bg: t.surface, color: t.ink, ic: t.shell, sh: `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}` },
  }[kind];
  return (
    <Tap onPress={onPress} disabled={disabled} style={[{ height: 58, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 7, backgroundColor: k.bg, boxShadow: k.sh, opacity: disabled ? 0.5 : 1 } as ViewStyle, style]}>
      <Text style={{ fontFamily: Fonts.semibold, fontSize: 15.5, color: k.color }}>{children}</Text>
      <View style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: k.ic, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={17} color={k.color} />
      </View>
    </Tap>
  );
}

// ── Round icon button ───────────────────────────────────────────────────────

export function Round({ name, dark, size = 44, onPress, style, color }: { name: IconName; dark?: boolean; size?: number; onPress?: () => void; style?: StyleProp<ViewStyle>; color?: string }) {
  const t = useTheme();
  return (
    <Tap onPress={onPress} hitSlop={6} style={[{ width: size, height: size, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? t.ink : t.surface, boxShadow: dark ? undefined : roundShadow(t) } as ViewStyle, style]}>
      <Icon name={name} size={18} color={color ?? (dark ? t.bg : t.ink)} />
    </Tap>
  );
}

// ── Chips ───────────────────────────────────────────────────────────────────

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Tap onPress={onPress} style={{ height: 38, paddingHorizontal: 16, borderRadius: 999, justifyContent: 'center', backgroundColor: on ? t.ink : t.surface, boxShadow: on ? undefined : ringShadow(t) } as ViewStyle}>
      <Text style={{ fontFamily: Fonts.medium, fontSize: 13.5, color: on ? t.bg : t.ink }}>{label}</Text>
    </Tap>
  );
}

export function Chips({ items, selected, onToggle, pad = 20 }: { items: string[]; selected: number[]; onToggle: (i: number) => void; pad?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: pad }}>
      {items.map((c, i) => (
        <Chip key={c} label={c} on={selected.includes(i)} onPress={() => onToggle(i)} />
      ))}
    </ScrollView>
  );
}

// ── Placeholder photo (striped) ─────────────────────────────────────────────

export function Photo({ label, h = 200, r = 22, tone, style, children, labelTop, w }: { label?: string; h?: number; r?: number; tone?: string; style?: StyleProp<ViewStyle>; children?: React.ReactNode; labelTop?: boolean; w?: number }) {
  const t = useTheme();
  const base = tone ?? t.sunk;
  const stripes = Array.from({ length: 40 });
  const arched = t.islamic && r > 0;
  const arch = useArch(h, r, w);
  return (
    <View ref={arched ? arch.ref : undefined} style={[{ height: h, overflow: 'hidden', backgroundColor: base }, arched ? arch.style : { borderRadius: r }, style]}>
      <View style={{ position: 'absolute', left: -200, top: -200, right: -200, bottom: -200, transform: [{ rotate: '-45deg' }] }}>
        {stripes.map((_, i) => (
          <View key={i} style={{ position: 'absolute', top: i * 15 * 2, left: 0, right: 0, height: 1, backgroundColor: t.dark ? 'rgba(255,255,255,0.05)' : 'rgba(18,20,18,0.05)' }} />
        ))}
      </View>
      {label ? (
        <View style={[{ position: 'absolute', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: t.dark ? 'rgba(27,30,27,0.9)' : 'rgba(252,251,248,0.9)' }, labelTop ? { top: Math.round(h * 0.45), alignSelf: 'center', left: 0, right: 0, marginHorizontal: 'auto', maxWidth: '80%' } : { left: 12, bottom: 12 }]}>
          <Mono>{label}</Mono>
        </View>
      ) : null}
      {children}
    </View>
  );
}

// ── Day dots ────────────────────────────────────────────────────────────────

export function DayDots({ onDark, size = 10 }: { onDark?: boolean; size?: number }) {
  const { idx } = useNow();
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {SKY_ORDER.map((k, i) => {
        const s = SKY[k];
        const done = i < idx;
        const cur = i === idx;
        const ring = done ? (onDark ? 'rgba(255,255,255,0.4)' : 'rgba(18,20,18,0.12)') : onDark ? 'rgba(255,255,255,0.45)' : 'rgba(18,20,18,0.3)';
        return <View key={k} style={{ width: cur ? size * 2.4 : size, height: size, borderRadius: 99, backgroundColor: done ? s.bg : 'transparent', boxShadow: `inset 0 0 0 1.5px ${ring}` } as ViewStyle} />;
      })}
    </View>
  );
}

// ── Staggered screen entry ──────────────────────────────────────────────────

/** Each direct child fades up, staggered 70ms (max 350ms). */
export function Stage({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const kids = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={style}>
      {kids.map((c, i) => (
        <Animated.View key={i} entering={enter(Math.min(i * 70, 350), 950)}>
          {c}
        </Animated.View>
      ))}
    </View>
  );
}

// ── Screen scaffold ─────────────────────────────────────────────────────────

export function Screen({ children, bg, tab, bottom, scroll = true, topGap = 32, style, contentStyle }: { children: React.ReactNode; bg?: string; tab?: boolean; bottom?: React.ReactNode; scroll?: boolean; topGap?: number; style?: StyleProp<ViewStyle>; contentStyle?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, Platform.OS === 'web' ? 24 : 0) + topGap;
  const padBottom = tab && !bottom ? 116 : 24;
  const surface = bg ?? t.bg;
  return (
    <View style={[{ flex: 1, backgroundColor: surface }, style]}>
      {t.islamic ? <Khatam color={t.ink} opacity={t.dark ? 0.06 : 0.045} fade="down" maskColor={surface} style={{ bottom: undefined, height: 420 }} /> : null}
      {scroll ? (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[{ paddingTop: top, paddingBottom: padBottom }, contentStyle]}>
          <Stage>{children}</Stage>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingTop: top }, contentStyle]}>{children}</View>
      )}
      {bottom ? <View style={{ paddingBottom: tab ? 100 : Math.max(insets.bottom, 12) }}>{bottom}</View> : null}
    </View>
  );
}

/** Section heading with an italic accent word and optional right link. */
export function SectionHead({ pre, accent, link, onLink, style }: { pre: string; accent: string; link?: string; onLink?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, style]}>
      <Text>
        <D size={24}>{pre} </D>
        <I size={27}>{accent}</I>
      </Text>
      {link ? (
        <Pressable onPress={onLink} hitSlop={8}>
          <B size={13} color={t.muted}>{link}</B>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.line }, style]} />;
}
