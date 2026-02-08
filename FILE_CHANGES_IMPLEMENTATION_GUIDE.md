# FILE CHANGES IMPLEMENTATION GUIDE

> **Generated**: February 5, 2026
> **Session**: Claude Code Documentation Setup for Michael
> **Projects Affected**: Global config + SMASH + All future projects

---

# SUMMARY OF CHANGES

| Action | Count |
|--------|-------|
| Files to CREATE | 11 |
| Files to MOVE | 1 |
| Files to DELETE | 3 |
| Directories to CREATE | 4 |

---

# STEP 1: CREATE DIRECTORIES

Run these commands first:

```bash
# Global Claude config directory
mkdir -p ~/.claude

# SMASH project directories (run from smash project root)
cd ~/path/to/smash
mkdir -p docs
mkdir -p tasks
mkdir -p .claude/skills/update
```

---

# STEP 2: CREATE NEW FILES

## 2.1 Global Config (applies to ALL projects)

### File: `~/.claude/CLAUDE.md`
- **Action**: CREATE
- **Size**: ~7KB
- **Purpose**: Your preferences, default stack, code rules, session management
- **Source**: Download from bundle or copy Section 1 from COMPLETE_DOCUMENTATION_BUNDLE.md

```bash
# Installation
mv ~/Downloads/global-claude/CLAUDE.md ~/.claude/CLAUDE.md

# Verify
cat ~/.claude/CLAUDE.md | head -20
```

---

## 2.2 SMASH Project Files

### File: `smash/CLAUDE.md`
- **Action**: CREATE (replaces CLAUDE_MCP_ROLE.md)
- **Size**: ~4KB
- **Purpose**: SMASH-specific context, URLs, contract addresses
- **Source**: Download from bundle or copy Section 3 from COMPLETE_DOCUMENTATION_BUNDLE.md

```bash
cd ~/path/to/smash
mv ~/Downloads/smash-project/CLAUDE.md ./CLAUDE.md
```

---

### File: `smash/docs/PRD.md`
- **Action**: MOVE + RENAME (from SMASH_SPEC.md)
- **Size**: Existing file
- **Purpose**: Product requirements (your existing spec is good, just moving it)

```bash
cd ~/path/to/smash
mv SMASH_SPEC.md docs/PRD.md
```

---

### File: `smash/docs/ARCHITECTURE.md`
- **Action**: CREATE
- **Size**: ~14KB
- **Purpose**: System design, data flow, infrastructure
- **Source**: Download from bundle or copy Section 8

```bash
mv ~/Downloads/docs/ARCHITECTURE.md ./docs/ARCHITECTURE.md
```

---

### File: `smash/docs/CONTRACTS.md`
- **Action**: CREATE
- **Size**: ~11KB
- **Purpose**: Smart contract specs, deploy procedures
- **Source**: Download from bundle or copy Section 9

```bash
mv ~/Downloads/docs/CONTRACTS.md ./docs/CONTRACTS.md
```

---

### File: `smash/docs/WEB3_COMMANDS.md`
- **Action**: CREATE
- **Size**: ~11KB
- **Purpose**: CLI reference for forge, cast, anvil, wagmi
- **Source**: Download from bundle or copy Section 10

```bash
mv ~/Downloads/docs/WEB3_COMMANDS.md ./docs/WEB3_COMMANDS.md
```

---

### File: `smash/docs/MAINTENANCE.md`
- **Action**: CREATE
- **Size**: ~6.5KB
- **Purpose**: System update procedures, agent patterns
- **Source**: Download from bundle or copy Section 11

```bash
mv ~/Downloads/docs/MAINTENANCE.md ./docs/MAINTENANCE.md
```

---

### File: `smash/tasks/CURRENT_SPRINT.md`
- **Action**: CREATE
- **Size**: ~2KB
- **Purpose**: Active tasks with machine-checkable criteria
- **Source**: Download from bundle or copy Section 6

```bash
mv ~/Downloads/tasks/CURRENT_SPRINT.md ./tasks/CURRENT_SPRINT.md
```

---

