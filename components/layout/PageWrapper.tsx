interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function PageWrapper({ title, subtitle, action, children, noPadding }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-surface)" }}>
      <div style={{
        padding: "28px 40px 22px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        background: "var(--bg-surface)",
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            DevKit
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: noPadding ? 0 : "32px 40px", background: "var(--bg-surface)" }}>
        {children}
      </div>
    </div>
  );
}