import { ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

let uid = 0;

/**
 * Soft radial glow orb used on the dark headers.
 * Approximates the design's `radial-gradient(circle, <color>, transparent X%)`.
 */
export function Glow({
  color,
  size,
  stop = 0.65,
  style,
}: {
  color: string; // rgba(...) including the alpha from the spec
  size: number;
  stop?: number; // where the color fades to transparent (0..1)
  style?: ViewStyle;
}) {
  const id = `glow-${uid++}`;
  return (
    <Svg
      width={size}
      height={size}
      pointerEvents="none"
      style={[{ position: 'absolute' }, style]}
    >
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} />
          <Stop offset={String(stop)} stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={size} height={size} fill={`url(#${id})`} />
    </Svg>
  );
}
