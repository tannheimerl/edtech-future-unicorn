import { Mail } from "lucide-react"

const RECIPIENTS = "ramanantsoaluc@gmail.com,lukas.tannheimer@bluewin.ch"
const SUBJECT = "Lezio Feedback"
const BODY = `Aufgabe / Workflow:
(Was wolltest du in der App tun?)

Problem:
(Was hat nicht funktioniert / war unklar?)

Lösungs- / Verbesserungsvorschlag:
(Wie könnte es besser sein?)
`

const mailtoHref = `mailto:${RECIPIENTS}?subject=${encodeURIComponent(
  SUBJECT,
)}&body=${encodeURIComponent(BODY)}`

export function FeedbackButton() {
  return (
    <a
      href={mailtoHref}
      aria-label="Feedback geben"
      title="Feedback geben"
      className="fixed bottom-6 right-[max(1rem,calc((100vw-80rem)/2-3rem))] z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/85"
    >
      <Mail className="size-5" />
    </a>
  )
}
