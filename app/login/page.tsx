import { LockKeyhole, ArrowRight } from "lucide-react";
import { Brand } from "@/components/brand";

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card">
        <Brand />
        <div className="login-kicker">
          <span className="login-icon" aria-hidden>
            <LockKeyhole size={18} strokeWidth={1.5} />
          </span>
          <span className="eyebrow">OUR SHARED SPACE</span>
        </div>
        <h1>
          Welcome to
          <br />
          the handbook.
        </h1>
        <p>
          Enter the team password to open Vellumridge’s company knowledge base.
        </p>
        <form action="/api/unlock" method="post">
          <label htmlFor="password">Team password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
            maxLength={512}
            placeholder="Enter your password"
          />
          {error && (
            <p role="alert" className="login-error">
              That password didn’t match. Try again.
            </p>
          )}
          <button type="submit">
            Open the handbook <ArrowRight size={18} />
          </button>
        </form>
        <span className="login-footnote">
          A fictional company. A shared place to learn.
        </span>
      </div>
    </main>
  );
}
