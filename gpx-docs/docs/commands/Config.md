## Manage config settings

### Commands
### Get auto-detect status
```
gpx config get auto_detect
```
- auto detect = false

### Enable auto-detect
```
gpx config set auto_detect --update true
```
- auto detect = true

### Disable auto-detect
```
gpx config set auto_detect --update false
```

### How auto-detect works

- Enable auto_detect
```
gpx config set auto_detect --update true
```

- Initialize shell hooks (Eg. Zsh)
```
gpx init --shell zsh
```

- move into a repo cloned with SSH alias
```
cd ~/work/company-repo
```
- What happens next : 
```
Remote: git@github.com-work:org/repo.git

 Shell hook fires:
   -> Checks: is auto-detect enabled? YES
   -> Extracts "work" from github.com-work
   -> Switches to work profile
   -> Prompt Badge updates to [work]
```

