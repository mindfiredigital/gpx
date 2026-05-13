import { Cli, Command } from 'clipanion';

class FirstCommand extends Command {
  async execute(): Promise<void> {
    this.context.stdout.write('the rise of gpx!');
  }
}

const cli = new Cli({ binaryName: 'gpx' });

cli.register(FirstCommand);

cli.runExit(process.argv.slice(2));
