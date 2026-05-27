import { View, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: string;
}

export function Card({ children, style, accent }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.white,
          borderRadius: Radius.lg,
          borderWidth: 1,
          borderColor: accent ? `${accent}40` : Colors.border,
          ...Shadow.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
