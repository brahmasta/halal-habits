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
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { enter } from '../../components/ui/enter';
import Svg, { Path, Circle } from 'react-native-svg';
import { Glow } from '../../components/ui/Glow';
import { Colors, Fonts, Gradients, Radius, Shadow } from '../../constants/theme';
import {
  sendTanyaMessage,
  Message,
} from '../../services/anthropicApi';

const W = Dimensions.get('window').width;
const GRAD_START = { x: 0, y: 0 };
const GRAD_END = { x: 1, y: 1 };

const SUGGESTED_QUESTIONS = [
  'What is Tahajjud?',
  'Best halal food near me?',
  'Make dua for exam',
  'Is this product halal?',
  'Remind me for Asar',
];

// Chat-bubble glyph with three colored dots. Sized via width/height props.
function ChatBubble({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M13 3C8 3 4 6.13 4 10c0 2.2 1.2 4.2 3.1 5.5V19l3.8-2.4c.68.1 1.38.16 2.1.16 5 0 9-3.13 9-7S18 3 13 3z"
        fill="rgba(255,255,255,0.95)"
      />
      <Circle cx={9.5} cy={10} r={1.3} fill="#0B7A4F" />
      <Circle cx={13} cy={10} r={1.3} fill="#921FFF" />
      <Circle cx={16.5} cy={10} r={1.3} fill="#0B7A4F" />
    </Svg>
  );
}

function SendIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
        stroke="#fff"
        strokeWidth={2.2}
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
        paddingHorizontal: 16,
        paddingVertical: 13,
      }}
    >
      {[dot1, dot2, dot3].map((dot, i) => (
        <RNAnimated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: Colors.brand,
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

// Small gradient avatar square shown beside assistant bubbles.
function TanyaAvatar() {
  return (
    <LinearGradient
      colors={Gradients.brand}
      start={GRAD_START}
      end={GRAD_END}
      style={{
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
      }}
    >
      <ChatBubble size={15} />
    </LinearGradient>
  );
}

export default function TanyaScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [lang, setLang] = useState<0 | 1>(0);
  const scrollRef = useRef<ScrollView>(null);

  const currentLang: 'en' | 'bm' = lang === 0 ? 'en' : 'bm';

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const toggleLang = () => setLang((prev) => (prev === 0 ? 1 : 0));

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setStreaming('');
    scrollToBottom();

    let responseText = '';
    await sendTanyaMessage(
      newMessages,
      (chunk) => {
        responseText += chunk;
        setStreaming(responseText);
        scrollToBottom();
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: responseText },
        ]);
        setStreaming('');
        setIsLoading(false);
        scrollToBottom();
      },
      currentLang
    );
  };

  const canSend = !!input.trim() && !isLoading;

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
            backgroundColor: Colors.headerDark,
            paddingHorizontal: 22,
            paddingTop: 20,
            paddingBottom: 22,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Glow
            color="rgba(11,122,79,0.26)"
            size={220}
            stop={0.7}
            style={{ top: -60, right: -40 }}
          />

          <View style={{ position: 'relative', zIndex: 2 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Avatar */}
              <LinearGradient
                colors={Gradients.brand}
                start={GRAD_START}
                end={GRAD_END}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...Shadow.greenGlow,
                }}
              >
                <ChatBubble size={24} />
              </LinearGradient>

              {/* Title + status */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.extrabold,
                    fontSize: 24,
                    color: Colors.white,
                    letterSpacing: 0.7,
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
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.brandBright,
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: Fonts.medium,
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    AI Islamic Companion · Active
                  </Text>
                </View>
              </View>

              {/* Language toggle */}
              <TouchableOpacity
                onPress={toggleLang}
                activeOpacity={0.8}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.16)',
                  borderRadius: Radius.pill,
                  paddingVertical: 7,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: Fonts.bold }}>
                  <Text
                    style={{
                      color:
                        currentLang === 'en'
                          ? Colors.brandBright
                          : 'rgba(255,255,255,0.5)',
                      fontFamily: Fonts.bold,
                    }}
                  >
                    EN
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontFamily: Fonts.bold,
                    }}
                  >
                    {' / '}
                  </Text>
                  <Text
                    style={{
                      color:
                        currentLang === 'bm'
                          ? Colors.brandBright
                          : 'rgba(255,255,255,0.5)',
                      fontFamily: Fonts.bold,
                    }}
                  >
                    BM
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Disclaimer */}
            <View
              style={{
                marginTop: 14,
                borderLeftWidth: 2,
                borderLeftColor: Colors.brand,
                paddingLeft: 14,
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.regular,
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 19,
                }}
              >
                &quot;Like a knowledgeable friend, not a mufti.&quot; For binding
                rulings, always consult a qualified ustaz.
              </Text>
            </View>
          </View>
        </View>

        {/* Chat area */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: Colors.bg }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 10,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Suggested questions */}
          {messages.length < 2 && !isLoading && (
            <Animated.View entering={enter(0, 400)}>
              <Text
                style={{
                  fontFamily: Fonts.extrabold,
                  fontSize: 10,
                  color: Colors.dim,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Suggested
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {SUGGESTED_QUESTIONS.map((q) => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => sendMessage(q)}
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 9,
                      backgroundColor: Colors.white,
                      borderRadius: Radius.btn,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      ...Shadow.cardSubtle,
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.semibold,
                        fontSize: 12,
                        color: Colors.body,
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
                entering={enter(0, 300)}
                style={{
                  flexDirection: 'row',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {!isUser && <TanyaAvatar />}

                {isUser ? (
                  <LinearGradient
                    colors={Gradients.brand}
                    start={GRAD_START}
                    end={GRAD_END}
                    style={{
                      maxWidth: W * 0.78,
                      borderTopLeftRadius: 20,
                      borderTopRightRadius: 20,
                      borderBottomRightRadius: 5,
                      borderBottomLeftRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      ...Shadow.greenGlowSoft,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.semibold,
                        fontSize: 14,
                        color: Colors.white,
                        lineHeight: 22,
                      }}
                    >
                      {msg.content}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      maxWidth: W * 0.78,
                      backgroundColor: Colors.white,
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderTopLeftRadius: 20,
                      borderTopRightRadius: 20,
                      borderBottomRightRadius: 20,
                      borderBottomLeftRadius: 5,
                      paddingHorizontal: 16,
                      paddingVertical: 13,
                      ...Shadow.card,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Fonts.regular,
                        fontSize: 14,
                        color: Colors.heading,
                        lineHeight: 22,
                      }}
                    >
                      {msg.content}
                    </Text>
                  </View>
                )}
              </Animated.View>
            );
          })}

          {/* Live streaming reply + typing indicator */}
          {isLoading && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-end',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <TanyaAvatar />
              <View
                style={{
                  maxWidth: W * 0.78,
                  backgroundColor: Colors.white,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  borderBottomRightRadius: 20,
                  borderBottomLeftRadius: 5,
                  ...Shadow.card,
                  ...(streaming
                    ? { paddingHorizontal: 16, paddingVertical: 13 }
                    : {}),
                }}
              >
                {streaming ? (
                  <Text
                    style={{
                      fontFamily: Fonts.regular,
                      fontSize: 14,
                      color: Colors.heading,
                      lineHeight: 22,
                    }}
                  >
                    {streaming}
                  </Text>
                ) : (
                  <TypingIndicator />
                )}
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
              paddingTop: 10,
              paddingBottom: 10,
              gap: 10,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              backgroundColor: Colors.white,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.subtleFill,
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: Radius.input,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={
                  currentLang === 'bm'
                    ? 'Tanya apa-apa sahaja…'
                    : 'Ask Tanya anything…'
                }
                placeholderTextColor={Colors.dim}
                style={{
                  fontFamily: Fonts.regular,
                  fontSize: 14,
                  color: Colors.heading,
                  maxHeight: 100,
                  padding: 0,
                }}
                multiline
                onSubmitEditing={() => sendMessage(input)}
                returnKeyType="send"
                blurOnSubmit
              />
            </View>

            <TouchableOpacity
              onPress={() => sendMessage(input)}
              disabled={!canSend}
              activeOpacity={0.85}
              style={{ opacity: canSend ? 1 : 0.5 }}
            >
              <LinearGradient
                colors={Gradients.brand}
                start={GRAD_START}
                end={GRAD_END}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...Shadow.greenGlow,
                }}
              >
                <SendIcon size={18} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
