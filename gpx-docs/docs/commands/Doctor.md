## System Diagnostics

### Commands

### Check all profiles
```
gpx doctor
```

### **Expected output:**
```
Diagnosing system + all profiles

  ✓ Git installed: <git_version>
  ✓ Git identity configured: <global_git_identity_username> <global_git_identity_email>
  ✓ SSH agent: <number_of_keys_loaded/custom error/warning>
  ✓ SSH key (profile1): <key_permission>
  ✓ GPG key (profile1): <gpg_key>
  ✓ SSH key (profile2): <key_permission>
  ✓ GPG key (profile2): <gpg_key>

x passed, y warnings, z failed
```

### Check specific profile (includes remote match check)
```
gpx doctor <profile_name>
```

### **Expected output:**
```
Diagnosing <profile_name>

  ✓ Git installed: <git_version>
  ✓ Git identity configured: <global_git_identity_username> <global_git_identity_email>
  ✓ SSH agent: <number_of_keys_loaded/custom error/warning>
  ✓ SSH key (<profile_name>): <key_permission>
  ✓ GPG key (<profile_name>): <gpg_key>
  ✓ Repo remote match: <Comment if matches or not>

x passed, y warnings, z failed
```