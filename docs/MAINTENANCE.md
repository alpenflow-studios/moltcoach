# MAINTENANCE.md — System Update & Environment Maintenance

---

## Quick Update (Interactive)

```
Update my dev environment: 1) brew packages, 2) npm global packages, 3) list any outdated CLI tools. Show me a checklist first, then proceed step by step.
```

---

## Manual Update Checklist

```bash
# 1. Homebrew
brew update && brew upgrade && brew cleanup

# 2. npm globals
npm update -g

# 3. Foundry
foundryup

# 4. Verify
echo "Node: $(node --version)"
echo "Forge: $(forge --version)"
echo "Cast: $(cast --version)"
```

---

## Maintenance Schedule

| Frequency | What |
|-----------|------|
| Weekly | Brew + npm globals |
| Bi-weekly | Full environment audit |
| Before major feature | Full pipeline |
