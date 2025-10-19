export default function Button({ children, className='', ...props }) {
  return (
    <button
      className={`px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
