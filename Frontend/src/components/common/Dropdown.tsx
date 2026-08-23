import { SelectHTMLAttributes } from 'react';

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  options: DropdownOption[];
  error?: string;
  helpText?: string;
  placeholder?: string;
}

const Dropdown = ({
  label,
  name,
  options,
  error,
  helpText,
  placeholder,
  required,
  className = '',
  ...rest
}: DropdownProps) => {
  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={name}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        required={required}
        className={`form-field__control ${error ? 'form-field__control--invalid' : ''} ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <span className="form-field__error">{error}</span>
      ) : (
        helpText && <span className="form-field__help">{helpText}</span>
      )}
    </div>
  );
};

export default Dropdown;
