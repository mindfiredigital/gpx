# Introduction

**gpx** is a FOSS CLI tool that lets developers instantly switch between multiple Git identities on a single machine.

---

## The Problem

If you're a developer, you've probably been here before:

- You push a commit to your work repo - and it shows up under your personal email.
- You clone a client project and forget to set the right SSH key.
- You can't remember which Git identity is currently active.

Managing multiple Git identities today looks like this:

| Problem | Current Workaround | Pain Level |
|---|---|---|
| Wrong commits pushed under wrong email | Manual `git config user.email` per repo | 🔴 High |
| Switching SSH keys per account | Editing `~/.ssh/config` manually | 🔴 High |
| No visual indication of active profile | Zero - pure memory | 🔴 High |
| Forgetting which profile is active | Running `git config user.email` to check | 🟡 Med |
| Per-repo identity setup | Repeating config in every new repo | 🟡 Med |

No existing FOSS tool solves all of these together with a clean, fast CLI. **gpx does.**

---

## The Solution

gpx gives you named profiles - each carrying a full Git identity - and lets you switch between them instantly.

```
# Add your profiles once
gpx add personal --display-name "Alan Turing" --email alan@gmail.com
gpx add work --display-name "Ada Lovelace" --email ada@company.com --ssh-key ~/.ssh/id_ed25519_work

# Switch in one command
gpx use work

# Always know who you are
gpx current
```

Under the hood, gpx manages `~/.gitconfig` and `~/.ssh/config` for you - atomically and safely - without touching anything outside its own managed blocks.

---

## What gpx Does For You

**Named profiles** - save any number of Git identities with a short name like `work`, `personal`, or `freelance`.

**Instant switching** - one command to switch your global identity or just the identity for the current repo.

**SSH key management** - each profile carries its own SSH key. gpx automatically maintains the right `~/.ssh/config` blocks so the correct key is used per host.

**PAT (HTTPS) authentication** - securely store and rotate Personal Access Tokens (PAT) in the OS-level keychain. gpx automatically handles Git HTTPS authentication requests, scoping credentials cleanly to the active profile.

**Auto-detect** - configure a URL pattern per profile and gpx will automatically switch when you `cd` into a matching repo.

**Shell prompt badge** - always see the active profile in your terminal prompt.

**Zero config files to touch** - gpx handles `~/.gitconfig` and `~/.ssh/config` entirely. You never edit them manually again.

---

## Who is gpx For?

**Freelancers** switching between 3–5 client profiles multiple times a day.

**Open source contributors** who use a work identity 9–5 and a personal identity for OSS evenings.

**Teams** that want to standardize Git identity management across their developers.

**AI agents** managing developer environments - gpx supports `--json` output and `--no-interactive` mode on every command.