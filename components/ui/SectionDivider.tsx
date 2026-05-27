import { View, Text } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

export function SectionDivider() {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
      <Text
        style={{
          marginHorizontal: 10,
          color: Colors.gold,
          fontSize: 12,
          fontFamily: Fonts.bodyMedium,
        }}
      >
        ✦
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
    </View>
  );
}
