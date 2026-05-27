import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { StarPattern } from '../../components/ui/StarPattern';
import { PillToggle } from '../../components/ui/PillToggle';
import { Colors, Fonts, Radius, Shadow } from '../../constants/theme';
import {
  sendTanyaMessage,
  Message,
} from '../../services/anthropicApi';

const W = Dimensions.get('window').width;

const SUGGESTED_QUESTIONS = [
  'What is Tahajjud?',
  'Best halal food near me?',
  'Make dua for exam',
  'Is this product halal?',
  'Remind me for Asar',
];

function ChatIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8" cy="11" r="1" fill={color} />
      <Circle cx="12" cy="11" r="1" fill={color} />
      <Circle cx="16" cy="11" r="1" fill={color} />
    </Svg>
  );
}

function SendIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new RNAnimated.Value(0)).current;
  const dot2 = useRef(new RNAnimated.Value(0)).current;
  const dot3 = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: RNAnimated.Value, delay: number) => {
      return RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(delay),
          RNAnimated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          RNAnimated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
    };
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      {[dot1, dot2, dot3].map((dot, i) => (
        <RNAnimated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: Colors.jadeMid,
            opacity: dot,
            transform: [
              {
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -4],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

export default function TanyaScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<0 | 1>(0);
  const scrollRef = useRef<ScrollView>(null);

  const currentLang: 'en' | 'bm' = lang === 0 ? 'en' : 'bm';

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    let responseText = '';
    await sendTanyaMessage(
      newMessages,
      (chunk) => {
        responseText += chunk;
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: responseText },
        ]);
        setIsLoading(false);
        scrollToBottom();
      },
      currentLang
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: Colors.jade,
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 20,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <StarPattern opacity={0.06} width={W} height={160} />
          <View
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: 'rgba(255,255,255,0.07)',
            }}
          />

          <View
            style={{
              position: 'relative',
              zIndex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                ...Shadow.jade,
              }}
            >
              <ChatIcon color={Colors.jade} size={26} />
            </View>

            {/* Title */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.serif,
                  fontSize: 26,
                  color: Colors.white,
                  lineHeight: 30,
                }}
              >
                Tanya
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: '#4ADE80',
                  }}
                />
                <Text
                  style={{
                    fontFamily: Fonts.body,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  AI Islamic Companion · Active
                </Text>
              </View>
            </View>

            {/* Language toggle */}
            <View style={{ width: 110 }}>
              <PillToggle
                options={['EN', 'BM']}
                value={lang}
                onChange={setLang}
              />
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 10,
            backgroundColor: Colors.goldPale,
            borderRadius: Radius.md,
            borderLeftWidth: 3,
            borderLeftColor: Colors.gold,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.serifItalic,
              fontSize: 12.5,
              color: Colors.inkMid,
              lineHeight: 18,
            }}
          >
            Tanya offers general Islamic guidance. For fatwas or binding rulings,
            please consult a qualified ustaz or Mufti.
          </Text>
        </View>

        {/* Chat area */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Suggested questions */}
          {messages.length < 2 && !isLoading && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <Text
                style={{
                  fontFamily: Fonts.bodyMedium,
                  fontSize: 11.5,
                  color: Colors.inkDim,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                Suggested Questions
              </Text>
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 16 }}
              >
                {SUGGESTED_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => sendMessage(q)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      backgroundColor: Colors.white,
                      borderRadius: Radius.pill,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      ...Shadow.card,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.bodyMedium,
                        fontSize: 12.5,
                        color: Colors.inkMid,
                      }}
                    >
                      {q}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(0).duration(300)}
                style={{
                  flexDirection: 'row',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {/* Tanya avatar */}
                {!isUser && (
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: Colors.jadeLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>🌙</Text>
                  </View>
                )}

                <View
                  style={{
                    maxWidth: W * 0.72,
                    borderRadius: isUser
                      ? Radius.lg
                      : Radius.lg,
                    borderBottomRightRadius: isUser ? 4 : Radius.lg,
                    borderBottomLeftRadius: isUser ? Radius.lg : 4,
                    backgroundColor: isUser ? Colors.jade : Colors.white,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    ...(isUser ? Shadow.jade : Shadow.card),
                    borderWidth: isUser ? 0 : 1,
                    borderColor: Colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.body,
                      fontSize: 14,
                      color: isUser ? Colors.white : Colors.ink,
                      lineHeight: 20,
                    }}
                  >
                    {msg.content}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

          {/* Typing indicator */}
          {isLoading && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: Colors.jadeLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14 }}>🌙</Text>
              </View>
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderRadius: Radius.lg,
                  borderBottomLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  ...Shadow.card,
                }}
              >
                <TypingIndicator />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: Colors.white }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              gap: 10,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              backgroundColor: Colors.white,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                currentLang === 'bm'
                  ? 'Taip soalan anda...'
                  : 'Ask anything Islamic...'
              }
              placeholderTextColor={Colors.inkDim}
              style={{
                flex: 1,
                backgroundColor: Colors.bgWarm,
                borderRadius: Radius.pill,
                paddingHorizontal: 16,
                paddingVertical: 11,
                fontFamily: Fonts.body,
                fontSize: 14,
                color: Colors.ink,
                minHeight: 44,
                maxHeight: 100,
              }}
              multiline
              onSubmitEditing={() => sendMessage(input)}
              returnKeyType="send"
              blurOnSubmit
            />

            <TouchableOpacity
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor:
                  input.trim() && !isLoading ? Colors.jade : Colors.bgDeep,
                alignItems: 'center',
                justifyContent: 'center',
                ...(input.trim() && !isLoading ? Shadow.jade : {}),
              }}
              activeOpacity={0.8}
            >
              <SendIcon
                color={
                  input.trim() && !isLoading ? Colors.white : Colors.inkDim
                }
                size={20}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
