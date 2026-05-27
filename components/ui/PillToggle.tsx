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
        backgroundColor: Colors.bgDeep,
        borderRadius: Radius.pill,
        padding: 4,
      }}
    >
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(i as 0 | 1)}
          style={{
            flex: 1,
            paddingVertical: 9,
            paddingHorizontal: 16,
            borderRadius: Radius.pill,
            alignItems: 'center',
            backgroundColor: value === i ? Colors.jade : 'transparent',
            ...(value === i ? Shadow.jade : {}),
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontFamily: value === i ? Fonts.bodySemiBold : Fonts.bodyMedium,
              fontSize: 13.5,
              color: value === i ? Colors.white : Colors.inkLight,
            }}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
