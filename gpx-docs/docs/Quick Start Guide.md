# Quick Start Guide

**Get up and running with gpx in 5 minutes.**

This guide covers **3 scenarios** for adding and using git profiles:

| # | Scenario | Auth Method | Cloning Method |
|:-:|:---------|:------------|:---------------|
| 1 | **SSH - Generate a new key** | SSH | `git@github.com-<profile>:org/repo.git` |
| 2 | **SSH - Use an existing key** | SSH | `git@github.com-<profile>:org/repo.git` |
| 3 | **PAT - Personal Access Token** | HTTPS | `https://github.com/org/repo.git` |

---

## Prerequisites

- **Git** installed (`git --version` → 2.28 or later)
- **gpx** installed (`gpx --version`)
- A GitHub account (or any Git hosting provider for SSH)

---

## Scenario 1: SSH - Generate a New Key

> **Best for:** You're starting fresh and want gpx to create and manage your SSH key.

### Step 1 - Add the profile

```bash
gpx add work
```

gpx will walk you through an interactive setup:

```
? Add Profile using: › Secure Shell (SSH)      ← select SSH
? Display Name: Ada Lovelace
? Email: ada@company.com
? SSH Key setup: › Generate new SSH key         ← select Generate
```

gpx generates an ed25519 key pair at `~/.ssh/id_ed25519_gpx_work` and prints the public key:

```
✓ Profile added: work

Add this public key to your GitHub account:
https://github.com/settings/ssh/new

ssh-ed25519 AAAAC3Nz... ada@company.com
```

**Non-interactive alternative** (for scripts/CI):

```bash
gpx add work \
  --display-name "Ada Lovelace" \
  --email ada@company.com \
  --generate-ssh \
  --auth-method ssh \
  --no-interactive
```

### Step 2 - Add the public key to GitHub

1. Copy the printed public key
2. Go to **GitHub → Settings → SSH and GPG keys → New SSH key**
3. Paste the key, give it a title like `gpx-work`, and save

### Step 3 - Activate the profile

```bash
gpx use work
```

```
✓ Switched to work (global)
```

### Step 4 - Clone a repo using the SSH host alias

When you clone with an SSH-based gpx profile, you use a **modified SSH URL** that includes your profile name as a host alias. This is how gpx knows which SSH key to use:

```
Standard SSH URL:     git@github.com:my-company/my-repo.git
                           ^^^^^^^^^^
gpx SSH URL:          git@github.com-work:my-company/my-repo.git
                           ^^^^^^^^^^^^^^^
                           └── "github.com-work" = host alias
                               gpx mapped this to the correct SSH key
                               in ~/.ssh/config
```

**Clone command:**

```bash
git clone git@github.com-work:my-company/my-repo.git
```

> **Why the host alias?**
> When you added the profile, gpx created an entry in `~/.ssh/config`:
> ```
> # BEGIN gpx:work
> Host github.com-work
>     Hostname github.com
>     User git
>     IdentityFile "~/.ssh/id_ed25519_gpx_work"
>     IdentitiesOnly yes
> # END gpx:work
> ```
> By cloning with `github.com-work` instead of `github.com`, SSH automatically picks the correct key for this profile - no manual config needed.

### Step 5 - Start working

```bash
cd my-repo
git add .
git commit -m "feat: first commit as work profile"
git push
```

All commits are now signed with `Ada Lovelace <ada@company.com>` and pushed using the work SSH key.

---

## Scenario 2: SSH - Use an Existing Key

> **Best for:** You already have an SSH key (e.g., `~/.ssh/id_ed25519`) and want to attach it to a gpx profile.

### Step 1 - Add the profile

```bash
gpx add personal
```

Interactive setup:

```
? Add Profile using: › Secure Shell (SSH)
? Display Name: Alan Turing
? Email: alan@gmail.com
? SSH Key setup: › Use an existing SSH key from ~/.ssh
? Select an SSH key:
  ❯ id_ed25519          ← pick your existing key
    id_rsa
    id_ed25519_other
```

```
✓ Profile added: personal
```

**Non-interactive alternative** (for scripts/CI):

```bash
gpx add personal \
  --display-name "Alan Turing" \
  --email alan@gmail.com \
  --ssh-key ~/.ssh/id_ed25519 \
  --auth-method ssh \
  --no-interactive
```

### Step 2 - Make sure the public key is on GitHub

If your existing key's public key (`~/.ssh/id_ed25519.pub`) is not already added to your GitHub account, add it:

1. `cat ~/.ssh/id_ed25519.pub` → copy the output
2. Go to **GitHub → Settings → SSH and GPG keys → New SSH key**
3. Paste and save

### Step 3 - Activate and clone

```bash
gpx use personal
```

Clone with the host alias:

```bash
git clone git@github.com-personal:alan/side-project.git
```

### Step 4 - Start working

```bash
cd side-project
git commit -m "fix: weekend bug fix"
git push
```

---

## Scenario 3: PAT - Personal Access Token

> **Best for:** HTTPS-based workflows, corporate environments that block SSH, or when you prefer token-based auth.

### Step 1 - Generate a PAT on GitHub (if you don't have one)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Click **Generate new token**
3. Set permissions: at minimum, **Contents: Read and write** for your repos
4. Copy the token

### Step 2 - Add the profile

```bash
gpx add freelance
```

Interactive setup:

```
? Add Profile using: › Personal Access Token (PAT)
? Enter Personal Access Token: ****************************   ← paste your PAT
Validating PAT with GitHub...
? Email: ada@clientco.com
Found GitHub username: ada-lovelace
Use this identity? [y/n]: y
```

