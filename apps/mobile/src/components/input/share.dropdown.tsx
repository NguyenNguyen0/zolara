import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useTheme } from '@/src/hooks/useTheme';
import { APP_COLOR } from '@/src/utils/constants';

interface DropdownItem {
  label: string;
  value: string;
}

interface ShareDropdownProps {
  data: DropdownItem[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  labelField?: string;
  valueField?: string;
  search?: boolean;
  maxHeight?: number;
  style?: any;
  placeholderStyle?: any;
  selectedTextStyle?: any;
  disabled?: boolean;
}

const ShareDropdown: React.FC<ShareDropdownProps> = ({
  data,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  labelField = 'label',
  valueField = 'value',
  search = false,
  maxHeight = 300,
  style,
  placeholderStyle,
  selectedTextStyle,
  disabled = false,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const { isDark } = useTheme();

  const defaultStyles = StyleSheet.create({
    dropdown: {
      height: 50,
      borderColor: isDark ? APP_COLOR.GREY : APP_COLOR.GREYDARK,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: APP_COLOR.LIGHT,
    },
    placeholderStyle: {
      fontSize: 16,
      color: APP_COLOR.GREY,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: APP_COLOR.DARK,
    },
    iconStyle: {
      width: 20,
      height: 20,
      tintColor: APP_COLOR.DARK,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
      color: APP_COLOR.DARK,
      backgroundColor: APP_COLOR.LIGHT,
    },
    itemTextStyle: {
      color: APP_COLOR.DARK,
      fontSize: 16,
    },
    containerStyle: {
      backgroundColor: APP_COLOR.LIGHT,
      borderColor: APP_COLOR.GREY,
      borderRadius: 8,
      borderWidth: 1,
    }
  });

  return (
    <View>
      <Dropdown
        style={[
          defaultStyles.dropdown,
          isFocus && { borderColor: APP_COLOR.PRIMARY },
          disabled && { opacity: 0.5 },
          style
        ]}
        placeholderStyle={[defaultStyles.placeholderStyle, placeholderStyle]}
        selectedTextStyle={[defaultStyles.selectedTextStyle, selectedTextStyle]}
        inputSearchStyle={defaultStyles.inputSearchStyle}
        iconStyle={defaultStyles.iconStyle}
        itemTextStyle={defaultStyles.itemTextStyle}
        containerStyle={defaultStyles.containerStyle}
        data={data}
        search={search}
        maxHeight={maxHeight}
        labelField={labelField}
        valueField={valueField}
        placeholder={!isFocus ? placeholder : '...'}
        searchPlaceholder={searchPlaceholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item: any) => {
          onChange(item[valueField]);
          setIsFocus(false);
        }}
        disable={disabled}
      />
    </View>
  );
};

export default ShareDropdown;