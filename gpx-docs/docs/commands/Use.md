## Profile Switching
### Commands

### Switch global active profile
```
gpx use <profile_name>
```

### **Expected output:**
```
Switched to <profile_name> (global)
```

### Switch locally (current repo)
```
gpx use <profile_name> --local
```

**Expected output:**
```
Switched to <profile_name> (local)
```

**What happens behind the scenes:**
- Sets `~/.gitconfig` user.name + user.email (global)
- Sets `user.signingkey` + `commit.gpgsign` (if GPG configured)
- Rewrites remote URLs if inside a git repo (`github.com-old` -> `github.com-new`)