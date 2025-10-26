export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg p-6 shadow-lg ${className}`}>
      {title && <h3 className="text-gray-800 dark:text-white/90 font-semibold mb-4">{title}</h3>}
      <div className="text-gray-600 dark:text-white/80">{children}</div>
    </div>
  );
}
