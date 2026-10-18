import { useCallback, useEffect, useMemo, useState } from "react";
import Doctor from "./Doctor";
import {
  START,
  MESSAGE_START,
  END,
  MESSAGES,
  MESSAGE_COUNT,
  MESSAGE_INTERVAL_DAYS,
  TIME_ZONE,
  CHECKLIST,
} from "./config";
import "./App.css";

const DAY = 864e5;
const pad = (n) => String(n).padStart(2, "0");
const trackPos = (p) => 8 + p * 78;
const readStore = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
};
const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage can be disabled; keep the in-memory interaction working. */
  }
};

function localMidnightAfter(start, dayOffset, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
    .formatToParts(start)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  const calendarDay = new Date(
    Date.UTC(+parts.year, +parts.month - 1, +parts.day + dayOffset),
  );
  const year = calendarDay.getUTCFullYear();
  const month = calendarDay.getUTCMonth() + 1;
  const day = calendarDay.getUTCDate();
  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  const zoneName =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
      .formatToParts(noonUtc)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = zoneName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offsetMinutes = match
    ? (match[1] === "-" ? -1 : 1) * (+match[2] * 60 + +(match[3] ?? 0))
    : 0;
  return new Date(Date.UTC(year, month - 1, day) - offsetMinutes * 60_000);
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function dateLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function wasIntroSeen() {
  try {
    return localStorage.getItem("taseal-intro-seen") === "true";
  } catch {
    return false;
  }
}

function QuestIntro({ onFinish }) {
  const [phase, setPhase] = useState("title");
  const continueStory = () => {
    if (phase === "title") setPhase("meet");
    else if (phase === "meet") setPhase("journey");
    else onFinish();
  };

  return (
    <section className={`quest-intro intro-${phase}`} aria-label="Quest story">
      <div className="intro-stars" aria-hidden="true">
        ✦　 ·　 ✧　　 ✦
      </div>
      {phase === "title" && (
        <div className="intro-title story-fade" aria-live="polite">
          <p>Welcome to..</p>
          <h1>
            Dr. Taseal's
            <br />
            <em>7 week Quest</em>
          </h1>
          <span className="intro-prompt">PRESS CONTINUE TO BEGIN</span>
        </div>
      )}
      {phase === "meet" && (
        <div className="intro-meet story-fade" aria-live="polite">
          <div className="intro-character">
            <Doctor />
          </div>
          <p className="intro-kicker">MEET YOUR HERO</p>
          <h2>Dr. Taseal</h2>
          <p>
            One dedicated doctor.
            <br />
            Seven weeks of shifts.
            <br />
            One well-earned break ahead.
          </p>
        </div>
      )}
      {phase === "journey" && (
        <div className="intro-journey story-fade" aria-live="polite">
          <p className="intro-kicker">THE QUEST BEGINS</p>
          <h2>
            One more shift
            <br />
            closer to the break.
          </h2>
          <div className="intro-landscape" aria-hidden="true">
            <div className="intro-hospital">
              <span className="hospital-cross">+</span>
              <span className="hospital-door" />
            </div>
            <div className="intro-road" />
            <div className="intro-walker">
              <Doctor />
            </div>
          </div>
          <p className="intro-caption">Heading to the hospital…</p>
        </div>
      )}
      <div className="intro-actions">
        <button className="intro-skip" onClick={onFinish}>
          SKIP STORY
        </button>
        <button className="intro-continue" onClick={continueStory}>
          {phase === "journey" ? "START QUEST" : "CONTINUE"} <span>›</span>
        </button>
      </div>
    </section>
  );
}

export default function App() {
  const now = useNow();
  const [showIntro, setShowIntro] = useState(
    () =>
      new URLSearchParams(window.location.search).get("intro") === "1" ||
      !wasIntroSeen(),
  );
  const [view, setView] = useState("inbox");
  const [selected, setSelected] = useState(null);
  const [letterRevealed, setLetterRevealed] = useState(false);
  const [read, setRead] = useState(() => readStore("taseal-read", []));
  const [checked, setChecked] = useState(() =>
    readStore("taseal-checklist", []),
  );
  const total = END - START;
  const p = Math.max(0, Math.min((now - START) / total, 1));
  const left = Math.max(0, END - now);
  const done = now >= END;
  const messageUnlocks = useMemo(
    () =>
      Array.from({ length: MESSAGE_COUNT }, (_, i) =>
        localMidnightAfter(MESSAGE_START, i * MESSAGE_INTERVAL_DAYS, TIME_ZONE),
      ),
    [],
  );
  const arrivedMessages = messageUnlocks.flatMap((unlock, i) =>
    now >= unlock && MESSAGES[i]?.trim() ? [i] : [],
  );
  const unopenedMessages = arrivedMessages.filter((i) => !read.includes(i));
  const savedMessages = arrivedMessages.filter((i) => read.includes(i));
  const unread = unopenedMessages.length;
  const nextMessage = messageUnlocks.findIndex(
    (unlock, i) => unlock > now && Boolean(MESSAGES[i]?.trim()),
  );
  const nextArrival =
    nextMessage >= 0 ? dateLabel(messageUnlocks[nextMessage]) : null;

  function markRead(i) {
    const next = [...new Set([...read, i])];
    setRead(next);
    writeStore("taseal-read", next);
  }
  function openIncomingLetter(i) {
    setSelected(i);
    setLetterRevealed(false);
  }
  function openSavedLetter(i) {
    setSelected(i);
    setLetterRevealed(true);
  }
  function closeLetter() {
    setSelected(null);
    setLetterRevealed(false);
  }
  function revealLetter() {
    if (selected === null) return;
    setLetterRevealed(true);
    markRead(selected);
  }
  useEffect(() => {
    if (selected === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLetter();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  function toggleItem(item) {
    const next = checked.includes(item)
      ? checked.filter((x) => x !== item)
      : [...checked, item];
    setChecked(next);
    writeStore("taseal-checklist", next);
  }

  const finishIntro = useCallback(() => {
    try {
      localStorage.setItem("taseal-intro-seen", "true");
    } catch {
      /* Intro still completes when storage is unavailable. */
    }
    setShowIntro(false);
  }, []);

  if (showIntro) return <QuestIntro onFinish={finishIntro} />;

  return (
    <main>
      <header className="hero">
        <div className="eyebrow">
          <span className="pulse" /> Lyana tries coding
        </div>
        <h1>
          DR. TASEAL'S
          <br />
          <em>SURVIVAL QUEST</em>
        </h1>

        <div className="how-to">
          <span>▶ HOW TO PLAY</span> A new note from Lyana unlocks every 2 days.
          Read it in your inbox (in the message centre). Oh also, theres a
          survival kit of all the things you like. I'm rooting for you.
        </div>
      </header>

      <section className="panel journey">
        <div className="section-head">
          <div>
            <small>THE LONG ROAD HOME</small>
            <h2>{done ? "QUEST COMPLETE" : "BREAK INCOMING"}</h2>
          </div>
          <b className="percent">
            {Math.floor(p * 100)}
            <small>%</small>
          </b>
        </div>
        <div className="scene">
          <div className="moon" />
          <div className="stars">✦　 ·　 ✧　　 ✦</div>
          <div className="pixel-cloud cloud-one" aria-hidden="true" />
          <div className="pixel-cloud cloud-two" aria-hidden="true" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road" />
          <div className="finish"></div>
          <div className="milestone m1">✦</div>
          <div className="milestone m2">✦</div>
          <div className="milestone m3">✦</div>
          <div className="traveler" style={{ left: `${trackPos(p)}%` }}>
            <Doctor />
            <span className="traveler-shadow" />
          </div>
          <span className="scene-label start-label">ON DUTY</span>
          <span className="scene-label end-label">OFF DUTY</span>
        </div>
        <div className="progress-track">
          <i style={{ width: `${p * 100}%` }} />
        </div>
        <div className="journey-foot">
          <span>🩺 KEEP GOING, DOC</span>
          <span>{dateLabel(END)} • PICKLESBURGH TIME </span>
        </div>
      </section>

      <section className="panel countdown">
        <div className="section-head">
          <div>
            <small>UNTIL THE LAST SHIFT ENDS</small>
            <h2>SHIFT COUNTDOWN</h2>
          </div>
          <span className="timezone">EDT / EST PICKLESBURG</span>
        </div>
        <div className="timer">
          {[
            [Math.floor(left / DAY), "DAYS"],
            [pad(Math.floor((left % DAY) / 36e5)), "HOURS"],
            [pad(Math.floor((left % 36e5) / 6e4)), "MINUTES"],
            [pad(Math.floor((left % 6e4) / 1e3)), "SECONDS"],
          ].map(([n, label]) => (
            <div className="time-card" key={label}>
              <b>{n}</b>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="date-note">You can do it!</div>
      </section>

      <section className="panel messages-panel">
        <div className="section-head">
          <div>
            <small>
              Check in every other day (or randomly whenever Lyana remembers)
            </small>
            <h2>MESSAGE CENTER</h2>
          </div>
          <span className="unread-count">{unread} NEW</span>
        </div>
        <div className="message-layout">
          <nav className="message-nav" aria-label="Message folders">
            <button
              className={view === "inbox" ? "nav-active" : ""}
              onClick={() => setView("inbox")}
            >
              ✉ Inbox <b>{unread}</b>
            </button>
            <button
              className={view === "vault" ? "nav-active" : ""}
              onClick={() => setView("vault")}
            >
              ▣ Message vault
            </button>
          </nav>
          {view === "inbox" ? (
            <div className="inbox-view">
              <div className="inbox-banner">
                <span className="inbox-banner-icon">✉</span>
                <span>
                  <b>{unread ? "NEW LETTER HAS ARRIVED" : "LYANA'S INBOX"}</b>
                  <small>
                    {unread
                      ? `${unread} sealed ${unread === 1 ? "letter" : "letters"} waiting to be opened`
                      : "New letters appear here on their unlock day."}
                  </small>
                </span>
                <span className="inbox-new-count">{unread} NEW</span>
              </div>
              {unopenedMessages.length ? (
                <div className="drop-list inbox-list">
                  {unopenedMessages
                    .slice()
                    .reverse()
                    .map((i) => (
                      <article className="incoming-letter" key={i}>
                        <div className="incoming-seal" aria-hidden="true">
                          ✉
                        </div>
                        <div className="incoming-details">
                          <small>
                            FROM LYANA · DROP {String(i + 1).padStart(2, "0")}
                          </small>
                          <b>You've got mail!</b>
                          <span>Arrived {dateLabel(messageUnlocks[i])}</span>
                        </div>
                        <button
                          className="open-letter-button"
                          onClick={() => openIncomingLetter(i)}
                        >
                          OPEN LETTER <span>›</span>
                        </button>
                      </article>
                    ))}
                </div>
              ) : (
                <article className="inbox-empty">
                  <span className="empty-mail-icon" aria-hidden="true">
                    ✉
                  </span>
                  <h3>NO NEW LETTERS</h3>
                  <p>
                    {nextArrival
                      ? `Your next letter arrives ${nextArrival}.`
                      : "Lyana has no more letters scheduled yet."}
                  </p>
                  <small>
                    Opened letters are kept safe in the Message Vault.
                  </small>
                </article>
              )}
            </div>
          ) : (
            <div className="vault">
              <div className="vault-title">
                THE MESSAGE VAULT
                <small>
                  {savedMessages.length} OPENED{" "}
                  {savedMessages.length === 1 ? "LETTER" : "LETTERS"}
                </small>
              </div>
              <p className="vault-copy">
                Letters you opened, saved here to read again.
              </p>
              {savedMessages.length ? (
                <div className="vault-grid">
                  {savedMessages
                    .slice()
                    .reverse()
                    .map((i) => (
                      <button
                        key={i}
                        onClick={() => openSavedLetter(i)}
                        className="vault-card"
                      >
                        <span className="vault-envelope">✉</span>
                        <b>FROM LYANA · {String(i + 1).padStart(2, "0")}</b>
                        <small>OPEN LETTER AGAIN</small>
                        <time>{dateLabel(messageUnlocks[i])}</time>
                      </button>
                    ))}
                </div>
              ) : (
                <div className="vault-empty">
                  <span aria-hidden="true">▣</span>
                  <b>YOUR VAULT IS WAITING</b>
                  <p>
                    Open a letter from your inbox and it will be saved here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="panel checklist-panel">
        <div className="section-head">
          <div>
            <h2>TASEAL SURVIVAL KIT</h2>
          </div>
          <span className="kit-progress">
            {checked.length} / {CHECKLIST.length} PACKED
          </span>
        </div>
        <div className="checklist">
          {CHECKLIST.map((item, i) => (
            <label
              className={`check-item ${checked.includes(item) ? "packed" : ""}`}
              key={item}
            >
              <input
                type="checkbox"
                checked={checked.includes(item)}
                onChange={() => toggleItem(item)}
              />
              <span className="checkmark">
                {checked.includes(item) ? "✓" : ""}
              </span>
              <span className="item-icon">
                {["🧵", "🍗", "🍜", "🫖", "🥤", "🧦", "⌚", "🛌"][i]}
              </span>
              <span>{item}</span>
            </label>
          ))}
        </div>
        <p className="kit-note">
          A well-prepared doctor is a slightly less hungry doctor... so please
          eat..
        </p>
      </section>

      <footer>lyana tries coding and she hopes it turns out good</footer>

      <button
        className={`message-mascot ${unread ? "has-message" : ""}`}
        onClick={() => {
          setView("inbox");
          document
            .querySelector(".messages-panel")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        aria-label="Open new message"
      >
        <span className="mascot-bubble">
          {unread
            ? "A new letter has arrived! Check your inbox 💌"
            : nextArrival
              ? `Next letter arrives ${nextArrival} 💌`
              : "Your message vault is ready 💌"}
        </span>
        <span className="mascot-face">✉</span>
        <span className="mascot-spark">✦</span>
      </button>

      {selected !== null && (
        <div className="letter-backdrop" onClick={closeLetter}>
          <section
            className={`letter-modal ${letterRevealed ? "letter-modal-open" : "letter-modal-sealed"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="letter-modal-close"
              onClick={closeLetter}
              aria-label="Close letter"
            >
              ×
            </button>
            {!letterRevealed ? (
              <div className="sealed-letter-content">
                <div className="letter-sender">
                  <small>A LETTER FOR YOU</small>
                  <b>FROM LYANA</b>
                </div>
                <div className="sealed-envelope" aria-hidden="true">
                  <span>✉</span>
                  <i>♥</i>
                </div>
                <h2 id="letter-modal-title">A new letter has arrived</h2>
                <p>Press below to open it and read Lyana's note.</p>
                <button
                  className="open-letter-button open-letter-primary"
                  onClick={revealLetter}
                >
                  OPEN LETTER <span>›</span>
                </button>
              </div>
            ) : (
              <div className="revealed-letter-content">
                <div className="letter-sender opened-sender">
                  <small>
                    PERSONAL LETTER · DROP{" "}
                    {String(selected + 1).padStart(2, "0")}
                  </small>
                  <b>FROM LYANA</b>
                  <time>{dateLabel(messageUnlocks[selected])}</time>
                </div>
                <article className="opened-letter-paper">
                  <div className="opened-letter-title">
                    <span>✦</span>
                    <h2 id="letter-modal-title">A NOTE FOR YOU</h2>
                    <span>✦</span>
                  </div>
                  <p>{MESSAGES[selected]}</p>
                  <div className="signature">
                    Always in your corner,
                    <br />
                    <strong>LF🌻</strong>
                  </div>
                </article>
                <div className="saved-confirmation">
                  ✓ SAVED IN THE MESSAGE VAULT
                </div>
                <button className="close-letter-button" onClick={closeLetter}>
                  CLOSE LETTER
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
