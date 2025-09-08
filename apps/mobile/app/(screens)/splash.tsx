import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation('splash');

  // Pulse animation cho logo
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    const timer = setTimeout(() => {
      // TODO: SET LOGIC NAVIGATE
      router.replace('/(screens)/(auth)/welcome');
    }, 3000);

    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [router, scale]);

  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <StatusBar style="light" translucent />
      <Animated.View
        style={{ transform: [{ scale }] }}
        className="items-center"
      >
        <Image
          source={require('@/src/assets/brand/logo_temporary.png')}
          className="w-40 h-40 rounded-2xl shadow-2xl"
          accessibilityLabel="App Logo"
        />
        <Text className="mt-6 text-white/90 tracking-[0.25em] uppercase font-semibold">
          {t('loading')}
        </Text>

        <Text className="mt-2 text-white/70 text-[13px]">
          {t('subtitle')}
        </Text>
      </Animated.View>

      <View className="absolute bottom-10">
        <Text className="text-white/80 text-[13px]">
          {t('copyright', { year: new Date().getFullYear() })}
        </Text>
      </View>
    </View>
  );
}
