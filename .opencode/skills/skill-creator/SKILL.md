---
name: skill-creator
description: Create new opencode skills following official guidelines. Generates properly formatted SKILL.md files with valid frontmatter, naming conventions, and directory structure.
---

## What I do

Create new opencode skills following the official guidelines from https://opencode.ai/docs/skills/

I ensure:

- Proper frontmatter with name, description (1-1024 chars), and optional fields
- Valid skill names (lowercase, alphanumeric, hyphens only, 1-64 chars)
- Correct directory structure (.opencode/skills/<name>/SKILL.md)
- Helpful, detailed instructions in the skill body

## When to use me

Use this skill when:

- You need to create a reusable skill for opencode agents
- You want to standardize how skills are created in your project
- You're unsure about the correct format or naming conventions

## How I work

1. **Ask for the skill name** if not provided - must be valid format
2. **Ask for the description** - 1-1024 characters explaining what the skill does
3. **Ask for the content** - detailed instructions for the agent
4. **Create the directory structure** at `.opencode/skills/<name>/`
5. **Write the SKILL.md file** with proper frontmatter and content

## Validation rules I follow

### Name validation

- 1-64 characters
- Lowercase alphanumeric with hyphens only
- No leading/trailing hyphens
- No consecutive hyphens
- Must match directory name

### Frontmatter format

```yaml
---
name: <skill-name>
description: <1-1024 character description>
license: <optional>
compatibility: <optional>
metadata: <optional key-value pairs>
---
```

### Directory placement

- Project: `.opencode/skills/<name>/SKILL.md`
- Global: `~/.config/opencode/skills/<name>/SKILL.md`
