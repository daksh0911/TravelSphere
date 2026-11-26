import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  type = 'button',
  icon: Icon,
  ...props 
}) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon className="btn-icon" size={18} />}
      {children}
    </button>
  );
};

export default Button;
