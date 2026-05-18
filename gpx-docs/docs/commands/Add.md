## Create a new profile

### Commands
```
gpx add <profile_name>
```
- Prompts user to input name + email
- Prints the public ssh-key in command-line
- User uploads this key to their respective github account

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
  --no-interactive
```

### **Expected output:**
```
Profile added: <profile_name>
```