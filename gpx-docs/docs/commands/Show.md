## Show profile details
### Commands
### Display the details of a profile
```
gpx show <existing_profile_name>
```

### **Expected output:**
```
Profile: <existing_profile_name>
Display name: <existing_profile_display_name>
Email: <existing_profile_email>
SSH key: <existing_profile_private_ssh_key_path>
GPG key: <gpg_key/not set>
Signing commits: <disabled/enabled>
Created at: <time>
Last used at: <time>
Active: <yes/no>
```

### Display the details of a profile (json)
```
gpx show <existing_profile_name> --json
```

### **Expected output:**
```
{
  "success": <true/false>,
  "data": {
    "profile": {
      "name": "<profile_name>",
      "display_name": "<profile_display_name>",
      "email": "<profile_email>",
      "ssh_key": "<profile_private_key_path/null>",
      "signing_commits": <false/true>,
      "created_at": "<time>"
    },
    "active": <true/false>
  }
}
```