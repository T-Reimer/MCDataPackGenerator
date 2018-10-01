const express = require('express');
const app = express();
const port = 8080;

const fs = require("fs");


app.use(express.static('./public'));

app.use("/msg", express.static("./../repos/blockly/msg"));

app.use("/blockly_compressed.js", express.static("./../repos/blockly/blockly_compressed.js"));
app.use("/blocks_compressed.js", express.static("./../repos/blockly/blocks_compressed.js"));


app.listen(port, function(){
    console.log(`Listening on port ${port}!`);
});