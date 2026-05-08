## Import Profiles

Import profiles from a JSON file into gpx. Useful when moving to a new machine or restoring from a backup.

### Command

```
gpx import <filepath>
```

---

### Basic import
```
gpx import profiles.json
```

### Import from a specific path
```
gpx import ~/backups/my-profiles.json
```

### Import and view result as JSON
```
gpx import profiles.json --json
```

---

### What a valid import file looks like

```
[
  {
    "name": "work",
    "display_name": "Ada Lovelace",
    "email": "ada@company.com",
    "ssh_key": "~/.ssh/id_ed25519_gpx_work",
    "github_username": "ada-lovelace"
  },
  {
    "name": "personal",
    "display_name": "Alan Turing",
    "email": "alan@gmail.com",
    "ssh_key": "~/.ssh/id_ed25519_gpx_personal",
    "github_username": "alan-turing"
  }
]
```

> **Note:** SSH key paths are imported as-is. Make sure the key files exist at those paths on the new machine, or run `gpx edit <name> --ssh-key <new_path>` to update them after import.

---

### Typical workflow - moving to a new machine

**On the old machine:**
```
gpx export -o profiles.json
```

**On the new machine:**
```
gpx import profiles.json
gpx ls   # verify profiles were imported
```