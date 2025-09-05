import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/contexts/ThemeContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';

const ThemeToggle: React.FC = () => {
  const { theme, isDark, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const renderIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <Feather
            name="sun"
            size={20}
            color={isDark ? '#ffffff' : '#374151'}
          />
        );
      case 'dark':
        return (
          <Feather
            name="moon"
            size={20}
            color={isDark ? '#ffffff' : '#374151'}
          />
        );
      case 'system':
        return (
          <MaterialIcons
            name="smartphone"
            size={20}
            color={isDark ? '#ffffff' : '#374151'}
          />
        );
      default:
        return (
          <Feather
            name="sun"
            size={20}
            color={isDark ? '#ffffff' : '#374151'}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`w-10 h-10 rounded-full items-center justify-center ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}
      activeOpacity={0.7}
    >
      {renderIcon()}
    </TouchableOpacity>
  );
};

export default ThemeToggle;
