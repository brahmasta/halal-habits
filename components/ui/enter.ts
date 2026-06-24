import { Platform } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

/**
 * Staggered fade-in-down entering animation for list items (design rule #10).
 *
 * On native (iOS/Android) this returns a reanimated FadeInDown builder.
 * On web, reanimated v4 layout/entering animations are unreliable — they leave
 * items stuck at `visibility: hidden` — so we return `undefined`, which renders
 * the item immediately and visibly. The animation is a native-only enhancement.
 */
export function enter(delay = 0, duration = 400) {
  if (Platform.OS === 'web') return undefined;
  return FadeInDown.delay(delay).duration(duration);
}
