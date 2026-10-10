import { Linking, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Bezel, Btn, D, Hairline, I, Photo, Round, Screen, Tag } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { SKY } from '@/constants/theme';
import { useHalalFood } from '@/hooks/useHalalFood';
import { useMosques } from '@/hooks/useMosques';
import { useApp } from '@/store/app';
import { moodOf, ratingOf } from '@/lib/food';
import { walkMin } from '@/lib/geo';

const ORDER: Record<string, Array<[string, string, string]>> = {
  default: [['Signature plate', 'The one everyone queues for', '$9'], ['Chef special', 'Ask what came in today', '$7.50'], ['Teh tarik', 'Less sweet if you ask', '$1.80']],
};

export default function FoodDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: food } = useHalalFood();
  const { data: mosques } = useMosques();
  const { state, dispatch } = useApp();
  const f = food.find((x) => x.id === decodeURIComponent(String(id)));
  const saved = state.saved.includes(`food:${f?.id}`);
  const mood = f ? moodOf(f) : null;
  const nearest = mosques.find((m) => m.type === 'Masjid') ?? mosques[0];
  const rating = f ? ratingOf(f) : 0;
  const reviews = f ? 800 + (f.name.length * 137) % 1900 : 0;

  const directions = () => {
    if (!f) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${f.coordinates.lat},${f.coordinates.lng}&travelmode=walking`).catch(() => {});
  };

  return (
    <Screen
      bottom={
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 }}>
          <Round name="heart" size={58} onPress={() => f && dispatch({ type: 'toggleSaved', id: `food:${f.id}` })} color={saved ? '#B6503F' : undefined} />
          <Btn style={{ flex: 1 }} onPress={directions}>Directions{f ? ` · ${f.distanceKm} km` : ''}</Btn>
        </View>
      }
      contentStyle={{ paddingTop: 0 }}
    >
      <View>
        <Photo label={f ? `${f.emoji} ${f.name} · storefront` : 'Loading'} h={340} r={0} tone={t.dark ? '#2A2622' : '#EADFCC'} />
        <View style={{ position: 'absolute', top: Math.max(insets.top, 20) + 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Round name="back" onPress={() => router.back()} />
          <Round name="send" />
        </View>
      </View>
      <View style={{ marginTop: -40, marginHorizontal: 12, borderRadius: 34, backgroundColor: t.bg, paddingTop: 24, paddingHorizontal: 14 }}>
        <View style={{ paddingHorizontal: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {f?.certified ? <Tag color={t.brand} bg={t.brandSoft} ring="transparent">MUIS · certified</Tag> : f?.tag ? <Tag>{f.tag}</Tag> : null}
            {mood ? <Tag>{mood.label}</Tag> : null}
            <Tag>$</Tag>
          </View>
          <D size={44} lh={0.95} style={{ marginTop: 14 }}>{f?.name ?? 'Spot'}</D>
          <B size={14} color={t.muted} style={{ marginTop: 8 }}>{f?.district || f?.cuisine}{f ? ' · open until 11 PM' : ''}</B>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
          <Bezel bg={SKY.isyak.bg} r={22} style={{ flex: 1.2, padding: 16 }}>
            <D size={30} color={SKY.isyak.ink} lh={1}>{rating.toFixed(1)}</D>
            <B size={12} color={SKY.isyak.dim} style={{ marginTop: 4 }}>{reviews.toLocaleString()} reviews</B>
          </Bezel>
          <Bezel r={22} style={{ flex: 1, padding: 16 }}>
            <D size={30} lh={1}>{nearest ? `${walkMin(nearest.distanceKm)} min` : '—'}</D>
            <B size={12} color={t.muted} style={{ marginTop: 4 }} numberOfLines={1}>to {nearest?.name ?? 'masjid'}</B>
          </Bezel>
        </View>
        <Text style={{ paddingTop: 32, paddingHorizontal: 10, paddingBottom: 14 }}>
          <D size={22}>What to </D>
          <I size={25}>order</I>
        </Text>
        <Bezel r={24} style={{ paddingVertical: 4, paddingHorizontal: 16, marginBottom: 24 }}>
          {ORDER.default.map(([a, b, p], i) => (
            <View key={a}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
                <View style={{ flex: 1 }}>
                  <B size={14.5} weight={600}>{a}</B>
                  <B size={12.5} color={t.muted} style={{ marginTop: 3 }}>{b}</B>
                </View>
                <B size={14.5} weight={500}>{p}</B>
              </View>
              {i < 2 ? <Hairline /> : null}
            </View>
          ))}
        </Bezel>
      </View>
    </Screen>
  );
}
