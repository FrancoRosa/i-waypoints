const Button = ({ children, ...props }) => {
  return (
    <button
      className="hover:bg-slate-200 border border-slate-500 hover:border-slate-400 rounded px-2 py-1 text-sm "
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
