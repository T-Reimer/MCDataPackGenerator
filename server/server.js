const express = require('express');
const app = express();
const port = 8080;

const fs = require("fs");

fs.copyFile("./../repos/blockly/blockly_compressed.js", "./public/blockly_compressed.js", console.log);
fs.copyFile("./../repos/blockly/blocks_compressed.js", "./public/blocks_compressed.js", console.log);

app.use(express.static('./public'));


app.listen(port, function(){
    console.log(`Listening on port ${port}!`);
});