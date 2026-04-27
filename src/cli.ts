#!/usr/bin/env bun

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runAddCommand } from './commands/add';
import { runLsCommand } from './commands/ls';
import { runUseCommand } from './commands/use';
import { runCurrentCommand } from './commands/current';
import { runRemoveCommand } from './commands/remove';
import { runShowCommand } from './commands/show';
import { runInitCommand } from './commands/init';
import { setOutputFlags } from './utils/output';
import type { GlobalCliOptions } from './lib/types/GpxConfig.type';

await yargs(hideBin(process.argv))
  .scriptName('gpx')
  .option('json', { type: 'boolean', default: false })
  .option('no-interactive', { type: 'boolean', default: false })
  .option('no-color', { type: 'boolean', default: false })
  .option('quiet', { type: 'boolean', default: false })
  .middleware((argv: GlobalCliOptions) => {
    const opts = argv;
    setOutputFlags({
      json: Boolean(opts.json),
      quiet: Boolean(opts.quiet),
      noColor: Boolean(opts.noColor),
    });
  }, true)
  .command(
    'add <name>',
    'Add a profile',
    (builder: any) =>
      builder
        .positional('name', { type: 'string', demandOption: true })
        .option('display-name', { type: 'string' })
        .option('email', { type: 'string' })
        .option('ssh-key', { type: 'string' })
        .option('generate-ssh', { type: 'boolean', default: false })
        .option('gpg-key', { type: 'string' })
        .option('signing', { type: 'boolean', default: false }),
    async (argv: any) => {
      process.exitCode = await runAddCommand({
        name: argv.name,
        displayName: argv.displayName,
        email: argv.email,
        sshKey: argv.sshKey,
        generateSsh: argv.generateSsh,
        gpgKey: argv.gpgKey,
        signing: argv.signing,
        noInteractive: argv.noInteractive,
        json: argv.json,
      });
    }
  )
  .command(
    'ls',
    'List profiles',
    () => {},
    async (argv: any) => {
      process.exitCode = await runLsCommand(argv.json);
    }
  )
  .command(
    'show <name>',
    'Show one profile',
    (builder: any) => builder.positional('name', { type: 'string', demandOption: true }),
    async (argv: any) => {
      process.exitCode = await runShowCommand(argv.name, argv.json);
    }
  )
  .command(
    'remove <name>',
    'Remove a profile',
    (builder: any) =>
      builder
        .positional('name', { type: 'string', demandOption: true })
        .option('force', { type: 'boolean', default: false }),
    async (argv: any) => {
      process.exitCode = await runRemoveCommand(argv.name, argv.force, argv.json);
    }
  )
  .command(
    'rm <name>',
    'Remove a profile',
    (builder: any) =>
      builder
        .positional('name', { type: 'string', demandOption: true })
        .option('force', { type: 'boolean', default: false }),
    async (argv: any) => {
      process.exitCode = await runRemoveCommand(argv.name, argv.force, argv.json);
    }
  )
  .command(
    'use <name>',
    'Switch profile',
    (builder: any) =>
      builder
        .positional('name', { type: 'string', demandOption: true })
        .option('local', { type: 'boolean', default: false }),
    async (argv: any) => {
      process.exitCode = await runUseCommand(argv.name, argv.local, argv.json);
    }
  )
  .command(
    'current',
    'Show current profile',
    () => {},
    async (argv: any) => {
      process.exitCode = await runCurrentCommand(argv.json);
    }
  )
  .command(
    'init',
    'Initialize shell support and prompt badge',
    (builder: any) => builder.option('shell', { type: 'string', choices: ['bash', 'zsh', 'fish'] }),
    async (argv: any) => {
      process.exitCode = await runInitCommand({
        shell: argv.shell,
        json: argv.json,
      });
    }
  )
  .demandCommand(1, 'Use a command. Try: gpx --help')
  .strict()
  .help()
  .parseAsync();
