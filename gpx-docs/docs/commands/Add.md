## Create a new profile

### Commands
```bash
gpx add <profile_name>
```
* **Interactive Mode**: Prompts you to select the authentication method (**SSH** or **PAT**). 
  * If **SSH** is selected, it scans `~/.ssh` and asks if you want to generate a new key or choose an existing key.
  * If **PAT** is selected, it prompts you to securely enter your Personal Access Token.

---

### Non-Interactive Mode (all fields via flags)

#### SSH Profile
```bash
gpx add <profile_name> \
  --auth-method ssh \
  --display-name "<github_username>" \
  --email "<github_email>" \
  --ssh-key <~/.ssh/private_key_path> \
  --gpg-key <gpg_key> \
  --signing \
  --no-interactive
```

#### SSH Profile (With Auto SSH-Key Generation)
```bash
gpx add <profile_name> \
  --auth-method ssh \
  --display-name "<github_username>" \
  --email "<github_email>" \
  --generate-ssh \
  --no-interactive
```

#### PAT Profile
```bash
gpx add <profile_name> \
  --auth-method pat \
  --display-name "<github_username>" \
  --email "<github_email>" \
  --pat "<token>" \
  --gpg-key <gpg_key> \
  --signing \
  --no-interactive
```

### **Expected output:**
```
Profile added: <profile_name>
```

---


#### **NOTE** - `Windows Machines don't support gpx-pat-profiles, yet`