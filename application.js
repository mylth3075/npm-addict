'use strict';

let pathModule = require('path');
let childProcess = require('child_process');
import BackendApplication from './backend-application';

class Application extends BackendApplication {
  constructor(options) {
    super(options);
  }

  async run() {
    let command = this.argv._[0];
    if (!command) throw new Error('Command is missing');
    let options = {
      watch: this.argv.watch,
      fetch: this.argv.fetch
    };
    switch (command) {
      case 'build':
        await this.build(options);
        break;
      case 'start':
        await this.start(options);
        break;
      case 'build-and-start':
        await this.build(options);
        await this.start(options);
        break;
      default:
        throw new Error(`Unknown command '${command}'`);
    }
  }

  async build(options) {
    let path;

    let opts = [];
    if (options.watch) opts.push('--watch');

    path = pathModule.join(__dirname, 'frontend', 'index.js');
    this.spawn('node', path, 'build', ...opts);
  }

  async start(options) {
    this.notifier.notify(`${this.displayName} started (v${this.version})`);

    let path;
    let node = (options.watch ? 'node-dev' : 'node');

    let opts = [];
    if (options.fetch === false) opts.push('--no-fetch');
    path = pathModule.join(__dirname, 'backend', 'index.js');
    this.spawn(node, path, 'start', ...opts);

    path = pathModule.join(__dirname, 'frontend', 'index.js');
    this.spawn(node, path, 'start');
  }

  spawn(cmd, ...args) {
    childProcess.spawn(cmd, args, { stdio: 'inherit' });
  }
}

let app = new Application();

app.run().catch(function(err) {
  app.handleUncaughtException(err);
});