### File: `smash/.claude/skills/update/SKILL.md`
- **Action**: CREATE
- **Size**: ~300 bytes
- **Purpose**: Custom Claude Code skill for system updates

```bash
cat > .claude/skills/update/SKILL.md << 'EOF'
# System Update Skill

When invoked, perform these updates in order:
1. `brew update && brew upgrade`
2. `brew cleanup`
3. `npm update -g`
4. Report what was updated with version changes

Create a todo list first, check off each step as completed.
EOF
```

---

# STEP 3: DELETE OLD FILES

These files are superseded by the new structure:

### File: `CLAUDE_MCP_ROLE.md`
- **Action**: DELETE
- **Reason**: Content extracted into new `CLAUDE.md` (project-specific URLs, contracts) and `~/.claude/CLAUDE.md` (preferences)

```bash
rm CLAUDE_MCP_ROLE.md
```

---

### File: `PROJECT_SUMMARY.md`
- **Action**: DELETE
- **Reason**: Stale session 1 summary with outdated tech versions. No longer useful.

```bash
rm PROJECT_SUMMARY.md
```

---

### File: `terminal_fullstack.md`
- **Action**: DELETE
- **Reason**: Generic architecture doc superseded by new `docs/ARCHITECTURE.md`. Also contained ChatGPT references (we roll Claude in these parts).

```bash
rm terminal_fullstack.md
```

---

# STEP 4: KEEP EXISTING FILES (NO CHANGES)

These files are already good and should remain:

| File | Location | Notes |
|------|----------|-------|
| `SESSION_HANDOFF.md` | Root | Keep as-is, update each session |
| `CURRENT_ISSUES.md` | Root | Keep as-is, tracks bugs |
| `NEXT_STEPS.md` | Root | Keep as-is (similar to CURRENT_SPRINT) |
| `.claude/settings.local.json` | .claude/ | Keep — has git permissions |
| `contracts/` | Directory | Keep — your Foundry contracts |
| `src/` | Directory | Keep — your Next.js app |
| All config files | Root | Keep — .env, package.json, etc. |

---

# STEP 5: COMPLETE SETUP SCRIPT

Run this entire script from your SMASH project root:

```bash
#!/bin/bash
# SMASH Project Documentation Setup
# Run from: ~/path/to/smash

set -e  # Exit on error

echo "=== SMASH Documentation Setup ==="

# 1. Create directories
echo "Creating directories..."
mkdir -p docs
mkdir -p tasks
mkdir -p .claude/skills/update

# 2. Move SMASH_SPEC to docs/PRD.md
echo "Moving SMASH_SPEC.md → docs/PRD.md..."
if [ -f "SMASH_SPEC.md" ]; then
    mv SMASH_SPEC.md docs/PRD.md
    echo "  ✓ Moved"
else
    echo "  ⚠ SMASH_SPEC.md not found (may already be moved)"
fi

# 3. Delete old files
echo "Removing old files..."
rm -f CLAUDE_MCP_ROLE.md && echo "  ✓ Deleted CLAUDE_MCP_ROLE.md" || echo "  ⚠ Not found"
rm -f PROJECT_SUMMARY.md && echo "  ✓ Deleted PROJECT_SUMMARY.md" || echo "  ⚠ Not found"
rm -f terminal_fullstack.md && echo "  ✓ Deleted terminal_fullstack.md" || echo "  ⚠ Not found"

# 4. Create update skill
echo "Creating update skill..."
cat > .claude/skills/update/SKILL.md << 'EOF'
# System Update Skill

When invoked, perform these updates in order:
1. `brew update && brew upgrade`
2. `brew cleanup`
3. `npm update -g`
4. Report what was updated with version changes

Create a todo list first, check off each step as completed.
EOF
echo "  ✓ Created .claude/skills/update/SKILL.md"

# 5. Remind about manual steps
echo ""
echo "=== MANUAL STEPS REQUIRED ==="
echo ""
echo "1. Download the documentation bundle from Claude chat"
echo ""
echo "2. Install global config:"
echo "   mkdir -p ~/.claude"
echo "   mv ~/Downloads/global-claude/CLAUDE.md ~/.claude/CLAUDE.md"
echo ""
echo "3. Install SMASH project config:"
echo "   mv ~/Downloads/smash-project/CLAUDE.md ./CLAUDE.md"
echo ""
echo "4. Install docs (from earlier download):"
echo "   mv ~/Downloads/docs/ARCHITECTURE.md ./docs/"
echo "   mv ~/Downloads/docs/CONTRACTS.md ./docs/"
echo "   mv ~/Downloads/docs/WEB3_COMMANDS.md ./docs/"
echo "   mv ~/Downloads/docs/MAINTENANCE.md ./docs/"
echo ""
echo "5. Install tasks:"
echo "   mv ~/Downloads/tasks/CURRENT_SPRINT.md ./tasks/"
echo ""
echo "=== SETUP COMPLETE ==="
```

