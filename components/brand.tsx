import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Vellumridge Technology home">
      <span className="brand-mark" aria-hidden>
        v
      </span>
      <span>
        Vellumridge<span className="brand-subtitle">TECHNOLOGY</span>
      </span>
    </Link>
  );
}
