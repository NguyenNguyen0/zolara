import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation('common');

  const changeLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const displayLanguage = i18n.language === 'en' ? 'EN' : 'VI';

  return (
    <TouchableOpacity
      onPress={changeLanguage}
      className="px-3 py-2 rounded-full bg-secondary-light dark:bg-secondary-dark"
      activeOpacity={0.7}
    >
      <Text className='font-medium text-sm bg-secondary-light text-secondary-dark dark:bg-secondary-dark dark:text-secondary-light'>
        {displayLanguage}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
