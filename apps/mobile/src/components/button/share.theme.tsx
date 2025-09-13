import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/hooks/useTheme';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { APP_COLOR } from '@/src/utils/constants';

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

  const renderIcon = (color: string) => {
    switch (theme) {
      case 'light':
        return (
          <Feather
            name="sun"
            size={20}
            color={color}
          />
        );
      case 'dark':
        return (
          <Feather
            name="moon"
            size={20}
            color={color}
          />
        );
      case 'system':
        return (
          <MaterialIcons
            name="smartphone"
            size={20}
            color={color}
          />
        );
      default:
        return (
          <Feather
            name="sun"
            size={20}
            color={color}
          />
        );
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className='w-10 h-10 rounded-full items-center justify-center bg-secondary-light dark:bg-secondary-dark'
      activeOpacity={0.7}
    >
      {renderIcon(isDark ? APP_COLOR.LIGHT_MODE : APP_COLOR.DARK_MODE)}
    </TouchableOpacity>
  );
};

export default ThemeToggle;
