import { Select } from "@mantine/core";
import classes from "./FormSelect.module.css";

interface FormSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string | null) => void;
  data: Array<{ value: string; label: string }>;
  clearable?: boolean;
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  placeholder,
  value,
  onChange,
  data,
  clearable = true,
  disabled = false,
  size = "sm",
  className,
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data={data}
      clearable={clearable}
      disabled={disabled}
      size={size}
      className={`${classes.select} ${className || ""}`}
    />
  );
};

export default FormSelect;
