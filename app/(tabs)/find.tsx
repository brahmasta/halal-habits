import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Platform, ScrollView, TextInput, View, ViewStyle, useWindowDimensions } from 'react-native';
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
/** Sheet peek position from the design (y = 390). */
const PEEK_Y = 390;
const SHEET_HEADER_H = 92; // handle + chips, always visible when collapsed

function shortName(n: string) {
  return n.replace(/^(Musollah|Masjid|Surau)\s+/i, '').replace(/\s+(Shopping )?(Mall|Centre|Center|Junction)$/i, (m) => (m.trim() === 'Junction' ? ' Jn' : ''));
}

export default function Find() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useApp();
  const here = state.location ?? SG_CENTER;
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
  const { height: H } = useWindowDimensions();

  // Draggable sheet: expanded (under the search pill) · peek (design) · collapsed (chips only, map mostly visible)
  const snaps = useMemo(() => {
    const expanded = top + 50 + 16;
    const collapsed = Math.max(PEEK_Y, H - SHEET_HEADER_H - 116 - 10);
    return { expanded, peek: Math.min(PEEK_Y, collapsed), collapsed };
  }, [top, H]);
  const snapsRef = useRef(snaps);
  snapsRef.current = snaps;
  const sheetY = useRef(new Animated.Value(Math.min(PEEK_Y, snaps.collapsed))).current;
  const posRef = useRef(Math.min(PEEK_Y, snaps.collapsed));
  const startRef = useRef(0);
  useEffect(() => {
    const id = sheetY.addListener(({ value }) => {
      posRef.current = value;
    });
    return () => sheetY.removeListener(id);
  }, [sheetY]);
  useEffect(() => {
    Animated.timing(sheetY, { toValue: snaps.peek, duration: 500, easing: Easing.bezier(0.32, 0.72, 0, 1), useNativeDriver: false }).start();
  }, [snaps.peek, sheetY]);

  const pan = useRef(
    PanResponder.create({
      // Take over on a mostly-vertical drag; taps and horizontal chip scrolling pass through.
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        sheetY.stopAnimation();
        startRef.current = posRef.current;
      },
      onPanResponderMove: (_e, g) => {
        const { expanded, collapsed } = snapsRef.current;
        sheetY.setValue(Math.min(collapsed, Math.max(expanded, startRef.current + g.dy)));
      },
      onPanResponderRelease: (_e, g) => {
        const { expanded, peek, collapsed } = snapsRef.current;
        const velocity = g.vy * 1000; // px/s
        const projected = posRef.current + velocity * 0.15;
        let target = expanded;
        for (const p of [expanded, peek, collapsed]) if (Math.abs(p - projected) < Math.abs(target - projected)) target = p;
        Animated.spring(sheetY, { toValue: target, velocity: g.vy, damping: 26, stiffness: 220, mass: 0.9, useNativeDriver: false }).start();
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
        <MapPanel markers={markers} center={here} userLocation={here} height={H} onMarkerPress={pick} dark={t.dark} ink={t.ink} bg={t.bg} surface={t.surface} ring={t.ring} />
      </View>

      <View style={{ position: 'absolute', top, left: 18, right: 18, flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, height: 50, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, backgroundColor: t.glass, boxShadow: `inset 0 1px 0 ${t.hi}, 0 0 0 1px ${t.ring}, 0 14px 30px -16px ${t.shadow}` } as ViewStyle}>
          <Icon name="search" size={17} color={t.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Mall, MRT or masjid" placeholderTextColor={t.muted} style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, color: t.ink, padding: 0, outlineStyle: 'none' } as any} />
        </View>
        <Round name="layers" size={50} />
      </View>

      <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 36, borderTopRightRadius: 36, backgroundColor: t.bg, boxShadow: '0 -18px 40px -20px rgba(18,20,18,0.25)', overflow: 'hidden' } as ViewStyle, { top: sheetY }]}>
        <View {...pan.panHandlers} style={{ paddingTop: 10, paddingBottom: 4 }} testID="find-sheet-handle">
          <Stage>
            <View style={{ width: 40, height: 5, borderRadius: 9, backgroundColor: t.sunk, alignSelf: 'center', marginBottom: 16 }} />
            <Chips items={FILTERS} selected={filters} onToggle={toggle} />
          </Stage>
        </View>
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
      </Animated.View>
    </View>
  );
}
