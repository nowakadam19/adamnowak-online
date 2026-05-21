interface ToolCardProps {
  title: string
  description: string
  href: string
  cta?: string
}

export function ToolCard({ title, description, href, cta = "Open calculator →" }: ToolCardProps) {
  return (
    <a
      href={href}
      className="block no-underline my-8 p-5 rounded-lg border transition-colors hover:border-green-700"
      style={{
        borderColor: "rgba(10,10,8,0.15)",
        background: "#f5f5f0",
        textDecoration: "none",
      }}
    >
      <div
        className="text-[10px] tracking-[0.14em] uppercase mb-2"
        style={{ color: "#4CAF7D", fontFamily: "Syne, sans-serif" }}
      >
        Tool
      </div>
      <div
        className="text-[1.1rem] font-medium mb-1"
        style={{ color: "#0A0A08", fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </div>
      <div
        className="text-[13px] mb-3"
        style={{ color: "#6b6b68", fontFamily: "Inter, sans-serif" }}
      >
        {description}
      </div>
      <div
        className="text-[12px] font-medium"
        style={{ color: "#1E4530", fontFamily: "Syne, sans-serif" }}
      >
        {cta}
      </div>
    </a>
  )
}
