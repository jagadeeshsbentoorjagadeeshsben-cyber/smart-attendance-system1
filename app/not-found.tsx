import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-[#050B18] px-4">
      <div className="text-center max-w-md p-6 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0B132B] shadow-sm">
        <h1 className="text-4xl font-extrabold text-[#002147] dark:text-white">404</h1>
        <h2 className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          The requested page could not be located in GMIT Smart Attendance.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-[#002147] px-4 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-[#002147]/90"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
