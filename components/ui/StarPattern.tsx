import Svg, { Defs, Pattern, Rect, Polygon, Circle } from 'react-native-svg';

export function StarPattern({
  opacity = 0.07,
  width,
  height,
}: {
  opacity?: number;
  width: number;
  height: number;
}) {
  const outerR = 7;
  const innerR = 3;
  const cx = 20;
  const cy = 20;
  const pts = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', opacity }}
    >
      <Defs>
        <Pattern
          id="star"
          x="0"
          y="0"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <Polygon
            points={pts}
            fill="none"
            stroke="#1A5C45"
            strokeWidth={0.7}
          />
          <Circle cx={20} cy={20} r={1.5} fill="#B8822A" opacity={0.5} />
        </Pattern>
      </Defs>
      <Rect width={width} height={height} fill="url(#star)" />
    </Svg>
  );
}
