"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle
            size={32}
            className="text-red-500"
          />
        </div>

        <p className="mt-6 text-sm font-semibold text-blue-600">
          Instant Mechanic
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          We encountered an unexpected error while
          loading this page. Please try again.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

        </div>

        {error?.digest && (
          <p className="mt-6 text-xs text-slate-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}