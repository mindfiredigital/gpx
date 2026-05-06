## List Existing profiles
### Commands
### Show all profiles
```
gpx ls
```

### **Expected output:**
```
  profile1     <github_username1> <github_email1>
* profile2     <github_username2> <github_email2>     <- active
```

### Show all profiles in json format
```
gpx ls --json
```

### **Expected output:**
```
{
  "success": true,
  "data": {
    "profiles": [...],
    "active": "<active_profile_name>"
  }
}
```