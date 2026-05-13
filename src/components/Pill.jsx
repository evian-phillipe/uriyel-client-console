const tones = {
  neutral: 'pill pill-neutral',
  good: 'pill pill-good',
  warn: 'pill pill-warn',
  bad: 'pill pill-bad',
};

export default function Pill({ children, tone = 'neutral' }) {
  return <span className={tones[tone] || tones.neutral}>{children}</span>;
}
