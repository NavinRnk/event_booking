import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: string;
  helpText?: string;
}

const Input = ({
  label,
  name,
  error,
  helpText,
  required,
  className = '',
  ...rest
}: InputProps) => {
  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={name}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        required={required}
        className={`form-field__control ${error ? 'form-field__control--invalid' : ''} ${className}`}
        {...rest}
      />

      {error ? (
        <span className="form-field__error">{error}</span>
      ) : (
        helpText && <span className="form-field__help">{helpText}</span>
      )}
    </div>
  );
};

export default Input;
