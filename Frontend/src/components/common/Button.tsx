import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'md' | 'sm';
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  loadingText = 'Please wait...',
  disabled,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;
