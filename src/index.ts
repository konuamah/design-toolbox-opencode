import { type Plugin, type Hooks } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin/tool"
import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILL_DIR = join(__dirname, "..", "skills", "impeccable")
const SCRIPTS_DIR = join(SKILL_DIR, "scripts")

const UI_FILE_PATTERN = /\.(html?|css|jsx|tsx|vue|svelte|astro)$/i

function runDetector(filePath: string): string | null {
  const detectPath = join(SCRIPTS_DIR, "detect.mjs")
  if (!existsSync(detectPath)) return null
  if (!filePath.match(UI_FILE_PATTERN)) return null
  if (!existsSync(filePath)) return null

  try {
    return execSync(`node "${detectPath}" --json "${filePath}"`, {
      encoding: "utf8",
      timeout: 15_000,
      windowsHide: true,
    }).trim()
  } catch {
    return null
  }
}

function runTasteChecks(content: string, filePath: string): string | null {
  const issues: string[] = []

  // Em-dash ban
  if (/—/g.test(content)) {
    issues.push("Em-dashes found — prefer spaced en-dash or hyphen")
  }

  // Lorem ipsum placeholder
  if (/lorem ipsum/i.test(content)) {
    issues.push("'Lorem ipsum' placeholder text — use real or representative copy")
  }

  // Gray text on colored backgrounds (low contrast)
  if (/color:\s*(#888|#999|#aaa|gray|grey)/i.test(content)) {
    issues.push("Low-contrast gray text — bump contrast for readability")
  }

  // Fixed font sizes below 12px
  if (/font-size:\s*1[0-1]px/i.test(content)) {
    issues.push("Font size ≤11px — too small for readability, use ≥14px for body")
  }

  if (issues.length === 0) return null
  const fileName = filePath.split(/[\\/]/).pop() ?? filePath
  return `👅 Taste issues in ${fileName}:\n${issues.map((i) => `• ${i}`).join("\n")}`
}

const statusTool = tool({
  description: "Check if the Design Toolbox plugin is loaded and active, and list available design skills",
  args: {} as const,
  execute: async () => {
    return {
      title: "Design Toolbox Status",
      output: [
        "🎨 Design Toolbox plugin is loaded!",
        "",
        "━━━ Product Design — Strategy to Surface (new) ━━━━━",
        `  • layers-intro — framework orientation (load first)`,
        `  • layers-orient — diagnostic audit across all 7 layers`,
        `  • layers-observed-behaviour — job stories from user observation`,
        `  • layers-domain — concept maps, terminology, noun harvest`,
        `  • layers-user-needs — prioritised needs, pains, desires`,
        `  • layers-product-strategy — Opportunity Solution Tree`,
        `  • layers-conceptual-model — object maps, state diagrams`,
        `  • layers-interaction-flow — breadboard with edge cases`,
        `  • layers-surface — audit findings, surface decisions`,
        "",
        "━━━ Design Taste — Anti-Slop Prevention (ACTIVE) ━━━━━",
        `  • taste-skill — 3 dials: VARIANCE / MOTION / DENSITY`,
        `  • taste-variants — generate 3 parallel design variants for comparison`,
        `  • taste-soft — polished, calm, high-end visual design`,
        `  • taste-minimalist — editorial product UI (Notion/Linear vibes)`,
        `  • taste-brutalist — industrial, Swiss type, sharp contrast`,
        `  • taste-redesign — audit existing projects, fix layout/type/spacing`,
        `  • taste-output — enforce full output, no truncated code`,
        "",
        "━━━ Quality Detection — Anti-Pattern Enforcement ━━━━━",
        `  • impeccable (v${getSkillVersion()}) — 23 commands, 41 detector rules`,
        "",
        "Available commands (via /impeccable):",
        "  craft | shape | init | document | extract",
        "  critique | audit | polish",
        "  bolder | quieter | distill | harden | onboard",
        "  animate | colorize | typeset | layout | delight | overdrive",
        "  clarify | adapt | optimize | live",
        "",
        "Ready to design. What are you building?",
      ].join("\n"),
    }
  },
})

function getSkillVersion(): string {
  const skillPath = join(SKILL_DIR, "SKILL.md")
  if (!existsSync(skillPath)) return "?"
  try {
    const content = readFileSync(skillPath, "utf8")
    const match = content.match(/^version:\s*(.+)$/m)
    return match ? match[1].trim() : "?"
  } catch {
    return "?"
  }
}

const plugin: Plugin = async (_input, _options) => {
  const hooks: Hooks = {
    tool: {
      "design-toolbox-status": statusTool,
    },

    "tool.execute.before": async (_input, output) => {
      if (_input.tool !== "write" && _input.tool !== "edit") return
      const filePath: string | undefined = output.args?.filePath
      if (!filePath) return
      if (!filePath.match(UI_FILE_PATTERN)) return

      // Inject taste reminder into content before writing
      if (output.args.content && typeof output.args.content === "string") {
        const reminder = "<!-- taste: use real copy, clear hierarchy, no gray-on-color, no em-dashes, ≥44px touch targets, be opinionated -->"
        output.args.content = `${reminder}
${output.args.content}`
      }
    },

    "tool.execute.after": async (input, output) => {
      if (input.tool !== "write" && input.tool !== "edit") return
      const filePath: string | undefined = input.args?.filePath
      if (!filePath) return
      if (!filePath.match(UI_FILE_PATTERN)) return

      let content = ""
      try { content = readFileSync(filePath, "utf8") } catch { return }

      const additions: Record<string, unknown> = { ...output.metadata }

      // Impeccable detection
      const detectResult = runDetector(filePath)
      if (detectResult) additions.design_detector = detectResult

      // Taste checks
      const tasteResult = runTasteChecks(content, filePath)
      if (tasteResult) additions.taste_check = tasteResult

      if (Object.keys(additions).length > 0) {
        output.metadata = additions
      }
    },
  }

  return hooks
}

export default plugin
