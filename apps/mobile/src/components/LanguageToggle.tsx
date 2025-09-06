import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/src/contexts/ThemeContext';

const LanguageToggle: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const { isDark } = useTheme();

  const changeLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const displayLanguage = i18n.language === 'en' ? 'EN' : 'VI';

  return (
    <TouchableOpacity
      onPress={changeLanguage}
      className={`px-3 py-2 rounded-full ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}
      activeOpacity={0.7}
    >
      <Text className={`font-medium text-sm ${
        isDark ? 'text-white' : 'text-gray-700'
      }`}>
        {displayLanguage}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
