export default function Template({ children }: { children: React.ReactNode }) {
  // Remounts on every navigation → replays the entrance animation.
  return <div className="gv-page-enter">{children}</div>;
}
