# Commit Guard

Prevent accidental commits with the wrong Git identity in a repository.

## Usage

```bash
gpx guard
```

## Demo
<video style={{ maxWidth: '800px', width: '50%', display: 'block', borderRadius: '4px', margin: '0 auto' }} autoPlay loop muted playsInline controls>
  <source src={require('@site/static/img/gpx-guard-demo.mp4').default} type="video/mp4" />
</video>

## Examples

### Activate the guard

Navigate to your repository and run the command.

```bash
cd ~/projects/company-app
gpx guard
```

Expected output:
```
Locked this repository to the 'work' profile.
Commit guard activated! 🛡️
```

### Trying to commit with the wrong profile

Once a repository is guarded, if you accidentally switch to the wrong profile and attempt to commit, the Commit Guard will catch it:

```bash
gpx use personal --local
git commit -m "fix: minor bug"
```

Expected output:
```
✗ Commit Blocked!
You are trying to commit with 'personal'
Commits are allowed to the profile : 'work'

Please switch to the correct profile,
Run: gpx use work
```

![Blocked Commit Output](/img/gpx-guard-blocked.png)

## What happens behind the scenes

Running `gpx guard` does two things:

1. **Locks the profile:** It writes a `gpx.expectedprofile` key into the repository's local `.git/config`.
2. **Installs the hook:** It creates a `pre-commit` hook in `.git/hooks/pre-commit` that runs `gpx verify-commit` right before Git allows the commit to be saved.

### How the guard decides which profile to lock

When you run `gpx guard`, it determines the expected profile using this priority:
1. The current **local profile** - if you've already run `gpx use <name> --local`.
2. The profile detected from the **remote URL** - if the repo was cloned using an SSH host alias (like `github.com-work`).
3. The current **global active profile** - as a fallback.

## Related commands

- [`gpx doctor`](./Doctor.md) - Check if the Commit Guard is active in the current repository.
- [`gpx use`](./Use.md) - Switch profiles to satisfy the Commit Guard.
