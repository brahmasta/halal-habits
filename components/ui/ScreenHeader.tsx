import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { Glow } from './Glow';

export interface GlowSpec {
  color: string; // rgba including alpha
  size: number;
  stop?: number;
  pos: ViewStyle; // absolute positioning (top/right/bottom/left)
}

interface ScreenHeaderProps {
  eyebrow?: string;
  eyebrowColor?: string;
  title?: string; // supports '\n' for multi-line editorial titles
  titleSize?: number;
  subtitle?: React.ReactNode;
  right?: React.ReactNode; // top-right glyph (e.g. moon/star)
  glows?: GlowSpec[];
  children?: React.ReactNode; // progress bars, map, search, etc.
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Dark near-black header (#12151A) with colored radial glow orbs. */
export function ScreenHeader({
  eyebrow,
  eyebrowColor = Colors.brandOnDark,
  title,
  titleSize = 26,
  subtitle,
  right,
  glows = [],
  children,
  style,
  contentStyle,
}: ScreenHeaderProps) {
  return (
    <View
      style={[
        { backgroundColor: Colors.headerDark, overflow: 'hidden', position: 'relative' },
        style,
      ]}
    >
      {glows.map((g, i) => (
        <Glow key={i} color={g.color} size={g.size} stop={g.stop} style={g.pos} />
      ))}

      {/* Title block — padded */}
      <View style={[{ paddingHorizontal: 22, paddingTop: 22, position: 'relative', zIndex: 2 }, contentStyle]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            {eyebrow ? (
              <Text
                style={{
                  color: eyebrowColor,
                  fontSize: 11,
                  fontFamily: Fonts.bold,
                  letterSpacing: 1.7,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: titleSize,
                  fontFamily: Fonts.extrabold,
                  lineHeight: titleSize * 1.1,
                  letterSpacing: -titleSize * 0.03,
                }}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? <View style={{ marginTop: 11 }}>{subtitle}</View> : null}
          </View>
          {right ? <View style={{ flexShrink: 0 }}>{right}</View> : null}
        </View>
      </View>

      {/* Full-bleed extras (progress bars, overlapping hero card, map). The
          screen controls horizontal insets for these. */}
      {children ? (
        <View style={{ position: 'relative', zIndex: 2 }}>{children}</View>
      ) : null}
    </View>
  );
}
