import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const projectName = process.argv[2]

if (!projectName) {
  console.error("Usage: bun run scripts/rename.ts <project-name>")
  process.exit(1)
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(projectName)) {
  console.error(
    "Error: Project name must be kebab-case (lowercase letters, numbers, hyphens)",
  )
  process.exit(1)
}

const toTitle = (s: string) =>
  s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

const titleName = toTitle(projectName)
const root = process.cwd()

function replaceInFile(relativePath: string, search: string, replace: string) {
  const filePath = join(root, relativePath)
  const content = readFileSync(filePath, "utf-8")
  if (!content.includes(search)) {
    console.warn(`  Skipped ${relativePath} — no match for "${search}"`)
    return
  }
  writeFileSync(filePath, content.replaceAll(search, replace))
  console.log(`  Updated ${relativePath}`)
}

console.log(`\nRenaming project to "${titleName}" (${projectName})...\n`)

replaceInFile("package.json", '"lets-start"', `"${projectName}"`)
replaceInFile("README.md", "# lets-start", `# ${titleName}`)
replaceInFile("apps/web/index.html", "Let's Start", titleName)

console.log("\nDone!\n")
console.log("Next steps:")
console.log("  1. rm scripts/rename.ts")
console.log("  2. bun install")
console.log(
  "  3. rm -rf .git && git init    (optional: start fresh git history)",
)
