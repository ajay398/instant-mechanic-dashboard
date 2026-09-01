import {
  Loader2,
} from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center justify-center text-center">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-slate-800">
          Loading Dashboard
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Please wait while we load your operations data.
        </p>

      </div>
    </main>
  );
}