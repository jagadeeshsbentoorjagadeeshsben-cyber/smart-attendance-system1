"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#050B18] px-4 font-sans">
        <div className="text-center max-w-md p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0B132B] shadow-sm">
          <h1 className="text-3xl font-extrabold text-[#002147] dark:text-white">500</h1>
          <h2 className="mt-2 text-base font-semibold text-gray-800 dark:text-gray-200">
            Application Error
          </h2>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 inline-block rounded-md bg-[#002147] px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-[#002147]/90"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
