"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="bg-aurora flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl text-cream">Something went wrong</h1>
      <p className="mt-3 text-muted">An unexpected error occurred. Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-gold-light"
      >
        Try again
      </button>
    </div>
  );
}
