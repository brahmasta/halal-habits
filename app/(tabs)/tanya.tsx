import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { B, Bezel, D, I, Round, Stage, Tag, Tap, bezel } from '@/components/ui/kit';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/components/ui/ThemeContext';
import { enter } from '@/components/ui/enter';
import { Fonts, SKY, Sky } from '@/constants/theme';
import { Message, sendTanyaMessage } from '@/services/anthropicApi';

const PROMPTS: Array<[string, Sky | null, 1 | 2]> = [
  ['Can I pray in my office pantry?', SKY.zohor, 2],
  ['Is E471 halal?', null, 1],
  ['Combining prayers on a KL trip', null, 1],
  ["Du'a before an exam", SKY.subuh, 2],
];

export default function Tanya() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const toEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(next);
    setInput('');
    setBusy(true);
    setStreaming('');
    toEnd();
    let out = '';
    await sendTanyaMessage(
      next,
      (chunk) => {
        out += chunk;
        setStreaming(out);
        toEnd();
      },
      () => {
        setMessages((prev) => [...prev, { role: 'assistant', content: out || 'Sorry, I could not reach my sources just now.' }]);
        setStreaming('');
        setBusy(false);
        toEnd();
      },
      'en'
    );
  };

  const top = Math.max(insets.top, Platform.OS === 'web' ? 24 : 0) + 32;
  const empty = messages.length === 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: top, paddingBottom: 16 }}>
        <Stage>
          <View style={{ paddingHorizontal: 22, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Tag>Tanya · study companion</Tag>
            <Round name="clock" onPress={() => setMessages([])} />
          </View>
          {empty ? (
            <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
              <Text>
                <D size={50} lh={0.95}>Ask the thing you were </D>
                <I size={54}>shy</I>
                <D size={50} lh={0.95}> to ask.</D>
              </Text>
              <B size={14.5} color={t.muted} lh={1.5} style={{ marginTop: 14, maxWidth: 310 }}>
                Every answer cites Qur'an, hadith or classical sources. For personal rulings, it points you to an asatizah.
              </B>
            </View>
          ) : null}
          {empty ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingHorizontal: 22, paddingTop: 28, paddingBottom: 12 }}>
              {PROMPTS.map(([p, s, span]) => (
                <Bezel key={p} bg={s?.bg} r={22} onPress={() => send(p)} style={{ width: span === 2 ? '100%' : '47.5%', flexGrow: 1, padding: 16, minHeight: span === 2 ? 84 : 112, justifyContent: 'space-between', gap: 10 }}>
                  <B size={15} weight={600} color={s ? s.ink : t.ink} lh={1.3}>{p}</B>
                  <View style={{ alignSelf: 'flex-end', opacity: 0.6 }}>
                    <Icon name="arrow" size={15} color={s ? s.ink : t.ink} />
                  </View>
                </Bezel>
              ))}
            </View>
          ) : null}
          {!empty ? (
            <View style={{ paddingHorizontal: 22, paddingTop: 22, gap: 12 }}>
              {messages.map((m, i) => (
                <Animated.View key={i} entering={enter(0, 400)} style={{ alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'user' ? (
                    <View style={{ maxWidth: '82%', backgroundColor: t.ink, borderRadius: 24, borderBottomRightRadius: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
                      <B size={14.5} weight={500} color={t.bg} lh={1.45}>{m.content}</B>
                    </View>
                  ) : (
                    <View style={[bezel(t, undefined, 24), { maxWidth: '90%', paddingHorizontal: 18, paddingVertical: 14 }]}>
                      <B size={14.5} lh={1.55}>{m.content}</B>
                      <B size={11.5} color={t.muted} style={{ marginTop: 10 }}>For personal rulings, ask an asatizah.</B>
                    </View>
                  )}
                </Animated.View>
              ))}
              {busy ? (
                <View style={[bezel(t, undefined, 24), { alignSelf: 'flex-start', maxWidth: '90%', paddingHorizontal: 18, paddingVertical: 14 }]}>
                  <B size={14.5} lh={1.55} color={streaming ? t.ink : t.muted}>{streaming || 'Checking the sources…'}</B>
                </View>
              ) : null}
            </View>
          ) : null}
        </Stage>
      </ScrollView>
      <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 100 }}>
        <View style={[bezel(t, undefined, 999), { height: 58, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 22, paddingRight: 7 }]}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask anything about the deen" placeholderTextColor={t.muted} onSubmitEditing={() => send(input)} returnKeyType="send" style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, color: t.ink, padding: 0, outlineStyle: 'none' } as any} />
          <Tap onPress={() => send(input)} disabled={busy} style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.5 : 1 } as ViewStyle}>
            <Icon name="arrow" size={17} color={t.bg} />
          </Tap>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
