import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Yup from "yup";

const passwordSchema = Yup.string()
  .required("Enter the new password")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*#.?&_-]).{8,64}$/,
    "Password must be 8-64 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character"
  );

const phoneSchema = Yup.string()
  .required("Enter the new phone")
  .matches(/^0(5|6|7)[0-9]{8}$/, "Invalid phone number");
const emailSchema = Yup.string()
  .email("Invalid email address")
  .required("Email Is Required");
interface PasswordInputProps {
  label?: string;
  input?: "password" | "phone" | "email";
  placeholder?: string;
  onValueChange?: (text: string) => void;
  validate?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label = "Password",
  input = "password",
  placeholder,
  onValueChange,
  validate = true,
}) => {
  const [secureText, setSecureText] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangeText = async (text: string) => {
    if (validate) {
      try {
        if (input.toLowerCase() === "password") {
          await passwordSchema.validate(text);
        } else if (input.toLowerCase() === "phone") {
          await phoneSchema.validate(text);
        } else if (input.toLowerCase() === "email") {
          await emailSchema.validate(text);
        }
        setErrorMessage(null);
        if (onValueChange) onValueChange(text);
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          setErrorMessage(error.message);
        }
      }
    } else {
      setErrorMessage(null);
      if (onValueChange) onValueChange(text);
    }
  };

  const iconName =
    input.toLowerCase() === "password"
      ? "lock-closed-outline"
      : input.toLowerCase() === "email"
        ? "mail-outline"
        : "call-outline";

  return (
    <View className="self-center my-3" style={{ width: "90%" }}>
      <Text
        className="text-[16px] mb-1"
        style={{ fontFamily: "Itim_400Regular" }}
      >
        {label}
      </Text>
      <View
        className="flex-row items-center border border-[#2B524A] px-2"
        style={{ borderRadius: 10, backgroundColor: "#f9f9f9" }}
      >
        <Ionicons name={iconName} size={20} color="#2B524A" className="ml-1" />

        <TextInput
          className="flex-1 h-[45px] px-2 text-left text-base"
          placeholder={placeholder}
          secureTextEntry={input === "password" && secureText}
          onChangeText={handleChangeText}
          placeholderTextColor="gray"
          keyboardType={
            input === "email"
              ? "email-address"
              : input === "phone"
                ? "phone-pad"
                : "default"
          }
          autoCapitalize={input === "email" ? "none" : "sentences"}
          autoCorrect={input !== "email"}
        />

        {input === "password" && (
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <Ionicons
              name={secureText ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={secureText ? "grey" : "#4C8479"}
              className="mx-1.5"
            />
          </TouchableOpacity>
        )}
      </View>
      {errorMessage ? (
        <Text className="text-red-500 text-[14px] mt-1">{errorMessage}</Text>
      ) : null}
    </View>
  );
};

export default PasswordInput;
