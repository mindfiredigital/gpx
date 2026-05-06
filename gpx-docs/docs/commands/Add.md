## Create a new profile

### Commands
### With GitHub OAuth 
```
gpx add <profile_name>
```
- Opens browser for GitHub OAuth
- Fetches username + associated email from GitHub

### Interactive mode (prompts for each field)
```
gpx add <profile_name>
```

### Non-interactive mode (all fields via flags)
```
gpx add <profile_name> \
  --display-name "<github_username>" \
  --email "<github_email>" \
  --ssh-key <~/.ssh/private_key_path> \
  --gpg-key <gpg_key> \
  --signing \
  --no-interactive
```

### With SSH key generation
```
gpx add <profile_name> \
  --display-name "<github_username>" \
  --email "<github_email>" \
  --generate-ssh \
  --no-interactive
```

### **Expected output:**
```
Profile added: <profile_name>
```