```
✓ Profile added: freelance (PAT / HTTPS)

To start using this profile:
  gpx use freelance
```

**Non-interactive alternative:**

```bash
gpx add freelance \
  --display-name "Ada Freelance" \
  --email ada@clientco.com \
  --auth-method pat \
  --pat "github_pat_xxxxxxxxxxxx" \
  --no-interactive
```

> **What happens behind the scenes:**
> - gpx validates the PAT with the GitHub API
> - Stores the PAT securely in your **OS Native Credential Manager**
> - Registers a git credential helper (`!gpx git-credential`) in your global `~/.gitconfig`
> - When git needs credentials for `https://github.com`, gpx automatically provides the PAT for the active profile

### Step 3 - Activate the profile

```bash
gpx use freelance
```

### Step 4 - Clone using HTTPS (standard URL)

PAT profiles use **standard HTTPS clone URLs** :

```bash
git clone https://github.com/client-org/client-repo.git
```

Git will call the gpx credential helper automatically - no password prompt, no manual config.

### Step 5 - Start working

```bash
cd client-repo
git commit -m "feat: deliver milestone 1"
git push
```

---

## Everyday Commands Reference

Once your profiles are set up, here's how you use gpx day-to-day:

### See all your profiles

```bash
gpx ls
```

```
* work       Ada Lovelace <ada@company.com>      [ssh]
  personal   Alan Turing <alan@gmail.com>         [ssh]
  freelance  Ada Freelance <ada@clientco.com>     [pat]
```

### Switch profiles

```bash
# Switch globally (all repos)
gpx use personal

# Switch locally (current repo only)
gpx use work --local
```

### Check who you are right now

```bash
gpx current
```

```
Active profile: work
Scope: global
Auth method: ssh
Global name: Ada Lovelace
Global email: ada@company.com
```

### View full profile details

```bash
gpx show work
```

### Edit a profile

```bash
gpx edit work --email new-ada@company.com
gpx edit work --signing true           # enable GPG commit signing
gpx edit work --signing false          # disable it
```

### Rotate a PAT

```bash
gpx pat set freelance
# You'll be prompted to enter the new PAT
```

### Remove a profile

```bash
gpx remove personal

# If the profile is currently active:
gpx remove personal --force
```

### Diagnose issues

```bash
gpx doctor           # check everything
gpx doctor work      # check a specific profile
```

### Export / Import profiles (for machine migration)

```bash
# Export from old machine
gpx export -o my-profiles.json

# Import on new machine
gpx import my-profiles.json

# Import without overwriting existing profiles
gpx import my-profiles.json --merge
```

> **Note:** PAT tokens are **not** included in exports (security). After importing PAT profiles, re-set the token:
> ```bash
> gpx pat set freelance
> ```

### Shell prompt badge

See the active profile in your terminal prompt:

```bash
# For Zsh
gpx init --shell zsh >> ~/.zshrc
source ~/.zshrc

# For Bash
gpx init --shell bash
source ~/.bashrc
```

Your prompt will show:

```
[work] ~/projects/company-app $
[personal] ~/projects/side-project $
```

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────────┐
│  gpx COMMAND REFERENCE                                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  PROFILE MANAGEMENT                                            │
│    gpx add <name>              Add a new profile               │
│    gpx ls                      List all profiles               │
│    gpx show <name>             Show profile details            │
│    gpx edit <name> [--opts]    Edit a profile                  │
│    gpx remove <name>           Remove a profile                │
│                                                                │
│  SWITCHING                                                     │
│    gpx use <name>              Switch global profile           │
│    gpx use <name> --local      Switch for current repo only    │
│    gpx current                 Show active profile             │
│                                                                │
│  PAT MANAGEMENT                                                │
│    gpx pat set <name>          Set/rotate PAT for a profile    │
│    gpx pat clear <name>        Remove stored PAT               │
│                                                                │
│  DIAGNOSTICS                                                   │
│    gpx doctor                  Check system health             │
│    gpx doctor <name>           Check specific profile          │
│                                                                │
│  PORTABILITY                                                   │
│    gpx export [-o file]        Export profiles to JSON         │
│    gpx import <file>           Import profiles from JSON       │
│                                                                │
│  SHELL INTEGRATION                                             │
│    gpx init --shell <sh>       Install shell prompt badge      │
│    gpx completion --shell <sh> Print completion script         │
│                                                                │
│  GLOBAL FLAGS                                                  │
│    --json                      Structured JSON output          │
│    --no-interactive            Disable prompts (CI/scripts)    │
│    --quiet                     Suppress non-error output       │
│    --no-color                  Disable ANSI colors             │
│                                                                │
│  CLONING CHEAT SHEET                                           │
│    SSH profile:   git clone git@github.com-<profile>:org/r.git │
│    PAT profile:   git clone https://github.com/org/repo.git    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### "Permission denied (publickey)" when pushing

Your SSH key might not be added to the ssh-agent:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_gpx_work
```

Or run the doctor:

```bash
gpx doctor work
```

### "remote: Repository not found" with PAT

Your PAT might have expired or lack permissions:

```bash
gpx pat set freelance    # re-enter a fresh PAT
```

### Cloned with the wrong URL format

If you cloned with `github.com` instead of `github.com-<profile>`:

```bash
# Fix the remote to use the gpx host alias
git remote set-url origin git@github.com-work:org/repo.git
```

If you're using PAT but cloned with SSH format:

```bash
# Fix the remote to use HTTPS
git remote set-url origin https://github.com/org/repo.git
```
