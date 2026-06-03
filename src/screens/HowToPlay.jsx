import { useEffect } from "react";
import "./HowToPlay.css";

export default function HowToPlay({ onBack }) {
  useEffect(() => {
    document.body.classList.add("scroll-mode");
    return () => document.body.classList.remove("scroll-mode");
  }, []);

  return (
    <div className="htp-screen ocean-bg">
      <div className="htp-content">
        <button className="btn-back" onClick={onBack}>
          ← Back
        </button>

        <h1 className="htp-title">How to Play</h1>
        <p className="htp-intro">
          Bug Blasters is a calm, no-fail educational game for clinicians and learners.
          There are no timers, no penalties, and no game-over screen. Your goal is
          mastery — and restoring a coral reef.
        </p>

        {/* The SEACHYMP Mnemonic */}
        <section className="htp-section">
          <h2>The SEACHYMP Organisms</h2>
          <p>
            <strong>SEACHYMP</strong> is a mnemonic for AmpC beta-lactamase–producing
            gram-negative organisms. These bacteria have the potential to develop
            resistance to 3rd-generation cephalosporins (like Ceftriaxone) via
            inducible or de-repressed AmpC enzymes.
          </p>
          <div className="htp-mnemonic-list">
            {[
              { letter: "S", org: "Serratia", risk: "low" },
              { letter: "E", org: "Enterobacter cloacae", risk: "HIGH" },
              { letter: "A", org: "Aeromonas", risk: "low" },
              { letter: "C", org: "Citrobacter freundii", risk: "HIGH" },
              { letter: "H", org: "Hafnia alvei", risk: "low" },
              { letter: "Y", org: "Yersinia enterocolitica", risk: "low" },
              { letter: "M", org: "Morganella morganii", risk: "low" },
              { letter: "P", org: "Providencia", risk: "low" },
            ].map(({ letter, org, risk }) => (
              <div key={letter} className="htp-mnemonic-row">
                <span className="htp-letter">{letter}</span>
                <span className="htp-org">{org}</span>
                <span className={risk === "HIGH" ? "risk-high" : "risk-low"}>
                  {risk === "HIGH" ? "HIGH RISK" : "LOW RISK"}
                </span>
              </div>
            ))}
          </div>
          <p className="htp-note">
            <strong>Bonus organism:</strong> Klebsiella aerogenes (formerly Enterobacter
            aerogenes) — also HIGH-risk AmpC. Watch for it!
          </p>
        </section>

        {/* Goal */}
        <section className="htp-section">
          <h2>Your Goal</h2>
          <p>
            Swim through the reef, <strong>identify SEACHYMP organisms</strong>, and
            <strong> leave non-targets alone</strong>. Good stewardship means treating
            what needs treating — and NOT treating what doesn&apos;t.
          </p>
          <p>
            Every correct identification (or correct ignore) contributes to restoring
            the coral reef. The reef grows from barren to thriving as you progress.
          </p>
        </section>

        {/* Controls */}
        <section className="htp-section">
          <h2>Controls</h2>
          <div className="htp-controls-grid">
            <div className="htp-control-block">
              <h3>Keyboard</h3>
              <ul>
                <li><kbd>Arrow keys</kbd> or <kbd>W A S D</kbd> — swim</li>
                <li><kbd>Space</kbd> or <kbd>E</kbd> — capture nearby organism</li>
                <li><kbd>Esc</kbd> — close info card / menu</li>
              </ul>
            </div>
            <div className="htp-control-block">
              <h3>Touch / Mouse</h3>
              <ul>
                <li><strong>Drag</strong> on the ocean — swim toward drag direction</li>
                <li><strong>Tap / Click</strong> an organism — capture it</li>
                <li>Tap the <strong>× button</strong> — close info card</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Capture & Info Card */}
        <section className="htp-section">
          <h2>Capture &amp; Identify</h2>
          <p>
            When you capture an organism, an <strong>info card</strong> appears showing:
          </p>
          <ul className="htp-ul">
            <li>The organism&apos;s name, species, and visual</li>
            <li>Its AmpC risk tier (HIGH or LOW)</li>
            <li>A brief description</li>
          </ul>
          <p>
            Choose <strong>&quot;Yes — SEACHYMP target&quot;</strong> or{" "}
            <strong>&quot;No — leave it alone&quot;</strong>.
            Correct answers add the organism to your Encyclopedia and nudge the reef forward.
          </p>
        </section>

        {/* HIGH vs LOW risk */}
        <section className="htp-section htp-section--risk">
          <h2>High-Risk vs Low-Risk AmpC</h2>
          <p>
            Not all SEACHYMP organisms carry the same risk. The key clinical rule:
          </p>
          <div className="htp-rule-box htp-rule-high">
            <strong>HIGH-RISK AmpC</strong>
            <br />
            Enterobacter cloacae, Citrobacter freundii, Klebsiella aerogenes
            <br />
            <span>Prefer <strong>Cefepime</strong> (4th-gen) over 3rd-gen cephalosporins for serious infections</span>
          </div>
          <div className="htp-rule-box htp-rule-low">
            <strong>LOW-RISK AmpC</strong>
            <br />
            Serratia, Aeromonas, Hafnia, Yersinia, Morganella, Providencia
            <br />
            <span><strong>Ceftriaxone</strong> is often acceptable, but context matters (infection type, source control, duration)</span>
          </div>
        </section>

        {/* Mutation warning */}
        <section className="htp-section htp-section--mutation">
          <h2>The Mutation Warning</h2>
          <p>
            If you repeatedly <strong>mishandle a HIGH-risk organism</strong> (mis-identify it,
            or in later levels apply an inappropriate antibiotic), that organism can
            <strong> adapt</strong>. You will see a red banner:
          </p>
          <div className="htp-mutation-demo">
            The organism has adapted. Resistance selected!
          </div>
          <p>
            In mutated form, Ceftriaxone, TMP-SMX, and fluoroquinolones are flagged
            ineffective. You must switch to <strong>Cefepime or a carbapenem</strong>.
            This is not a penalty — it is a teaching moment.
          </p>
        </section>

        {/* Badges */}
        <section className="htp-section">
          <h2>Badges &amp; Reef Progress</h2>
          <p>
            Earn badges by reaching milestones: your first SEACHYMP capture, correctly
            recognizing a HIGH-risk organism, completing the full SEACHYMP set, and more.
            Watch the reef transform from barren rock to a thriving ecosystem.
          </p>
        </section>

        <div className="htp-actions">
          <button className="btn-primary" onClick={onBack}>
            Got it — let&apos;s dive in!
          </button>
        </div>
      </div>
    </div>
  );
}
