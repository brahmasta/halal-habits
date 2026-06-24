import { View, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: string; // when set, border tints to the accent
}

export function Card({ children, style, accent }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.card,
          borderRadius: Radius.card,
          borderWidth: 1,
          borderColor: accent ? `${accent}47` : Colors.border,
          ...Shadow.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
