"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>We couldn’t load the handbook.</h1>
      <p>Check the Sanity connection and token, then try again.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
