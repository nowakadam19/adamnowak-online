"use client"

interface Tool {
  title: string
  description: string
  href?: string
  comingSoon?: boolean
}

interface ToolboxProps {
  pillar: string
  tools?: Tool[]
  toolsJson?: string
}

export function Toolbox({ pillar, tools = [], toolsJson }: ToolboxProps) {
  const parsedTools: Tool[] = toolsJson ? JSON.parse(toolsJson) : tools

  return (
    <div
      className="my-10 rounded-xl p-6"
      style={{ background: "#1E4530" }}
    >
      <div className="flex items-center gap-3 mb-5">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
          <rect x="1" y="6" width="14" height="9" rx="1.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
          <path d="M5 6V4.5a3 3 0 0 1 6 0V6" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M1 9.5h14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
        </svg>
        <div>
          <div
            className="text-[10px] tracking-[0.16em] uppercase"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Syne, sans-serif" }}
          >
            Toolbox · {pillar}
          </div>
          <div
            className="text-[13px]"
            style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif" }}
          >
            Tools for this pillar
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {parsedTools.map((tool) => (
          tool.comingSoon ? (
            <div
              key={tool.title}
              className="rounded-lg p-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif" }}
                  >
                    {tool.title}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}
                  >
                    {tool.description}
                  </div>
                </div>
                <span
                  className="text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)", fontFamily: "Syne, sans-serif" }}
                >
                  Soon
                </span>
              </div>
            </div>
          ) : (
            <a
              key={tool.title}
              href={tool.href}
              className="rounded-lg p-4 transition-all no-underline"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.16)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            >
              <div
                className="text-[13px] font-medium mb-1"
                style={{ color: "#fff", fontFamily: "Inter, sans-serif" }}
              >
                {tool.title}
              </div>
              <div
                className="text-[11px] mb-3"
                style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter, sans-serif" }}
              >
                {tool.description}
              </div>
              <div
                className="text-[11px]"
                style={{ color: "#4CAF7D", fontFamily: "Syne, sans-serif" }}
              >
                Open tool →
              </div>
            </a>
          )
        ))}
      </div>
    </div>
  )
}
