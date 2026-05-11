## Edit a profile
### Commands

### Update SSH key
```
gpx edit <profile_name> --ssh-key <private_ssh_key_path>
```
### Updated profile: work

### Update GPG key
```
gpx edit <profile_name> --gpg-key <new_gpg_key>
```

### Enable signing
```
gpx edit <profile_name> --signing <true/false>
```

### Multiple changes at once
```
gpx edit work --ssh-key <private_key_path> --gpg-key <new_gpg_key> --signing <true/false>
```

> **Note:** name, display_name, and email cannot be edited (fetched from GitHub OAuth).