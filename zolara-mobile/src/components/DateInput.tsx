import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { CalendarDays } from "lucide-react-native";

interface DateInputProps {
  value: string;
  onChange: (date: string) => void;
}

const DateInput = ({ value, onChange }: DateInputProps) => {
  const [date, setDate] = useState(value ? new Date(value) : new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    if (value) {
      setDate(new Date(value));
    }
  }, [value]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    const currentDate = new Date();

    // Nếu ngày được chọn lớn hơn ngày hiện tại
    if (selectedDate > currentDate) {
      alert("Không thể chọn ngày trong tương lai");
      hideDatePicker();
      return;
    }

    setDate(selectedDate);
    onChange(selectedDate.toISOString().split("T")[0]);
    hideDatePicker();
  };

  return (
    <View className="w-full items-center flex-row justify-between border border-gray-300 h-16 p-2.5 rounded-lg">
      <TouchableOpacity
        onPress={showDatePicker}
        className="flex-row items-center w-full justify-between"
      >
        <Text className="text-gray-500 text-xl">
          {value ? date.toLocaleDateString() : "Ngày sinh"}
        </Text>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          maximumDate={new Date()} // Thêm giới hạn ngày tối đa là ngày hiện tại
        />
        <CalendarDays size={24} color={"gray"} />
      </TouchableOpacity>
    </View>
  );
};

export default DateInput;
