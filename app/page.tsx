import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Compass,
  LockKeyhole,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { SearchButton } from "@/components/search";
import { departments } from "@/lib/company";
import { getEmployees } from "@/lib/people";
import { getPages } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [pages, people] = await Promise.all([getPages(), getEmployees()]);
  return (
    <>
      <header className="home-nav">
        <Brand />
        <nav>
          <Link className="active" href="/">
            Home
          </Link>
          <Link href="/docs">Knowledge base</Link>
          <Link href="/docs/team">Our people</Link>
        </nav>
        <form action="/api/logout" method="post">
          <button className="lock-button">
            <LockKeyhole size={14} /> Lock site
          </button>
        </form>
      </header>
      <main className="home-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              THE VELLUMRIDGE HANDBOOK
            </span>
            <h1>
              Good work starts
              <br />
              with shared knowledge.
            </h1>
            <p>
              How we build, how we work, and what we believe.
              <br className="desktop-break" /> A little less searching. A lot
              more getting things done.
            </p>
            <SearchButton large />
            <div className="hero-hint">
              Policies, playbooks, and the answers you need.
            </div>
          </div>
          <aside className="company-note">
            <div className="note-top">
              <span className="eyebrow">A NOTE ABOUT US</span>
              <Compass size={23} strokeWidth={1.2} />
            </div>
            <h2>
              Less admin.
              <br />
              More fieldwork.
            </h2>
            <p>
              We build Fieldbook, scheduling and service software for teams that
              maintain renewable energy sites.
            </p>
            <div className="note-facts">
              <div>
                <strong>{people.length}</strong>
                <span>people</span>
              </div>
              <div>
                <strong>6</strong>
                <span>departments</span>
              </div>
            </div>
            <Link href="/docs/team">
              Meet the team <ArrowUpRight size={17} />
            </Link>
          </aside>
        </section>
        <section className="start-strip">
          <div className="start-icon">
            <BookOpen size={21} />
          </div>
          <div>
            <strong>First week here?</strong>
            <p>Start with the essentials. We’ll help you find your feet.</p>
          </div>
          <Link href="/docs/people/first-week">
            Your first week <ArrowRight size={17} />
          </Link>
        </section>
        <section className="department-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR WAY</span>
              <h2>Knowledge by department</h2>
            </div>
            <span className="section-count">
              {pages.length} useful pages. One place.
            </span>
          </div>
          <div className="department-grid">
            {departments.map((department, i) => {
              const documents = pages
                .filter((p) => p.department === department.slug)
                .sort((a, b) => a.order - b.order);
              return (
                <Link
                  href={
                    documents.length ? `/docs/${documents[0].slug}` : "/docs"
                  }
                  key={department.slug}
                  className="department-card"
                >
                  <div className="department-card-top">
                    <department.icon size={23} strokeWidth={1.5} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{department.name}</h3>
                  <p>{department.description}</p>
                  <div className="department-card-bottom">
                    <span>{documents.length} guides</span>
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="quick-links">
          <div>
            <span className="eyebrow">GOOD TO HAVE HANDY</span>
            <h2>The everyday essentials</h2>
          </div>
          <div>
            <Link href="/docs/operations/travel-expenses">
              Back from a client trip <ArrowRight size={17} />
            </Link>
            <Link href="/docs/engineering/incident-response">
              Something’s gone wrong <ArrowRight size={17} />
            </Link>
            <Link href="/docs/people/remote-work">
              Working from somewhere else <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="home-footer">
        <span>Vellumridge Technology</span>
        <span>A fictional company for a real working demo.</span>
        <Link href="/docs">
          Open the handbook <ArrowUpRight size={14} />
        </Link>
      </footer>
    </>
  );
}
