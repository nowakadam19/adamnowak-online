// Chat modes served by /api/chat. A request without `mode` is Eva.
import { eva } from "./eva"
import { tierPlanner } from "./tier-planner"
import type { ChatModeDefinition } from "./types"

export const CHAT_MODES = {
  eva,
  "tier-planner": tierPlanner,
} satisfies Record<string, ChatModeDefinition>

export type ChatMode = keyof typeof CHAT_MODES

export function isChatMode(value: unknown): value is ChatMode {
  return typeof value === "string" && Object.hasOwn(CHAT_MODES, value)
}
