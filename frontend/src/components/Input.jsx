export default function Input({ className, ...props }) {
  return (
    <input
      {...props}
      className={`bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-800 dark:text-white rounded px-2 py-1 w-full ${className}`}
    />
  );
}
