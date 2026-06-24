import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/theme';

/** Hairline-fade rule with a centered 8-point star glyph. */
export function SectionDivider() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 14,
      }}
    >
      <LinearGradient
        colors={['transparent', Colors.border]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, height: 1 }}
      />
      <Svg width={14} height={14} viewBox="0 0 16 16">
        <Path d="M8 1 L9 7 L15 8 L9 9 L8 15 L7 9 L1 8 L7 7 Z" fill={Colors.borderStrong} />
      </Svg>
      <LinearGradient
        colors={[Colors.border, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, height: 1 }}
      />
    </View>
  );
}
