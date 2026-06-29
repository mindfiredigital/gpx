import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';

// Prevent duplicate changesets
if (fs.existsSync('.changeset')) {
  const existing = fs
    .readdirSync('.changeset')
    .filter(f => f.endsWith('.md') && f !== 'README.md');

  if (existing.length > 0) {
    console.log('Changeset already exists, skipping generation');
    process.exit(0);
  }
}

// Get latest commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();
console.log(`Processing commit message: "${commitMessage}"`);

// Identify type and description
let changeType = null;
let description = null;

// Detect breaking change (MAJOR)
const isBreaking = /!:/.test(commitMessage) || commitMessage.includes('BREAKING CHANGE');

if (isBreaking) {
  const match = commitMessage.match(/^(?:feat|fix)(?:\([^)]+\))?!?: (.+)/);
  changeType = 'major';
  description = match ? match[1] : commitMessage;
}
// MINOR
else if (/^feat(?:\([^)]+\))?: (.+)/.test(commitMessage)) {
  const match = commitMessage.match(/^feat(?:\([^)]+\))?: (.+)/);
  changeType = 'minor';
  description = match[1];
}
// PATCH
else if (/^fix(?:\([^)]+\))?: (.+)/.test(commitMessage)) {
  const match = commitMessage.match(/^fix(?:\([^)]+\))?: (.+)/);
  changeType = 'patch';
  description = match[1];
}

// Generate changeset
if (changeType) {
  description = description?.trim() || 'No description provided.';
  
  const packageName = '@mindfiredigital/gpx';
  const frontmatter = `'${packageName}': ${changeType}`;

  const changesetContent = `---
${frontmatter}
---

${description}
`;

  if (!fs.existsSync('.changeset')) {
    fs.mkdirSync('.changeset', { recursive: true });
  }

  fs.writeFileSync(
    path.join('.changeset', `auto-${Date.now()}.md`),
    changesetContent
  );

  console.log(`Changeset created for: ${packageName} (${changeType})`);
} else {
  console.log('No valid Conventional Commit found. Use: feat:, fix:, or ! for breaking');
}
