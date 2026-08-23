import { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  name: string;
  error?: string;
  helpText?: string;
}

const TextArea = ({
  label,
  name,
  error,
  helpText,
  required,
  rows = 3,
  className = '',
  ...rest
}: TextAreaProps) => {
  return (
    <div className="form-field">
      {label && (
        <label className="form-field__label" htmlFor={name}>
          {label}
          {required && <span className="form-field__required">*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        rows={rows}
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

export default TextArea;
