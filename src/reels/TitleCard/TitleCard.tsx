import './TitleCard.css'

const GITHUB = 'https://github.com/vishwakvel'
const LINKEDIN = 'https://linkedin.com/in/vishwakv'

/** Reel 01 — the title card projected into the frame on load. */
export default function TitleCard() {
  return (
    <div className="titlecard-reel" data-reel-content="landing">
      <div className="titlecard" data-titlecard>
        <h1>
          <span>Vishwak</span>
          <span>Velamuri</span>
        </h1>
        <div className="titlecard__rule" />
      </div>

      <nav className="leader" aria-label="Elsewhere">
        <a href={GITHUB} target="_blank" rel="noreferrer">
          GITHUB<i aria-hidden="true">↗</i>
        </a>
        <span className="leader__sep" aria-hidden="true">/</span>
        <a href={LINKEDIN} target="_blank" rel="noreferrer">
          LINKEDIN<i aria-hidden="true">↗</i>
        </a>
      </nav>
    </div>
  )
}
