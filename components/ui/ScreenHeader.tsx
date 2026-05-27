import { View, Text, Dimensions } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { StarPattern } from './StarPattern';

const W = Dimensions.get('window').width;

interface ScreenHeaderProps {
  background: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  height?: number;
}

export function ScreenHeader({
  background,
  eyebrow,
  title,
  subtitle,
  children,
  height = 200,
}: ScreenHeaderProps) {
  return (
    <View
      style={{
        backgroundColor: background,
        paddingHorizontal: 22,
        paddingTop: 56,
        paddingBottom: 24,
        minHeight: height,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <StarPattern opacity={0.07} width={W} height={height + 80} />
      <View
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: 'rgba(255,255,255,0.08)',
          zIndex: 0,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: 'rgba(184,130,42,0.10)',
          zIndex: 0,
        }}
      />
      <View style={{ position: 'relative', zIndex: 1 }}>
        {eyebrow && (
          <Text
            style={{
              fontFamily: Fonts.bodySemiBold,
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </Text>
        )}
        <Text
          style={{
            fontFamily: Fonts.serif,
            fontSize: 30,
            color: Colors.white,
            lineHeight: 36,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: Fonts.body,
              fontSize: 13,
              color: 'rgba(255,255,255,0.72)',
              marginBottom: 4,
            }}
          >
            {subtitle}
          </Text>
        )}
        {children}
      </View>
    </View>
  );
}
