## Show active profile

### Commands
### Display the active profile
```
gpx current
```

### **Expected output (global only):**
```
Active profile: <global_profile_name>
  Name: <global_profile_display_name>
  Email: <global_profile_email>
  Scope: <global>
```

### **Expected output (with local override):**
```
Active profile: <local_profile_name>
  Name: <local_profile_displayname>
  Email: <local_profile_email>
  Scope: local
  Global: <global_profile_name> 
```

### Display the active profile (json)
```
gpx current --json
```
### **Expected output (with local override):**
```
{
  "success": true,
  "data": {
    "active": {
      "profile": "<override_profile_name>",
      "scope": "<local/global>"
    },
    "global": {
      "profile": "<global_profile_name>",
      "name": "<global_profile_username>",
      "email": "<global_profile_email>",
      "signingKey": <null/signing_key>
    },
    "local": {
      "profile": "<local_profile_name>",
      "name": "<local_profile_username>",
      "email": "<local_profile_email>",
      "signingKey": <null/signing_key>
    }
  }
}
```