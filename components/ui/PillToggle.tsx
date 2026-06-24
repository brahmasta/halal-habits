import { View, TouchableOpacity, Text } from 'react-native';
import { Colors, Fonts, Radius, Shadow } from '@/constants/theme';

interface PillToggleProps {
  options: [string, string];
  value: 0 | 1;
  onChange: (v: 0 | 1) => void;
}

export function PillToggle({ options, value, onChange }: PillToggleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: Colors.pillTrack,
        borderRadius: Radius.pill,
        padding: 4,
      }}
    >
      {options.map((opt, i) => {
        const active = value === i;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(i as 0 | 1)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: Radius.pill,
              alignItems: 'center',
              backgroundColor: active ? Colors.brand : 'transparent',
              ...(active ? Shadow.greenGlowSoft : {}),
            }}
            activeOpacity={0.85}
          >
            <Text
              style={{
                fontFamily: Fonts.bold,
                fontSize: 13,
                color: active ? Colors.white : Colors.muted,
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
