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
      {/* Header */}
      <div style={{
        padding: "24px 40px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: 11, fontWeight: 600,
            color: "var(--accent)", letterSpacing: "0.07em",
            textTransform: "uppercase", marginBottom: 4,
          }}>
            Ares
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: 13, color: "var(--text-muted)", marginTop: 4,
              lineHeight: 1.4,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0 }}>{action}</div>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: noPadding ? 0 : "28px 40px",
        background: "var(--bg-surface)",
      }}>
        {children}
      </div>
    </div>
  );
}