---

# FINAL DIRECTORY STRUCTURE

After all changes, your SMASH project should look like this:

```
smash/
├── .claude/
│   ├── settings.local.json          # KEEP (existing)
│   └── skills/
│       └── update/
│           └── SKILL.md              # NEW
├── .github/                          # KEEP (existing)
├── contracts/                        # KEEP (existing)
├── docs/
│   ├── PRD.md                        # MOVED (was SMASH_SPEC.md)
│   ├── ARCHITECTURE.md               # NEW
│   ├── CONTRACTS.md                  # NEW
│   ├── WEB3_COMMANDS.md              # NEW
│   └── MAINTENANCE.md                # NEW
├── public/                           # KEEP (existing)
├── src/                              # KEEP (existing)
├── tasks/
│   └── CURRENT_SPRINT.md             # NEW
├── CLAUDE.md                         # NEW (replaces CLAUDE_MCP_ROLE.md)
├── CURRENT_ISSUES.md                 # KEEP (existing)
├── NEXT_STEPS.md                     # KEEP (existing)
├── SESSION_HANDOFF.md                # KEEP (existing)
├── .env.local                        # KEEP (existing)
├── .gitignore                        # KEEP (existing)
├── package.json                      # KEEP (existing)
├── next.config.ts                    # KEEP (existing)
├── tailwind.config.ts                # KEEP (existing)
├── tsconfig.json                     # KEEP (existing)
└── [other config files]              # KEEP (existing)

~/.claude/
└── CLAUDE.md                         # NEW (global config)
```

---

# FILES DELETED (for reference)

| File | Reason |
|------|--------|
| `CLAUDE_MCP_ROLE.md` | Content split: URLs/contracts → `CLAUDE.md`, preferences → `~/.claude/CLAUDE.md` |
| `PROJECT_SUMMARY.md` | Stale, outdated tech versions, no longer useful |
| `terminal_fullstack.md` | Superseded by `docs/ARCHITECTURE.md`, contained ChatGPT references |

---

# VERIFICATION CHECKLIST

After setup, verify:

- [ ] `~/.claude/CLAUDE.md` exists and contains your preferences
- [ ] `CLAUDE.md` exists in project root with SMASH-specific context
- [ ] `docs/PRD.md` exists (moved from SMASH_SPEC.md)
- [ ] `docs/ARCHITECTURE.md` exists
- [ ] `docs/CONTRACTS.md` exists
- [ ] `docs/WEB3_COMMANDS.md` exists
- [ ] `docs/MAINTENANCE.md` exists
- [ ] `tasks/CURRENT_SPRINT.md` exists
- [ ] `.claude/skills/update/SKILL.md` exists
- [ ] Old files deleted: `CLAUDE_MCP_ROLE.md`, `PROJECT_SUMMARY.md`, `terminal_fullstack.md`
- [ ] `SESSION_HANDOFF.md` still exists (not deleted)
- [ ] `CURRENT_ISSUES.md` still exists (not deleted)
- [ ] `NEXT_STEPS.md` still exists (not deleted)

```bash
# Quick verification command
ls -la CLAUDE.md docs/ tasks/ .claude/ ~/.claude/CLAUDE.md
```

---

*Document generated by Claude — February 5, 2026*
