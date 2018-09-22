const nrc = require("node-run-cmd");

const commands = [
    { command: 'git clone ', cwd: './repos' }
];

nrc.run(commands);