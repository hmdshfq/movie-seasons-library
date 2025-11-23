export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="text-center py-12" role="status" aria-label={message}>
      <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  );
}
