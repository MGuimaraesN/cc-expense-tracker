export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded p-4 ${className}`}>
      {title && <h3 className="text-gray-800 dark:text-white/90 font-semibold mb-2">{title}</h3>}
      <div className="text-gray-600 dark:text-white/80">{children}</div>
    </div>
  );
}
