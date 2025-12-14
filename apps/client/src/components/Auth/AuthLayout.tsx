export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            MOSE
          </h1>
          {title && (
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          )}
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>

        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-lg bg-opacity-90">
          {children}
        </div>
      </div>
    </div>
  );
}
