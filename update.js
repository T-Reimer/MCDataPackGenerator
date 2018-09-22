const nrc = require("node-run-cmd");

const commands = [
    "npm install",
    { command: 'git clone https://github.com/google/blockly.git', cwd: './repos' }
];

nrc.run(commands);