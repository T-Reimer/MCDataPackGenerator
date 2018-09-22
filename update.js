const nrc = require("node-run-cmd");

// commands to run when installing or updating
const commands = [
    "npm install",
    { command: 'git clone https://github.com/google/blockly.git', cwd: './repos' }
];

// run the commands
nrc.run(commands);