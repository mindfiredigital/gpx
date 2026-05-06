## Delete a profile
### Commands
### Remove non-active profile
```
gpx remove <non_active_profile>
```
- Removes the profile: ```<non_active_profile>```

### Remove active profile (blocked)
```
gpx remove <active_profile>
```
- Error: cannot remove active profile. Use --force

### Force remove active profile
```
gpx remove <active_profile> --force
```
- Removes the profile: ```<active_profile>```