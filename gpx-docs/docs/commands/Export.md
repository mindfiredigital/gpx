## Export profiles
### Commands
### Export to file
```
gpx export -o <export_profile_path.json>
```

### Include SSH public key content
```
gpx export --include-public-keys -o <export_profile_path.json>
```

### JSON format
```
gpx export --json -o <export_profile_path.json>
```

### **Expected output**
```
{
  "profiles": [
    {
      "name": "<profile_name>",
      "display_name": "<profile_display_name>",
      "email": "<profile_email>",
      "ssh_key": "<profile_ssh_key_path>",
      "gpg_key": <null/gpg_key>,
      "signing_commits": <false/true>,
      "created_at": "<time>"
    }
  ],
  "exported_at": "<exported_at>"
}
```