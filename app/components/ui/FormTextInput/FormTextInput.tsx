import { TextInput } from "@mantine/core";
import classes from "./FormTextInput.module.css";

interface FormTextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export const FormTextInput: React.FC<FormTextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  size = "sm",
  className,
  leftSection,
  rightSection,
}) => {
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      size={size}
      className={`${classes.textInput} ${className || ""}`}
      leftSection={leftSection}
      rightSection={rightSection}
    />
  );
};

export default FormTextInput;
