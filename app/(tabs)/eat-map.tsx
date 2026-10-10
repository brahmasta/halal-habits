import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, Text, TextInput, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Bezel, Chips, Photo, Tag, Tap } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { MapPanel } from '@/components/ui/MapPanel';
import { MapMarkerData } from '@/components/ui/MapPanel.types';
import { Fonts } from '@/constants/theme';
import { useHalalFood } from '@/hooks/useHalalFood';
import { useMosques } from '@/hooks/useMosques';
import { SG_CENTER } from '@/services/places';
import { MOODS, ratingOf } from '@/lib/food';
import { walkMin } from '@/lib/geo';

const FILTERS = ['Open now', 'Late-night', 'Under $10', 'Near a masjid', 'Brunch'];
const CARD_W = 300;
const GAP = 12;
const TONES = ['#EADFCC', '#DCE0D2', '#E3D6CE', '#E6DCD0'];
const TONES_DARK = ['#2A2622', '#252A24', '#2B2524', '#2A2724'];

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export default function EatMap() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: food } = useHalalFood();
  const { data: mosques } = useMosques();
  const [filters, setFilters] = useState<number[]>([0, 3]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const fromPin = useRef(false);

  const toggle = (i: number) => setFilters((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]));

  const list = useMemo(() => {
    let rows = food.filter((f) => f.certified || f.rating > 0);
    const q = query.trim().toLowerCase();
    if (q) rows = rows.filter((f) => f.name.toLowerCase().includes(q) || f.cuisine.toLowerCase().includes(q));
    if (filters.includes(1)) rows = rows.filter(MOODS[0].test);
    if (filters.includes(2)) rows = rows.filter(MOODS[2].test);
    if (filters.includes(4)) rows = rows.filter(MOODS[1].test);
    if (filters.includes(3) && mosques.length) {
      // within a 10 min walk of a masjid or musollah
      rows = rows.filter((f) => mosques.some((m) => walkMin(km(f.coordinates, m.coordinates)) <= 10));
    }
    return rows.slice(0, 8);
  }, [food, mosques, filters, query]);

  const sel = list.find((f) => f.id === selected) ?? list[0];

  const markers: MapMarkerData[] = useMemo(() => {
    const pins: MapMarkerData[] = list.map((f) => ({
      id: f.id,
      lat: f.coordinates.lat,
      lng: f.coordinates.lng,
      label: f.id === sel?.id ? `★ ${ratingOf(f).toFixed(1)} · ${f.name.split(/ [@|(]/)[0].slice(0, 22)}` : `★ ${ratingOf(f).toFixed(1)}`,
      selected: f.id === sel?.id,
    }));
    const masjids: MapMarkerData[] = mosques
      .filter((m) => m.type === 'Masjid')
      .slice(0, 3)
      .map((m) => ({ id: `m_${m.id}`, lat: m.coordinates.lat, lng: m.coordinates.lng, label: m.name, kind: 'masjid' }));
    return [...pins, ...masjids];
  }, [list, mosques, sel?.id]);

  const center = sel ? sel.coordinates : SG_CENTER;

  // tapping a pin scrolls the carousel to its card
  const pick = (id: string) => {
    if (id.startsWith('m_')) return;
    fromPin.current = true;
    setSelected(id);
    const i = list.findIndex((f) => f.id === id);
    if (i >= 0) scrollRef.current?.scrollTo({ x: i * (CARD_W + GAP), animated: true });
  };

  // swiping the carousel selects the matching pin
  const onScrollEnd = (x: number) => {
    const i = Math.round(x / (CARD_W + GAP));
    const f = list[Math.max(0, Math.min(list.length - 1, i))];
    if (f && f.id !== selected) setSelected(f.id);
  };

  useEffect(() => {
    if (!selected && list[0]) setSelected(list[0].id);
  }, [list, selected]);

  const top = Math.max(insets.top, Platform.OS === 'web' ? 24 : 0) + 34;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <MapPanel markers={markers} center={center} userLocation={SG_CENTER} height={insets.top + 844} onMarkerPress={pick} dark={t.dark} ink={t.ink} bg={t.bg} surface={t.surface} ring={t.ring} brand={t.brand} brandInk={t.brandInk} style={{ flex: 1 }} />
      </View>

      <View style={{ position: 'absolute', top, left: 18, right: 18, flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, height: 50, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, backgroundColor: t.glass, boxShadow: `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}, 0 14px 30px -16px ${t.shadow}` } as ViewStyle}>
          <Icon name="search" size={17} color={t.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Halal near Kampong Glam" placeholderTextColor={t.muted} style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, color: t.ink, padding: 0, outlineStyle: 'none' } as any} />
        </View>
        <Tap onPress={() => router.back()} style={{ height: 50, paddingHorizontal: 18, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.ink }}>
          <Icon name="list" size={16} color={t.bg} />
          <Text style={{ fontFamily: Fonts.semibold, fontSize: 13.5, color: t.bg }}>List</Text>
        </Tap>
      </View>

      <View style={{ position: 'absolute', top: top + 62, left: 0, right: 0 }}>
        <Chips items={FILTERS} selected={filters} onToggle={toggle} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => onScrollEnd(e.nativeEvent.contentOffset.x)}
        onScrollEndDrag={(e) => Platform.OS === 'web' && onScrollEnd(e.nativeEvent.contentOffset.x)}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 104 + Math.max(insets.bottom - 12, 0) }}
        contentContainerStyle={{ gap: GAP, paddingVertical: 10, paddingHorizontal: 18 }}
      >
        {list.map((f, i) => (
          <Bezel key={f.id} r={26} onPress={() => router.push(`/food/${encodeURIComponent(f.id)}`)} style={{ width: CARD_W, padding: 6, flexDirection: 'row', gap: 12, alignItems: 'center', opacity: f.id === sel?.id ? 1 : 0.92 }}>
            <Photo h={96} r={21} w={96} tone={(t.dark ? TONES_DARK : TONES)[i % 4]} style={{ width: 96 }} />
            <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
              {f.certified ? <Tag color={t.brand} bg={t.brandSoft} ring="transparent" style={{ paddingVertical: 3, paddingHorizontal: 8 }}>MUIS</Tag> : <Tag style={{ paddingVertical: 3, paddingHorizontal: 8 }}>Halal</Tag>}
              <B size={15.5} weight={600} numberOfLines={1} style={{ marginTop: 8 }}>{f.name}</B>
              <B size={12.5} color={t.muted} numberOfLines={1} style={{ marginTop: 3 }}>{f.cuisine}</B>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <B size={12.5} weight={600}>★ {ratingOf(f).toFixed(1)}</B>
                <B size={12.5} weight={500} color={t.muted}>{walkMin(f.distanceKm)} min walk</B>
              </View>
            </View>
          </Bezel>
        ))}
        {!list.length ? (
          <Bezel r={26} style={{ width: CARD_W, padding: 18 }}>
            <B size={13} color={t.muted}>Nothing matches these filters yet.</B>
          </Bezel>
        ) : null}
      </ScrollView>
    </View>
  );
}
