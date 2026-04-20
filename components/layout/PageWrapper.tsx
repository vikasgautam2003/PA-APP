interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageWrapper({ title, subtitle, action, children }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px 16px",
        borderBottom: "1px solid #f0f0f0",
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{subtitle}</p>
          )}
        </div>
        {action}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
        {children}
      </div>
    </div>
  );
}