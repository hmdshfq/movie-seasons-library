import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      name,
      value,
      onChange,
      error,
      icon: Icon,
      helperText,
      ...props
    },
    ref
  ) => {
    const inputId = `input-${name}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-4 py-3 bg-slate-700 rounded-lg border-2 ${
              error ? "border-red-500" : "border-transparent"
            } focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-400`}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
