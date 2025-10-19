export default function Card({ title, children, className='' }) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded p-4 ${className}`}>
      {title && <h3 className="text-white/90 font-semibold mb-2">{title}</h3>}
      <div className="text-white/80">{children}</div>
    </div>
  )
}
