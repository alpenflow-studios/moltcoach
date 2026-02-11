"use client";

export default function SubscribeError() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Unable to load the subscription page. Please try again.
      </p>
    </div>
  );
}
