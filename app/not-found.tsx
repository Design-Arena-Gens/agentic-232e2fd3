export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-center text-slate-300">
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
    </div>
  );
}
