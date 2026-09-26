import { cloneElement, isValidElement } from 'react';
import './button.css';

const Button = ({
  className = '',
  asChild = false,
  children,
  type = 'button',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const buttonClassName = `ca-ui-button ${className}`.trim();
  const dataProps = {
    'data-slot': 'button',
    'data-variant': variant,
    'data-size': size,
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...dataProps,
      className: `${buttonClassName} ${children.props.className || ''}`.trim(),
    });
  }

  return (
    <button {...dataProps} className={buttonClassName} type={type} {...props}>
      {children}
    </button>
  );
};

export { Button };
