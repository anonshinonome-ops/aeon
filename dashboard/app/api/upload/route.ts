import { NextResponse } from 'next/server'
import { createFile, getFileContent, updateFile } from '@/lib/github'

function extractSkillName(content: string): string {
  // Try frontmatter name field
  const fm = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (fm) {
    const nameMatch = fm[1].match(/name:\s*(.+)/)
    if (nameMatch) {
      // Slugify: "Daily Article" → "daily-article"
      return nameMatch[1].trim().replace(/^['"]|['"]$/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }
  }
  return ''
}

function deriveSkillName(files: Array<{ path: string; content: string }>): { name: string; prefix: string } {
  const skillFile = files.find(f =>
    f.path === 'SKILL.md' ||
    f.path.endsWith('/SKILL.md') ||
    f.path.toLowerCase() === 'skill.md' ||
    f.path.toLowerCase().endsWith('/skill.md')
  )

  if (!skillFile) {
    return { name: '', prefix: '' }
  }

  const parts = skillFile.path.split('/')

  // Case 1: "soul/SKILL.md" → name is "soul", prefix is "soul/"
  if (parts.length === 2) {
    return { name: parts[0], prefix: parts[0] + '/' }
  }

  // Case 2: "some/deep/path/soul/SKILL.md" → name is "soul", prefix is "some/deep/path/soul/"
  if (parts.length > 2) {
    const name = parts[parts.length - 2]
    const prefix = parts.slice(0, -1).join('/') + '/'
    return { name, prefix }
  }

  // Case 3: Just "SKILL.md" (no folder) → extract name from frontmatter
  const fmName = extractSkillName(skillFile.content)
  return { name: fmName, prefix: '' }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const files = body.files as Array<{ path: string; content: string }>
    const overrideName = body.name as string | undefined

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Find SKILL.md (case-insensitive)
    const hasSkillMd = files.some(f =>
      f.path === 'SKILL.md' ||
      f.path.endsWith('/SKILL.md') ||
      f.path.toLowerCase() === 'skill.md' ||
      f.path.toLowerCase().endsWith('/skill.md')
    )

    if (!hasSkillMd) {
      return NextResponse.json({
        error: 'No SKILL.md found. A skill must contain a SKILL.md file.',
      }, { status: 400 })
    }

    const { name: derivedName, prefix } = deriveSkillName(files)
    const skillName = overrideName?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || derivedName

    if (!skillName) {
      return NextResponse.json({
        error: 'Could not determine skill name. Please provide a name.',
      }, { status: 400 })
    }

    // Write all files under skills/<name>/
    let filesWritten = 0
    for (const file of files) {
      // Strip the common prefix (folder containing SKILL.md) from paths
      let relativePath = file.path
      if (prefix && relativePath.startsWith(prefix)) {
        relativePath = relativePath.slice(prefix.length)
      }

      // Skip empty paths or directory-only entries
      if (!relativePath || relativePath.endsWith('/')) continue

      await createFile(
        `skills/${skillName}/${relativePath}`,
        file.content,
        `feat: upload ${skillName} skill`,
      )
      filesWritten++
    }

    // Add to aeon.yml if not already present
    try {
      const config = await getFileContent('aeon.yml')
      if (!config.content.includes(`  ${skillName}:`)) {
        const updated = config.content.replace(
          '  # --- Fallback',
          `  ${skillName}:\n    enabled: false\n    schedule: "0 12 * * *"\n\n  # --- Fallback`,
        )
        await updateFile('aeon.yml', updated, config.sha, `chore: add ${skillName} to config`)
      }
    } catch {
      // Config update failed — skill files were still created
    }

    return NextResponse.json({ name: skillName, filesWritten })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
