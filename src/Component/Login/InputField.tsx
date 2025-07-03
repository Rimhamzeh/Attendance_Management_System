
import React from "react";
import { Eye, EyeOff } from "lucide-react";


interface InputFieldProps {
    id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  theme: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  required = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  theme,
}) => {
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className="relative">
      <input
        autoComplete="off"
        id={id}
        name={id}
        type={inputType}
        className={`peer placeholder-transparent h-10 w-full border-b-2 ${
          theme === "dark"
            ? "border-gray-600 bg-gray-700 text-white"
            : "border-gray-300 bg-transparent text-black"
        } focus:outline-none focus:border-rose-600 transition-colors duration-200`}
        placeholder={label}
        value={value}
        onChange={onChange}
        required={required}
      />
      <label
        htmlFor={id}
        className={`absolute left-0 -top-3.5 text-sm ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        } peer-placeholder-shown:text-base peer-placeholder-shown:${
          theme === "dark" ? "text-gray-400" : "text-gray-400"
        } peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-sm`}
      >
        {label}
      </label>
      {showPasswordToggle && (
        <span
          onClick={onTogglePassword}
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer select-none"
          role="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onTogglePassword?.();
            }
          }}
        >
          {showPassword ? (
            <EyeOff
              size={20}
              className={theme === "dark" ? "text-gray-300" : "text-black"}
            />
          ) : (
            <Eye
              size={20}
              className={theme === "dark" ? "text-gray-300" : "text-black"}
            />
          )}
        </span>
      )}
    </div>
  );
};