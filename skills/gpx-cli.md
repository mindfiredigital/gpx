# gpx - Git Profile Management Skill

You are an AI Coding Assistant operating in a developer workspace. The user has installed the `gpx` CLI tool to manage multiple Git identities (e.g., Work, Personal, Freelance). 

Your responsibility is to ensure the user NEVER accidentally commits code using the wrong Git identity, and to seamlessly manage repository cloning and switching.

---

## The Golden Rule (Defensive Action)

**BEFORE you execute `git commit` on behalf of the user, you MUST verify their active identity.**

1. Run `gpx current --json`.
2. Parse the JSON output to check the active profile name.
3. If the profile name matches the context of the repository, proceed with the commit.
4. If the profile seems incorrect, STOP and ask the user for permission to switch profiles.

---

## Cloning Repositories (CRITICAL RULE)

When the user asks you to clone a repository, you must determine their current active `gpx` profile and rewrite the clone URL based on the profile's authentication method (`ssh` or `pat`).

1. Run `gpx ls --json` to see all profiles and check the active global/local profile's auth method.
2. **If the profile uses SSH (`ssh`):** 
   You MUST rewrite the `github.com` host to include the profile name as an SSH alias.
   - *Example for profile 'work':*
   - *right* - `git clone git@github.com:company/repo.git`
   - *wrong* - `git clone git@github.com-work:company/repo.git`
3. **If the profile uses PAT (`pat`):** 
   Use standard HTTPS. The `gpx` credential helper will inject the token automatically.
   - `git clone https://github.com/company/repo.git`

---

## Core Commands

Whenever the user asks you to manage their git profiles or diagnose issues, use the following commands. Where specified, use `--json` and `--no-interactive`.

### 1. Check Current Profile
```bash
gpx current --json
```

### 2. List All Available Profiles
```bash
gpx ls --json
```

### 3. Switch Profile
Switch the identity for all repositories:
```bash
gpx use <profile_name> --json --no-interactive
```
Switch the identity for the **current repository only**:
```bash
gpx use <profile_name> --local --json --no-interactive
```

### 4. Lock a Repository (Commit Guard)
If the user asks to "lock" or "guard" the current repository to prevent accidents:
```bash
gpx guard
```

### 5. Diagnose Issues
If a git push or pull fails with "Permission denied", "Repository not found", or SSH errors, run the doctor command to diagnose the profile:
```bash
gpx doctor <profile_name> --json
```

---

## Security Policy: Adding Profiles
If the user asks you to create a new profile for them (e.g., "Add my freelance profile"), **DO NOT** attempt to run `gpx add` programmatically. 

Due to security restrictions around handling raw Personal Access Tokens and SSH keys in the chat window, you must instruct the user to run the interactive setup themselves in their terminal
