import { type Plugin, type Hooks } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin/tool"
import { execSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILL_DIR = join(__dirname, "..", "skills", "impeccable")
const SCRIPTS_DIR = join(SKILL_DIR, "scripts")

function runDetector(filePath: string): string | null {
  const detectPath = join(SCRIPTS_DIR, "detect.mjs")
  if (!existsSync(detectPath)) return null
  if (!filePath.match(/\.(html?|css|jsx|tsx|vue|svelte|js|ts|astro)$/i)) return null
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

const statusTool = tool({
  description: "Check if the Design Toolbox plugin is loaded and active, and list available design skills",
  args: {} as const,
  execute: async () => {
    return {
      title: "Design Toolbox Status",
      output: [
        "🎨 Design Toolbox plugin is loaded!",
        "",
        "Skills ready:",
        `  • impeccable (v${getSkillVersion()}) — 23 design commands, 41 anti-pattern detector rules`,
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

    "tool.execute.after": async (input, output) => {
      if (input.tool !== "write" && input.tool !== "edit") return
      const filePath: string | undefined = input.args?.filePath
      if (!filePath) return
      if (!filePath.match(/\.(html?|css|jsx|tsx|vue|svelte|astro)$/i)) return

      const result = runDetector(filePath)
      if (result) {
        output.metadata = { ...output.metadata, design_detector: result }
      }
    },
  }

  return hooks
}

export default plugin
