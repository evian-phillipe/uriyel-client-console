export default function SectionHeader({ eyebrow, title, children }) {
  return (
    <header className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children ? <p className="section-description">{children}</p> : null}
    </header>
  );
}
