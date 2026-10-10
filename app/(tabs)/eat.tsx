import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { B, Bezel, D, I, Photo, Round, Screen, SectionHead, Tag } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { Fonts, SKY } from '@/constants/theme';
import { useHalalFood } from '@/hooks/useHalalFood';
import { useApp } from '@/store/app';
import { MOODS, moodOf, ratingOf } from '@/lib/food';

const TONES = ['#EADFCC', '#E3D6CE', '#DCE0D2', '#E6DCD0'];
const TONES_DARK = ['#2A2622', '#2B2524', '#252A24', '#2A2724'];

export default function Eat() {
  const t = useTheme();
  const router = useRouter();
  const { data: food, loading } = useHalalFood();
  const { state, dispatch } = useApp();
  const [mood, setMood] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');

  const counts = useMemo(() => Object.fromEntries(MOODS.map((m) => [m.key, food.filter(m.test).length])), [food]);
  const list = useMemo(() => {
    let rows = food.filter((f) => f.certified || f.rating > 0);
    if (mood) rows = rows.filter(MOODS.find((m) => m.key === mood)!.test);
    const s = q.trim().toLowerCase();
    if (s) rows = rows.filter((f) => f.name.toLowerCase().includes(s) || f.cuisine.toLowerCase().includes(s) || f.district.toLowerCase().includes(s));
    return rows.slice(0, 10);
  }, [food, mood, q]);

  return (
    <Screen tab>
      <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Tag>MUIS-certified only</Tag>
          {search ? (
            <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search spots" placeholderTextColor={t.muted} style={{ fontFamily: Fonts.display, fontSize: 36, color: t.ink, letterSpacing: -1.2, marginTop: 14, padding: 0, outlineStyle: 'none' } as any} />
          ) : (
            <Text style={{ marginTop: 14 }}>
              <D size={46} lh={1}>What's the </D>
              <I size={50}>mood?</I>
            </Text>
          )}
        </View>
        <Round name="search" onPress={() => { setSearch((s) => !s); setQ(''); }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 8 }}>
        {MOODS.map((m, i) => {
          const s = SKY[m.sky];
          const on = mood === m.key;
          return (
            <Bezel key={m.key} bg={s.bg} r={24} onPress={() => setMood(on ? null : m.key)} style={{ width: i === 0 ? 168 : 132, height: 150, padding: 16, justifyContent: 'space-between', opacity: mood && !on ? 0.55 : 1 }}>
              <B size={12} color={s.dim}>{loading ? '…' : `${counts[m.key]} spot${counts[m.key] === 1 ? '' : 's'}`}</B>
              <D size={24} color={s.ink} lh={1}>{m.label}</D>
            </Bezel>
          );
        })}
      </ScrollView>

      <SectionHead pre={mood ? MOODS.find((m) => m.key === mood)!.label : 'Trending'} accent={mood ? 'spots' : 'near you'} link="Map" onLink={() => router.push('/(tabs)/eat-map')} style={{ paddingTop: 30, paddingBottom: 14 }} />

      <View style={{ gap: 22, paddingHorizontal: 22, paddingBottom: 10 }}>
        {loading
          ? [0, 1].map((i) => <Bezel key={i} r={28} style={{ padding: 6 }}><View style={{ height: i === 0 ? 200 : 150, borderRadius: 23, backgroundColor: t.sunk }} /><View style={{ height: 52 }} /></Bezel>)
          : list.map((f, i) => {
              const m = moodOf(f);
              const saved = state.saved.includes(`food:${f.id}`);
              return (
                <Bezel key={f.id} r={28} onPress={() => router.push(`/food/${encodeURIComponent(f.id)}`)} style={{ padding: 6 }}>
                  <View>
                    <Photo label={`${f.emoji} ${f.cuisine.split(' ·')[0]}`} h={i === 0 ? 200 : 150} r={23} tone={(t.dark ? TONES_DARK : TONES)[i % 4]} labelTop={t.islamic} />
                    {m ? <View style={{ position: 'absolute', left: 12, ...(t.islamic ? { bottom: 12 } : { top: 12 }) }}><Tag color={t.ink} bg={t.dark ? 'rgba(27,30,27,0.92)' : 'rgba(252,251,248,0.92)'} ring="transparent">{m.label}</Tag></View> : null}
                    <View style={{ position: 'absolute', right: 10, ...(t.islamic ? { bottom: 10 } : { top: 10 }) }}>
                      <Round name="heart" size={38} onPress={() => dispatch({ type: 'toggleSaved', id: `food:${f.id}` })} color={saved ? '#B6503F' : undefined} />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14, paddingHorizontal: 12, paddingBottom: 10 }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <B size={16} weight={600} numberOfLines={1}>{f.name}</B>
                      <B size={13} color={t.muted} style={{ marginTop: 3 }} numberOfLines={1}>{f.cuisine} · {f.distanceKm} km</B>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Icon name="star" size={13} color={t.ink} />
                      <B size={14} weight={600}>{ratingOf(f).toFixed(1)}</B>
                    </View>
                  </View>
                </Bezel>
              );
            })}
        {!loading && !list.length ? <B size={13} color={t.muted} style={{ paddingHorizontal: 2 }}>Nothing matches yet. Try another mood.</B> : null}
      </View>
    </Screen>
  );
}
