import React from 'react';

const Select = React.forwardRef(({ children, ...props }, ref) => (
  <select
    {...props}
    ref={ref}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  >
    {children}
  </select>
));

export default Select;
