## Temporary profile switch
### Commands


```
gpx run <profile_name> <command>
```
- Example: 
```
gpx run <profile_name> git commit -m "fix: bug"
```

**Expected output:**
```
Command executed as <profile_name>
```

**What happens:**
1. Sets env vars (GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL, etc.)
2. Runs the command in a child process
3. Current active profile remains **unchanged**
