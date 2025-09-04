import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}) => {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      className={`mb-4 flex w-full flex-row items-center justify-center rounded-lg p-3 ${
        isPrimary
          ? "bg-amber-500"
          : "border border-amber-500 bg-white"
      } ${disabled || isLoading ? "opacity-50" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? "white" : "#F59E0B"}
          className="mr-2"
        />
      ) : null}
      <Text
        className={`text-center text-base font-medium ${
          isPrimary ? "text-white" : "text-amber-500"
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
