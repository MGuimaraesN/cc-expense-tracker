import React from 'react';

const Input = React.forwardRef(({ value, onClick, className, ...props }, ref) => (
  <input
    value={value}
    onClick={onClick}
    ref={ref}
    className={`w-full pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:border-gray-600 dark:text-white ${className}`}
    {...props}
  />
));

export default Input;
