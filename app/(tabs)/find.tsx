import { useMemo, useRef, useState } from 'react';
import { Platform, ScrollView, TextInput, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Bezel, Btn, Chips, D, Hairline, Round, Stage, Tap } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { MapPanel } from '@/components/ui/MapPanel';
import { MapMarkerData } from '@/components/ui/MapPanel.types';
import { Fonts } from '@/constants/theme';
import { useMosques } from '@/hooks/useMosques';
import { SG_CENTER } from '@/services/places';
import { useApp } from '@/store/app';
import { walkMin } from '@/lib/geo';

const FILTERS = ['Nearest', 'In malls', 'Masjid', 'Open now', 'Wudhu', "Women's area"];

function shortName(n: string) {
  return n.replace(/^(Musollah|Masjid|Surau)\s+/i, '').replace(/\s+(Shopping )?(Mall|Centre|Center|Junction)$/i, (m) => (m.trim() === 'Junction' ? ' Jn' : ''));
}

export default function Find() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const { data: mosques, loading, error } = useMosques();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<ScrollView>(null);

  const filters = state.findFilters;
  const toggle = (i: number) => dispatch({ type: 'findFilters', filters: filters.includes(i) ? filters.filter((x) => x !== i) : [...filters, i] });

  // AND logic across the selected filters. "Open now", "Wudhu" and "Women's area" have no data yet → no-op.
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = mosques.filter((m) => !q || m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q) || m.address.toLowerCase().includes(q));
    if (filters.includes(1)) rows = rows.filter((m) => m.type === 'Musholla');
    if (filters.includes(2)) rows = rows.filter((m) => m.type === 'Masjid');
    if (filters.includes(0)) rows = [...rows].sort((a, b) => a.distanceKm - b.distanceKm);
    return rows.slice(0, 12);
  }, [mosques, query, filters]);

  const sel = selected ?? list[0]?.id ?? null;

  const markers: MapMarkerData[] = useMemo(
    () =>
      list.slice(0, 6).map((m) => ({
        id: m.id,
        lat: m.coordinates.lat,
        lng: m.coordinates.lng,
        label: m.id === sel ? `${shortName(m.name)} · ${walkMin(m.distanceKm)} min` : `${shortName(m.name)} · ${walkMin(m.distanceKm)}`,
        selected: m.id === sel,
      })),
    [list, sel]
  );

  const pick = (id: string) => {
    setSelected(id);
    const i = list.findIndex((m) => m.id === id);
    if (i >= 0) listRef.current?.scrollTo({ y: i * 71, animated: true });
  };

  const top = Math.max(insets.top, Platform.OS === 'web' ? 24 : 0) + 34;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 470 }}>
        <MapPanel markers={markers} center={SG_CENTER} height={470} onMarkerPress={pick} dark={t.dark} ink={t.ink} bg={t.bg} surface={t.surface} ring={t.ring} />
      </View>

      <View style={{ position: 'absolute', top, left: 18, right: 18, flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, height: 50, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, backgroundColor: t.glass, boxShadow: `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}, 0 14px 30px -16px ${t.shadow}` } as ViewStyle}>
          <Icon name="search" size={17} color={t.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Mall, MRT or masjid" placeholderTextColor={t.muted} style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, color: t.ink, padding: 0, outlineStyle: 'none' } as any} />
        </View>
        <Round name="layers" size={50} />
      </View>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 390, borderTopLeftRadius: 36, borderTopRightRadius: 36, backgroundColor: t.bg, boxShadow: '0 -18px 40px -20px rgba(18,20,18,0.25)', paddingTop: 10, overflow: 'hidden' } as ViewStyle}>
        <Stage>
          <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: t.sunk, alignSelf: 'center', marginBottom: 16 }} />
          <Chips items={FILTERS} selected={filters} onToggle={toggle} />
        </Stage>
        <ScrollView ref={listRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 116 }}>
          {error ? (
            <View style={{ paddingTop: 20, gap: 14 }}>
              <B size={13} color={t.muted}>Couldn't load places near you.</B>
              <Btn kind="ghost" icon="map-pin">Choose an area</Btn>
            </View>
          ) : loading ? (
            [0, 1, 2, 3].map((i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }}>
                <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: t.sunk }} />
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={{ height: 12, width: '60%', borderRadius: 6, backgroundColor: t.sunk }} />
                  <View style={{ height: 10, width: '40%', borderRadius: 5, backgroundColor: t.sunk }} />
                </View>
              </View>
            ))
          ) : (
            list.map((m, i) => {
              const on = m.id === sel;
              const isMasjid = m.type === 'Masjid';
              return (
                <View key={m.id}>
                  <Tap onPress={() => pick(m.id)} onLongPress={() => router.push(`/place/${m.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.ink : t.surface, boxShadow: on ? undefined : `0 0 0 1px ${t.ring}` } as ViewStyle}>
                      <Icon name={isMasjid ? 'mosque-glyph' : 'map-pin'} size={18} color={on ? t.bg : t.ink} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <B size={15.5} weight={600} numberOfLines={1}>{m.name}</B>
                      <B size={12.5} color={t.muted} style={{ marginTop: 3 }} numberOfLines={1}>{m.area ? `${m.area}` : m.address}{isMasjid && m.jemaahTime ? ` · Jumaah ${m.jemaahTime}` : ''}</B>
                    </View>
                    <Tap onPress={() => router.push(`/place/${m.id}`)} hitSlop={8}>
                      <D size={18} weight={500}>{walkMin(m.distanceKm)} min</D>
                    </Tap>
                  </Tap>
                  {i < list.length - 1 ? <Hairline /> : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
