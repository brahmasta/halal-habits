import { Linking, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Bezel, Btn, D, Hairline, I, Photo, Round, Screen, Tag } from '@/components/ui/kit';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts } from '@/constants/theme';
import { useMosques } from '@/hooks/useMosques';
import { useApp } from '@/store/app';
import { walkMin } from '@/lib/geo';

export default function PlaceDetail() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useMosques();
  const { state, dispatch } = useApp();
  const m = data.find((x) => x.id === id);
  const saved = state.saved.includes(`place:${id}`);
  const isMasjid = m?.type === 'Masjid';
  const name = m?.name ?? 'Place';
  const title = name.replace(/^(Musollah|Masjid|Surau)\s+/i, '');
  const level = m?.area.match(/^(Level\s*\d+|L\d+|B\d+)/i)?.[1];
  const accent = level ? level.replace(/^L(\d+)$/i, 'Level $1') : isMasjid ? 'Masjid' : 'Musollah';

  const steps: Array<[string, string]> = m?.steps ?? (isMasjid
    ? [['Head to the main entrance', m?.address ?? ''], ['Wudhu area is beside the entrance', 'Shoe racks outside the prayer hall'], ["Women's prayer area upstairs", 'Follow the signs from the lobby']]
    : [['Take the lift to the prayer level', m?.area ? `In ${m.area}` : m?.address ?? ''], ['Follow signs for the family room', 'Usually near the restrooms'], ['Musollah is the last door', 'Wudhu area inside · shoes rack outside']]);

  const open = () => {
    if (!m) return;
    const q = `${m.coordinates.lat},${m.coordinates.lng}`;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=walking`).catch(() => {});
  };

  return (
    <Screen bottom={<View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 22 }}><Btn kind="brand" icon="walk" onPress={open}>Walk there{m ? ` · ${walkMin(m.distanceKm)} min` : ''}</Btn></View>} contentStyle={{ paddingTop: 0 }}>
      <View>
        <Photo label={`${isMasjid ? 'Masjid' : 'Musollah'} · ${title}`} h={320} r={0} tone={t.dark ? '#26292A' : '#E1DCCF'} />
        <View style={{ position: 'absolute', top: Math.max(insets.top, 20) + 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Round name="back" onPress={() => router.back()} />
          <Round name="bookmark" onPress={() => dispatch({ type: 'toggleSaved', id: `place:${id}` })} color={saved ? t.brand : undefined} />
        </View>
      </View>
      <View style={{ marginTop: -40, marginHorizontal: 12, borderRadius: 34, backgroundColor: t.bg, paddingTop: 24, paddingHorizontal: 14 }}>
        <View style={{ paddingHorizontal: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Tag dot="#3F8F5A">Open · until {m?.openUntil ?? (isMasjid ? '9 PM' : '10 PM')}</Tag>
            <Tag>{isMasjid ? 'Masjid' : 'Musollah'}</Tag>
          </View>
          <Text style={{ marginTop: 14 }}>
            <D size={36} lh={1}>{title} </D>
            <I size={38}>{accent}</I>
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
          {[[m ? `${walkMin(m.distanceKm)} min` : '—', 'walk'], ['~20', 'people'], [m?.women === false ? 'No' : 'Yes', "women's side"]].map(([v, l]) => (
            <Bezel key={l} r={20} style={{ flex: 1, paddingVertical: 14, paddingHorizontal: 12 }}>
              <D size={22}>{v}</D>
              <B size={11.5} color={t.muted} style={{ marginTop: 3 }}>{l}</B>
            </Bezel>
          ))}
        </View>
        <Text style={{ paddingTop: 32, paddingHorizontal: 10, paddingBottom: 14 }}>
          <D size={22}>How to </D>
          <I size={25}>find it</I>
        </Text>
        <Bezel r={24} style={{ paddingVertical: 6, paddingHorizontal: 16, marginBottom: 24 }}>
          {steps.map(([a, b], i) => (
            <View key={a}>
              <View style={{ flexDirection: 'row', gap: 14, paddingVertical: 14 }}>
                <View style={{ width: 28, height: 28, borderRadius: 99, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: Fonts.display, fontSize: 13, color: t.bg }}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <B size={14.5} weight={600}>{a}</B>
                  <B size={12.5} color={t.muted} style={{ marginTop: 3 }}>{b}</B>
                </View>
              </View>
              {i < steps.length - 1 ? <Hairline /> : null}
            </View>
          ))}
        </Bezel>
      </View>
    </Screen>
  );
}
