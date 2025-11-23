export default function Button({
  children,
  onClick,
  variant = "primary",
  icon: Icon,
  ariaLabel,
  fullWidth,
  loading,
  type = "button",
  disabled = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25",
    secondary:
      "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg hover:shadow-pink-500/25",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled || loading}
      className={`spring-button px-8 py-3 rounded-full font-semibold flex items-center gap-2 ${variants[variant]} ${widthClass}`}
      aria-label={ariaLabel}
      {...props}>
      {Icon && <Icon size={20} aria-hidden="true" />}
      {children}
    </button>
  );
}
