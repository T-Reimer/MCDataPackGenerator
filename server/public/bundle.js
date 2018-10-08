(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

$( document ).ready(function(){
    require("load");
});
},{"load":19}],2:[function(require,module,exports){
// load all of the blocks
console.log("Load Blockly");
require("./generators/functions.js");

// require("./blocks/string.js");
// require("./blocks/say.js");
require("./loadAllBlocks.js");

const FunctionsBlockly = require("./functions");

const blocklyDiv = document.getElementById('content');
module.exports.blocklyDiv = blocklyDiv;

/**
 * get the blockly div
 */
module.exports.getDiv = function(){
    return document.getElementById("content");
};

/**
 * the main workspace varaible
 */
let workspace = null;
module.exports.workspace = workspace;
window.workspace = workspace;

/**
 * 
 */
module.exports.start = function () {

    workspace = Blockly.inject(blocklyDiv,
        { toolbox: document.getElementById('toolbox') });

    function myUpdateFunction(event) {
        var code = Blockly.Functions.workspaceToCode(workspace);
        console.log("%c---------------------", "color: grey;");
        console.log(code);
        console.log("%c---------------------", "color: grey;");

    }
    workspace.addChangeListener(myUpdateFunction);
};

/**
 * Open a file in blockly
 * 
 * @param {String} name 
 * @param {Object} file 
 */
module.exports.open = function (name, file) {
    if(workspace){
        workspace.close();
    }
    console.log("%cOpen blockly", "color: green;", name);
    switch (name) {
        case "functions":
            workspace = new FunctionsBlockly(file);
            break;
        default:
    }
    console.log("Workspace", workspace);
    return workspace;
};
},{"./functions":11,"./generators/functions.js":12,"./loadAllBlocks.js":13}],3:[function(require,module,exports){
const colour = require("blockly/colour");
const minecraft = require("minecraft");
const blockStates = minecraft.blockState;


const blocks = (function(){
    let tmp = [];
    blockStates.list.forEach(function(block){
        block.item.forEach(function(name){
            if(!tmp.includes(name)){
                tmp.push(name);
            }
        });
    });

    let list = [];
    tmp.forEach(function(id){
        let name = minecraft.getItemName(id);
        if(!name){
            name = id;
        }
        list.push([name, id]);
    });
    return list.sort(function(a, b){
        if(a[0] === b[0]){
            return 0;
        }
        if(a[0] > b[0]){
            return 1;
        } else{
            return -1;
        }
    });
})();

let options = {
    "message0": "Block %1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "BLOCK",
            "options": blocks
        }
    ],
    "output": "String",
    "colour": colour.blocks,
    "tooltip": "Add a block state to a block.",
    "helpUrl": "",
    "mutator": "block_state_mutator"
};

Blockly.Blocks['item_data'] = {
    init: function () {
        this.jsonInit(options);
    }
};

Blockly.Functions["item_data"] = function (block) {
    let val = block.getFieldValue("BLOCK") || "";
    // return val;
    return [val, Blockly.Functions.ORDER_MEMBER];
};


Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
    // Block for text value
    {
      "type": "block_state_create_join_container",
      "message0": "add blockstates %1 %2",
      "args0": [{
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STACK"
      }],
      "colour": colour.blocks,
      "tooltip": "add, remove or reorder items to reconfigure this blockstate block",
      "enableContextMenu": false
    },
    {
      "type": "block_state_create_join_item",
      "message0": "blockstate",
      "previousStatement": null,
      "nextStatement": null,
      "colour": colour.blocks,
      "tooltip": "add a blockstate input",
      "enableContextMenu": false
    }
  ]);

// copied from blockly text.js
const mutator = {
    /**
     * Create XML to represent number of text inputs.
     * @return {!Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    /**
     * Parse XML to restore the text inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('block_state_create_join_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('block_state_create_join_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function () {
        if (this.itemCount_ && this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
            this.appendDummyInput('EMPTY')
                .appendField(this.newQuote_(true))
                .appendField(this.newQuote_(false));
        }
        // Add new inputs.
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i);
                if (i == 0) {
                    input.appendField(Blockly.Msg['TEXT_JOIN_TITLE_CREATEWITH']);
                }
            }
        }
        // Remove deleted inputs.
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }
    }
};

const extension = function () {
    // Add the quote mixin for the itemCount_ = 0 case.
    this.mixin(Blockly.Constants.Text.QUOTE_IMAGE_MIXIN);
    // Initialize the mutator values.
    this.itemCount_ = 2;
    this.updateShape_();
    // Configure the mutator UI.
    this.setMutator(new Blockly.Mutator(['block_state_create_join_item']));
};


Blockly.Extensions.registerMutator('block_state_mutator', mutator, extension);
},{"blockly/colour":10,"minecraft":23}],4:[function(require,module,exports){
Blockly.Blocks['coords'] = {
    init: function () {
      this.jsonInit({
        "message0": '"X %1 Y %2 Z %3"',
        "args0": [
          {
            "type": "field_input",
            "name": "X",
            "text": "~"
          }, {
            "type": "field_input",
            "name": "Y",
            "text": "~"
          },{
            "type": "field_input",
            "name": "Z",
            "text": "~"
          }
        ],
        "output": "String",
        "colour": 160,
        "tooltip": "Set a value with a string",
        "helpUrl": ""
      });
    }
  };
  
  Blockly.Functions["coords"] = function (block) {
    let x = block.getFieldValue("X");
    let y = block.getFieldValue("Y");
    let z = block.getFieldValue("Z");

    let val = x + " " + y + " " + z;
    // return val;
    return [val, Blockly.Functions.ORDER_MEMBER];
  };
},{}],5:[function(require,module,exports){
const colours = require("blockly/colour");

Blockly.Blocks['files'] = {
    init: function () {
        this.jsonInit({
            "message0": 'Function: %1 .mcfunction',
            "args0": [
                {
                    "type": "field_input",
                    "name": "NAME",
                    "text": ""
                }
            ],
            "message1": "do %1",
            "args1": [
                { "type": "input_statement", "name": "DO" }
            ],
            // "previousStatement": null,
            // "nextStatement": null,
            "colour": colours.functions,
            "tooltip": "Set a block at location",
            "helpUrl": "Creates a new Functions File"
        });
    }
};

Blockly.Functions["files"] = function (block) {
    // Search the text for a substring.
    // let code = Blockly.Functions.valueToCode(block, 'DO', Blockly.Functions.ORDER_NONE) || "";
    let name = block.getFieldValue("NAME");
    let code = `# Starting file ${name}\n`;
    code += Blockly.Functions.statementToCode(block, 'DO');

    return code;
};
},{"blockly/colour":10}],6:[function(require,module,exports){
const items = require("minecraft").items;
for(let i = 0; i < items.length; i++){

    items[i][1] = "minecraft:" + items[i][1];
}

let options = {
    "message0": "%1",
    "args0": [
        {
            "type": "field_dropdown",
            "name": "BLOCK",
            "options": items
        }
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "set the block or item type",
    "helpUrl": ""
};

// console.log(options);

Blockly.Blocks['items'] = {
    init: function () {
        this.jsonInit(options);
    }
};

Blockly.Functions["items"] = function (block) {
    let val = block.getFieldValue("BLOCK") || "minecraft: stone";
    // return val;
    return [val, Blockly.Functions.ORDER_MEMBER];
};
},{"minecraft":23}],7:[function(require,module,exports){
Blockly.Blocks['say'] = {
    init: function () {
        this.jsonInit({
            "message0": '/say %1',
            "args0": [
                {
                    "type": "input_value",
                    "name": "VALUE",
                    "check": "String"
                }
            ],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": 160,
            "tooltip": "Displays a message to multiple players.",
            "helpUrl": "https://minecraft.gamepedia.com/Commands/say"
        });
    }
};

Blockly.Functions["say"] = function (block) {
    // Search the text for a substring.
    let val = Blockly.Functions.valueToCode(block, 'VALUE', Blockly.Functions.ORDER_NONE) || "";

    let command = "/say " + val + "\n";
    return command;
};
},{}],8:[function(require,module,exports){
const colours = require("blockly/colour");

Blockly.Blocks['setblock'] = {
    init: function () {
        this.jsonInit({
            "message0": '/setblock coords %1',
            "args0": [
                {
                    "type": "input_value",
                    "name": "COORDS",
                    "check": "String"
                }
            ],
            "message1": "block %1",
            "args1": [{
                "type": "input_value",
                "name": "BLOCK",
                "check": "String"
            }],
            "message2": "mode %1",
            "args2": [{
                "type": "field_dropdown",
                "name": "MODE",
                "options": [
                    ["Replace", "replace"],
                    ["Keep", "keep"],
                    ["Destroy", "destroy"]
                ]
            }],
            "previousStatement": "Action",
            "nextStatement": "Action",
            "colour": colours.blocks,
            "tooltip": "Set a block at location",
            "helpUrl": "https://minecraft.gamepedia.com/Commands/setblock"
        });
    }
};

Blockly.Functions["setblock"] = function (block) {
    // Search the text for a substring.
    let coords = Blockly.Functions.valueToCode(block, 'COORDS', Blockly.Functions.ORDER_NONE) || "~ ~ ~";

    let blockName = Blockly.Functions.valueToCode(block, 'BLOCK', Blockly.Functions.ORDER_NONE) || "minecraft:stone";

    let mode = block.getFieldValue("MODE") || "";

    let command = "/setblock " + coords + " " + blockName + " " + mode + "\n";
    return command;
};
},{"blockly/colour":10}],9:[function(require,module,exports){
Blockly.Blocks['string'] = {
  init: function () {
    this.jsonInit({
      "message0": '"%1"',
      "args0": [
        {
          "type": "field_input",
          "name": "TEXT",
          "text": ""
        }
      ],
      "output": "String",
      "colour": 160,
      "tooltip": "Set a value with a string",
      "helpUrl": ""
    });
  }
};

Blockly.Functions["string"] = function (block) {
  let val = block.getFieldValue("TEXT");
  // return val;
  return [val, Blockly.Functions.ORDER_MEMBER];
};
},{}],10:[function(require,module,exports){
module.exports = {
    text: 160,
    blocks: 320,
    functions: 50
};
},{}],11:[function(require,module,exports){
const Workspace = require("./workspace");

class FunctionsBlockly{

    constructor(file){
        this.Workspace = new Workspace(file);

        let xml = file.file.data.functions.blockly_xml;
        this.Workspace.open(xml);
        
        this.Workspace.on("change", function(workspace, Blockly, xml){
            let code = Blockly.Functions.workspaceToCode(workspace);

            file.setBlocklyData("functions", xml, code);
            console.log(code, file);
        });
        console.log(this);
    }

    close(){
        this.Workspace.close();
    }
}

module.exports = FunctionsBlockly;
},{"./workspace":14}],12:[function(require,module,exports){
'use strict';


/**
 * Functions code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Functions = new Blockly.Generator('Functions');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Functions.addReservedWords('Blockly, execute');

/**
 * Order of operation ENUMs.
 * https://developer.mozilla.org/en/Functions/Reference/Operators/Operator_Precedence
 */
Blockly.Functions.ORDER_ATOMIC = 0;           // 0 "" ...
Blockly.Functions.ORDER_NEW = 1.1;            // new
Blockly.Functions.ORDER_MEMBER = 1.2;         // . []
Blockly.Functions.ORDER_FUNCTION_CALL = 2;    // ()
Blockly.Functions.ORDER_INCREMENT = 3;        // ++
Blockly.Functions.ORDER_DECREMENT = 3;        // --
Blockly.Functions.ORDER_BITWISE_NOT = 4.1;    // ~
Blockly.Functions.ORDER_UNARY_PLUS = 4.2;     // +
Blockly.Functions.ORDER_UNARY_NEGATION = 4.3; // -
Blockly.Functions.ORDER_LOGICAL_NOT = 4.4;    // !
Blockly.Functions.ORDER_TYPEOF = 4.5;         // typeof
Blockly.Functions.ORDER_VOID = 4.6;           // void
Blockly.Functions.ORDER_DELETE = 4.7;         // delete
Blockly.Functions.ORDER_AWAIT = 4.8;          // await
Blockly.Functions.ORDER_EXPONENTIATION = 5.0; // **
Blockly.Functions.ORDER_MULTIPLICATION = 5.1; // *
Blockly.Functions.ORDER_DIVISION = 5.2;       // /
Blockly.Functions.ORDER_MODULUS = 5.3;        // %
Blockly.Functions.ORDER_SUBTRACTION = 6.1;    // -
Blockly.Functions.ORDER_ADDITION = 6.2;       // +
Blockly.Functions.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
Blockly.Functions.ORDER_RELATIONAL = 8;       // < <= > >=
Blockly.Functions.ORDER_IN = 8;               // in
Blockly.Functions.ORDER_INSTANCEOF = 8;       // instanceof
Blockly.Functions.ORDER_EQUALITY = 9;         // == != === !==
Blockly.Functions.ORDER_BITWISE_AND = 10;     // &
Blockly.Functions.ORDER_BITWISE_XOR = 11;     // ^
Blockly.Functions.ORDER_BITWISE_OR = 12;      // |
Blockly.Functions.ORDER_LOGICAL_AND = 13;     // &&
Blockly.Functions.ORDER_LOGICAL_OR = 14;      // ||
Blockly.Functions.ORDER_CONDITIONAL = 15;     // ?:
Blockly.Functions.ORDER_ASSIGNMENT = 16;      // = += -= **= *= /= %= <<= >>= ...
Blockly.Functions.ORDER_YIELD = 17;         // yield
Blockly.Functions.ORDER_COMMA = 18;           // ,
Blockly.Functions.ORDER_NONE = 99;            // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
Blockly.Functions.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Blockly.Functions.ORDER_FUNCTION_CALL, Blockly.Functions.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Blockly.Functions.ORDER_FUNCTION_CALL, Blockly.Functions.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Blockly.Functions.ORDER_MEMBER, Blockly.Functions.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Blockly.Functions.ORDER_MEMBER, Blockly.Functions.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Blockly.Functions.ORDER_LOGICAL_NOT, Blockly.Functions.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Blockly.Functions.ORDER_MULTIPLICATION, Blockly.Functions.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Blockly.Functions.ORDER_ADDITION, Blockly.Functions.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Blockly.Functions.ORDER_LOGICAL_AND, Blockly.Functions.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Blockly.Functions.ORDER_LOGICAL_OR, Blockly.Functions.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Functions.init = function (workspace) {
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Functions.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Functions.functionNames_ = Object.create(null);

  if (!Blockly.Functions.variableDB_) {
    Blockly.Functions.variableDB_ =
      new Blockly.Names(Blockly.Functions.RESERVED_WORDS_);
  } else {
    Blockly.Functions.variableDB_.reset();
  }

  Blockly.Functions.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.Functions.variableDB_.getName(devVarList[i],
      Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.Functions.variableDB_.getName(variables[i].getId(),
      Blockly.Variables.NAME_TYPE));
  }

  // Declare all of the variables.
  if (defvars.length) {
    Blockly.Functions.definitions_['variables'] =
      'var ' + defvars.join(', ') + '';
    // 'var ' + defvars.join(', ') + ';';
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Functions.finish = function (code) {
  // Convert the definitions dictionary into a list.
  var definitions = [];
  for (var name in Blockly.Functions.definitions_) {
    definitions.push(Blockly.Functions.definitions_[name]);
  }
  // Clean up temporary data.
  delete Blockly.Functions.definitions_;
  delete Blockly.Functions.functionNames_;
  Blockly.Functions.variableDB_.reset();
  return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Functions.scrubNakedValue = function (line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Functions string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Functions string.
 * @private
 */
Blockly.Functions.quote_ = function (string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string.replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\\n')
    .replace(/'/g, '\\\'');
  return '\'' + string + '\'';
};

/**
 * Common tasks for generating Functions from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Functions code created for this block.
 * @return {string} Functions code with comments and subsequent blocks added.
 * @private
 */
Blockly.Functions.scrub_ = function (block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.Functions.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '' +
          Blockly.Functions.prefixLines(comment + '\n', '# ') +
          '';
      } else {
        commentCode += Blockly.Functions.prefixLines(comment + '\n', '# ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Functions.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Functions.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Functions.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Blockly.Functions.getAdjusted = function (block, atId, opt_delta, opt_negate,
  opt_order) {
  var delta = opt_delta || 0;
  var order = opt_order || Blockly.Functions.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  var defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  if (delta > 0) {
    var at = Blockly.Functions.valueToCode(block, atId,
      Blockly.Functions.ORDER_ADDITION) || defaultAtIndex;
  } else if (delta < 0) {
    var at = Blockly.Functions.valueToCode(block, atId,
      Blockly.Functions.ORDER_SUBTRACTION) || defaultAtIndex;
  } else if (opt_negate) {
    var at = Blockly.Functions.valueToCode(block, atId,
      Blockly.Functions.ORDER_UNARY_NEGATION) || defaultAtIndex;
  } else {
    var at = Blockly.Functions.valueToCode(block, atId, order) ||
      defaultAtIndex;
  }

  if (Blockly.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseFloat(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      var innerOrder = Blockly.Functions.ORDER_ADDITION;
    } else if (delta < 0) {
      at = at + ' - ' + -delta;
      var innerOrder = Blockly.Functions.ORDER_SUBTRACTION;
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
      var innerOrder = Blockly.Functions.ORDER_UNARY_NEGATION;
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};

},{}],13:[function(require,module,exports){
require("./blocks/say");
require("./blocks/setBlock");
require("./blocks/string");
require("./blocks/items");
require("blockly/blocks/blockState");
require("./blocks/coords");
require("./blocks/file/files");
},{"./blocks/coords":4,"./blocks/file/files":5,"./blocks/items":6,"./blocks/say":7,"./blocks/setBlock":8,"./blocks/string":9,"blockly/blocks/blockState":3}],14:[function(require,module,exports){
const JSEvents = require("jsevents");
const blockly = require("blockly");


/**
 * Create a workspace
 */
class Workspace {

    /**
     * Create a workspace
     * 
     * @param {ProjectFile} file 
     */
    constructor(file) {
        this.file = file;
        this.events = new JSEvents(this);

    }

    open(xml_text) {
        const that = this;

        const options = {
            toolbox: document.getElementById('toolbox'),
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.1
            },
            trashcan: true
        };
        let workspace = Blockly.inject(blockly.getDiv(), options);

        if (xml_text) {
            const xml = Blockly.Xml.textToDom(xml_text);
            Blockly.Xml.domToWorkspace(xml, workspace);
        }
        this.workspace = workspace;

        // run when a change was made in blockly
        workspace.addChangeListener(function () {
            var xml = Blockly.Xml.workspaceToDom(workspace);
            var xml_text = Blockly.Xml.domToText(xml);

            that.onChange(that.workspace, Blockly, xml_text);
        });
    }

    onChange() {
        this.events.triggerCallback("change", this, arguments);
    }

    close(){
        blockly.getDiv().innerHTML = "";
    }
}

module.exports = Workspace;
},{"blockly":2,"jsevents":17}],15:[function(require,module,exports){
let idNum = 0;
const html = require("html");
const JSEvents = require("jsevents");

class FileTree{
    
    /**
     * 
     * @param {Element} ul html element to put the file tree under
     * @param {Object} structure the file structure to use
     */
    constructor(ul, structure, options){
        this.setup();

        this.structure = structure;

        if(options){
            this.options = options;
            
            if(options.name){
                this.name = options.name;
            } else{
                this.name = html.newId();
            }
        }

        this.setupParent(ul);
        this.createHtml();
    }

    /**
     * run the class setup vars
     */
    setup(){
        this.events = new JSEvents(this);
        const that = this;
        this.name = "";
        this.selected = null;

        this.html = document.createElement("ul");
        if(!this.options){
            this.options = {};
        }

        this.radioName = html.newId(10) + "-radioName";

        // store the data and elements here
        this.files = [];
        this.dirs = [];

        // add some event listeners
        this.on("new", function(){
            that.triggerEvent("changed", [this.data]);
        });
    }

    /**
     * Get the data for this file structure
     */
    get data(){
        return this.structure;
    }

    /**
     * Create a new object for file or dir
     * 
     * @param {String} type the type of file
     */
    createNew(t){
        let type = "file";
        let con = "";
        if(t === "dir"){
            type = "dir";
            con = [];
        }

        let data = {
            type: type,
            name: "",
            contents: con
        }

        return data;
    }

    /**
     * delete a file or directory
     * 
     * this will return the file/dir that was removed
     * 
     * @param {Object} data the object to match to
     */
    delete(data){

        if(this.selected === data){
            this.selected = null;
        }

        let removed = null;

        // get and remove the dom element
        let d = this.getElement(data);
        if(d && d.el && d.el.parentNode){
            d.el.parentNode.removeChild(d.el);
        }

        checkDirs(this.structure);

        return removed;

        function checkDirs(obj){

            for(let i = 0; i < obj.length; i++){
                if(removed){
                    return;
                }

                if(obj[i] === data){
                    removed = obj.splice(i, 1);
                    return;
                }

                if(obj[i].type === "dir"){
                    checkDirs(obj[i].contents);

                    if(removed){
                        return;
                    }
                }
            }

        }
    }

    /**
     * set the current selection
     * 
     * @param {Object} data 
     */
    setSelection(data){
        let prev = this.selected;
        this.selected = data;

        this.triggerEvent("selected", [data, prev]);

        if(data){
            if(data.type === "dir"){
                this.triggerEvent("dir-opened", [data, prev]);
            } else{
                this.triggerEvent("file-opened", [data, prev]);
            }
        }
    }

    /**
     * gets the directory selected. 
     * 
     * if its a file that is selected then it returns the files parent
     * if the file is in the root then it returns the entire tree
     */
    getSelectionDir(){
        let sel = this.selected;
        if(!sel){
            return this.structure;
        }
        if(sel.type === "dir"){
            return sel;
        }

        // check if it matches one of the root files
        for(let i = 0; i < this.structure.length; i++){
            if(sel === this.structure[i]){
                return this.structure;
            }
            if(this.structure[i].type === "dir"){
                let m = match(this.structure[i]);
                if(m){
                    return m;
                }
            }
        }

        return sel;

        function match(m){
            for(let i = 0; i < m.contents.length; i++){
                if(m.contents[i] === sel){
                    return m;
                }
                if(m.contents[i].type === "dir"){
                    let mat = match(m.contents[i]);
                    if(mat){
                        return mat;
                    }
                }
            }
            return null;
        }
    }

    /**
     * check if the dir given is the root directory
     * 
     * @param {*} data 
     */
    isRoot(data){
        return this.structure === data;
    }

    /**
     * get the element for the given data
     * 
     * @param {Object} data get the element for the given data
     */
    getElement(data){
        if(!data){
            return null;
        }
        for(let i = 0; i < this.files.length; i++){
            if(this.files[i].data === data){
                return this.files[i];
            }
        }
        for(let i = 0; i < this.dirs.length; i++){
            if(this.dirs[i].data === data){
                return this.dirs[i];
            }
        }
        return null;
    }

    /**
     * trigger a event callback
     * 
     * @param {String} event the event name
     * @param {Object} args the args to pass into function
     */
    triggerEvent(event, args){
        this.events.triggerCallback(event, this, args);
    }

    /**
     * edit a file or dir name
     * 
     * @param {Object} data the file or dir object
     * @returns {Promise}
     */
    async editName(data){
        const that = this;
        return new Promise(function(resolve, reject){
            if(!data){
                throw new Error("Incorrect data to edit the file name");
            }

            let d = that.getElement(data);
            let li = d.el;

            // get the name element
            let span = li.getElementsByClassName("file-name")[0];
            span.style.display = "none";
            let runAlready = false;

            let input = document.createChild("input", {
                type: "text",
                on: {
                    focusout: setName,
                    change: setName,
                    keyup: function(event){
                        if(event.keyCode === 13){
                            setName.apply(this, arguments);
                        }

                    }
                }
            });
            span.parentNode.insertBefore(input, span);

            function reset(){
                // remove the input element
                input.parentNode.removeChild(input);

                span.style.display = "";

                that.updateDom();
            }

            function setName(event){
                if(runAlready){
                    return;
                }
                runAlready = true;
                let name = this.value.trim().toLowerCase();
                // replace all ilegal characters with a `-`
                name = name.replace(/[^a-zA-Z0-9-_.]/g, "-");

                if(name === ""){
                    that.delete(data);
                    reset();
                    throw new Error("File name can't be empty");
                }

                // TODO: check if the name already exists in the directory

                data.name = name;

                reset();

                resolve(data);
            }
        });
    }

    /**
     * setup the main element
     * 
     * @param {Element} ul the parent element
     */
    setupParent(ul){
        const that = this;
        let parentId = this.name + "-menu-" + html.newId();
        // <li class="active border-top border-bottom">
        let li = ul.createChild("li", {
            classList: ["active", "border-top", "border-bottom"],
            on: {
                click: function(){
                    that.triggerEvent("selected", []);
                }
            }
        });

        // <a href="#advancements-menu" data-toggle="collapse" aria-expanded="false" class="btn">
        li.createChild("a", {
            href: "#" + parentId,
            "data-toggle": "collapse",
            "aria-expanded": "false",
            classList: ["btn"],
            text: this.name
        });

        //<a class="material-icons">note_add</a>
        li.createChild("a", {
            classList: ["material-icons", "add-new-icon"],
            text: "note_add",
            on: {
                click: function(){
                    // show a new file element
                    let data = that.createNew("file");

                    // get the parent of the current selection
                    let parentDir = that.getSelectionDir();

                    if(that.isRoot(parentDir)){
                        parentDir.push(data);
                    } else{
                        parentDir.contents.push(data);
                    }

                    that.updateDom();

                    that.editName(data)
                        .then(function(newData){

                            that.triggerEvent("new", [data]);
                            that.triggerEvent("new-file", [data]);
                        })
                        .catch(function(err){
                            that.triggerEvent("error", [err]);
                            console.error(err);
                        });
                }
            }
        });

        // <a class="material-icons">create_new_folder</a>
        li.createChild("a", {
            classList: ["material-icons", "add-new-icon"],
            text: "create_new_folder",
            on: {
                click: function(){
                    // show a new folder element
                    let data = that.createNew("dir");

                    // get the parent of the current selection
                    let parentDir = that.getSelectionDir();

                    if(that.isRoot(parentDir)){
                        parentDir.push(data);
                    } else{
                        parentDir.contents.push(data);
                    }

                    that.updateDom();

                    that.editName(data)
                        .then(function(newData){

                            that.triggerEvent("new", [data]);
                            that.triggerEvent("new-dir", [data]);
                        })
                        .catch(function(err){
                            that.triggerEvent("error", [err]);
                            console.error(err);
                        });
                }
            }
        });

        //<ul class="folder collapse list-unstyled" id="advancements-menu">
        let parent = li.createChild("ul", {
            classList: ["folder", "collapse", "list-unstyled"],
            id: parentId
        });

        this.parent = parent;
    }

    /**
     * update the DOM element to the current state
     */
    updateDom(){
        const that = this;
        update(this.structure, this.html);

        function update(contents, html){
            let nextParent;

            for(let i = 0; i < contents.length; i++){
                let d = contents[i];

                let data = that.getElement(d);
                let el;
                if(data){
                    el = data.el;
                }
    
                if(!el){

                    if(d.type === "dir"){
                        html.appendChild(that.createDirectory(d));
                    } else{
                        html.appendChild(that.createFile(d));
                    }
                }

                if(el){
                    // get the name element and update the text
                    let span = el.getElementsByClassName("file-name")[0];

                    if(span){
                        span.innerText = d.name;
                    }

                    if(d.type === "dir"){
                        nextParent = el.getElementsByTagName("ul")[0];
                        if(nextParent){
                            update(d.contents, nextParent);
                        } else{
                            console.warn("Element not found", el);
                        }
                    }
                }
            }
        }

    }
    /**
     * create and update the html for this file tree
     * 
     * this function can be called at any time to recreate the file tree elements.
     * This will re-collapse all of the directories
     */
    createHtml(){
        this.html = document.createChild("ul", {
            classList: ["folder", "list-unstyled", "components"]
        });
        let html = this.html;

        this.parent.innerHTML = "";
        this.parent.appendChild(this.html);

        this.updateDom();
    }

    /**
     * create the directory list
     * 
     * @param {Object} data the directory object
     */
    createDirectory(data){
        const that = this;
        let li = document.createChild("li", {
            classList: ["btn-group-toggle"]
        });

        let id = html.newId();
        let radioId = id + "-radio";

        li.createChild("input", {
            type: "radio",
            name: this.radioName,
            autocomplete: "off",
            id: radioId
        });

        // <label href="#advancements-menu-folder" data-toggle="collapse" aria-expanded="false"
        //   class="file" for="adv-f1">
        let label = li.createChild("label", {
            href: "#" + id,
            "data-toggle": "collapse",
            "aria-expanded": "false",
            classList: ["file"],
            for: radioId,
            on: {
                click: function(){
                    that.setSelection(data);
                }
            }
        });

        // <i class="material-icons md-18">folder</i>
        label.createChild("i", {
            classList: ["material-icons", "md-18"],
            text: "folder"
        });
        label.createChild("span", {
            classList: ["file-name"],
            text: data.name
        });
        // label.appendChild(document.createTextNode(data.name));

        let child = li.createChild("ul", {
            classList: ["folder", "collapse", "list-unstyled"],
            id: id
        });

        for(let i = 0; i < data.contents.length; i++){
            let d = data.contents[i];

            if(d.type === "dir"){
                child.appendChild(this.createDirectory(d));
            } else{
                child.appendChild(this.createFile(d));
            }
        }
        this.addDir(li, data);
        return li;
    }

    /**
     * Create a file in the list
     * 
     * @param {Object} data to create the file
     */
    createFile(data){
        const that = this;
        let radioId = html.newId() + "-radio";

        let li = document.createChild("li");

        //<input id="adv-f1" type="radio" name="advancements-selected" autocomplete="off">

        li.createChild("input", {
            type: "radio",
            name: this.radioName,
            autocomplete: "off",
            id: radioId
        });

        // <label class="file" for="adv-f2">
        let label = li.createChild("label", {
            classList: ["file"],
            for: radioId,
            on: {
                click: function(){
                    that.setSelection(data);
                }
            }
        });

        // <i class="material-icons md-18">note</i>
        label.createChild("i", {
            classList: ["material-icons", "md-18"],
            text: "note"
        });
        label.createChild("span", {
            classList: ["file-name"],
            text: data.name
        });
        // label.appendChild(document.createTextNode(data.name));

        this.addFile(li, data);
        return li;
    }

    /**
     * add a file to the data list
     * 
     * @param {Element} el 
     * @param {Object} data 
     */
    addFile(el, data){
        for(let i = 0; i < this.files.length; i++){
            if(this.files[i].data === data){
                this.files[i].el = el;
                return;
            }
        }
        this.files.push({
            el: el,
            data: data
        });
    }

    /**
     * add a folder to the data list
     * 
     * @param {Element} el 
     * @param {Object} data 
     */
    addDir(el, data){
        for(let i = 0; i < this.dirs.length; i++){
            if(this.dirs[i].data === data){
                this.dirs[i].el = el;
                return;
            }
        }
        this.dirs.push({
            el: el,
            data: data
        });
    }
}

module.exports = FileTree;
},{"html":16,"jsevents":17}],16:[function(require,module,exports){
let ids = [];
const str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * create a random string with given length
 * 
 * @param {Number} len string length
 * @returns {String}
 */
function randomString(len){
    len = typeof len === "number" ? len : 8;
    let string = "";

    for(let i = 0; i < len; i++){
        let index = Math.round(Math.random() * (str.length - 1));
        string += str[index];
    }

    return string;
}

module.exports.random = randomString;

/**
 * create a unique html id
 * 
 * @param {Nubmer} len the length of the id
 */
function newId(len){
    let id = randomString(len);

    if(ids.includes(id)){
        return newId(len);
    }
    return id;
}

module.exports.newId = newId;
},{}],17:[function(require,module,exports){


class JSEvents{

    constructor(caller){
        this.events = {};
        const that = this;
        if (caller) {
            caller.on = function (event, callback) {
                that.on(event, callback);
            };
            caller.remove = function (event, callback) {
                that.remove(event, callback);
            };
        }
    }

    /**
     * create a event listener
     * 
     * @param {String} event the event name
     * @param {*} callback 
     */
    on(event, callback){
        if(event && typeof callback === "function"){
            if(!this.events[event]){
                this.events[event] = [];
            }

            this.events[event].push(callback);
        }
    }

    /**
     * Remove a event listener
     * 
     * @param {String} event the event name 
     * @param {*} callback 
     */
    remove(event, callback){
        if(this.events[event]){
            for(let i = this.events[event].length - 1; i >= 0; i--){
                if(callback === this.events[event][i]){
                    this.events[event].splice(i, 1);
                }
            }
        }
    }

    /**
     * trigger a callback event
     * 
     * @param {String} event the event name
     * @param {*} that 
     * @param {*} args 
     */
    triggerCallback(event, that, args){
        if(this.events[event]){
            for(let i = 0; i < this.events[event].length; i++){
                try{
                    this.events[event][i].apply(that, args);
                } catch(err){}
            }
        }
    }
}

module.exports = JSEvents;
},{}],18:[function(require,module,exports){

Element.prototype.createChild = function(type, options){
    let el = document.createChild(type, options);
    this.appendChild(el);

    return el;
};

/**
 * Create a Element with given options
 * 
 * @param {String} type Element name
 * @param {Object} options options to apply to element
 * 
 * @returns {Element}
 */
document.createChild = function(type, options){
    options = typeof options === "object" ? options : {};
    if(!options){
        options = {};
    }

    let el = document.createElement(type);

    if(options.text){
        el.appendChild(document.createTextNode(options.text));
    }

    let skip = ["on", "text", "childNodes", "classList"];
    for(let o in options){
        if(skip.includes(o)){
            continue;
        }
        el.setAttribute(o, options[o]);
    }

    if(typeof options.classList === "object"){
        for(let i = 0; i < options.classList.length; i++){
            if(options.classList[i] === ""){
                continue;
            }
            el.classList.add(options.classList[i]);
        }
    }

    if(typeof options.on === "object"){
        for(let e in options.on){
            el.addEventListener(e, options.on[e]);
        }
    }

    if(typeof options.childNodes === "object"){
        for(let i = 0; i < options.childNodes.length; i++){
            el.createChild(options.childNodes[i].type, options.childNodes[i].options);
        }
    }

    return el;
};
},{}],19:[function(require,module,exports){
(function (global){
// run onload of the doc
const project = require("projects");
window.projects = project;

// window.modal = require("modal");

require("./sidebar");
require("./createChild");

project.updateVisualList();

window.addEventListener("hashchange", function () {
    onHashChange();
});
onHashChange();

function onHashChange() {
    let hash = location.hash;
    if (hash.includes("#project_")) {
        let name = decodeURI(hash.replace("#project_", ""));

        project.open(name)
            .catch(function (err) {
                project.loadDemo();
            });
        console.log(name);
    } else {
        if (!global.openFile) {
            // get and save the demo file
            project.loadDemo();
        }
    }
}

/**
 * add event for the new project form
 */
$("#new-project-form").on("submit", function (event) {
    event.preventDefault();
    let file = null;

    project.new($(this).serializeArray())
        .then(function (f) {
            console.log(f);

            $('#projectsModal').modal('hide');
            $("#new-project-form-warning-div").hide();
        })
        .catch(function (err) {
            let msg = err.message;
            $("#new-project-form-warning").text(msg);
            $("#new-project-form-warning-div").show();
        });
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./createChild":18,"./sidebar":20,"projects":27}],20:[function(require,module,exports){
var min = 195;
var max = 400;
var mainmin = 150;

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {  
          $('#sidebar').css("width", x);
          $('#content').css("left", x + "px");
        }
    })
});
$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});
},{}],21:[function(require,module,exports){
const list = [
    {
        item: [ "anvil", "chipped_anvil", "damaged_anvil" ],
        states: [{
            name: "facing",
            value: [
                ["south", "south"],
                ["west", "west"],
                ["north", "north"],
                ["east", "east"]
            ],
            description: "This value is 90° clockwise from the direction a player faces while placing an anvil."
        }]
    }, {
        item: ["white_banner",
            "orange_banner",
            "magenta_banner",
            "light_blue_banner",
            "yellow_banner",
            "lime_banner",
            "pink_banner",
            "gray_banner",
            "light_gray_banner",
            "cyan_banner",
            "purple_banner",
            "blue_banner",
            "brown_banner",
            "green_banner",
            "red_banner",
            "black_banner",
            "white_wall_banner",
            "orange_wall_banner",
            "magenta_wall_banner",
            "light_blue_wall_banner",
            "yellow_wall_banner",
            "lime_wall_banner",
            "pink_wall_banner",
            "gray_wall_banner",
            "light_gray_wall_banner",
            "cyan_wall_banner",
            "purple_wall_banner",
            "blue_wall_banner",
            "brown_wall_banner",
            "green_wall_banner",
            "red_wall_banner",
            "black_wall_banner"],
        states: [
            {
                name: "rotation",
                value: [["south", 0],
                ["south-southwest", 1],
                ["southwest", 2],
                ["west-southwest", 3],
                ["west", 4],
                ["west-northwest", 5],
                ["northwest", 6],
                ["north-northwest", 7],
                ["north", 8],
                ["north-northeast", 9],
                ["northeast", 10],
                ["east-northeast", 11],
                ["east", 12],
                ["east-southeast", 13],
                ["southeast", 14],
                ["south-southeast", 15]],
                description: "The direction a floor banner is facing"
            }, {
                name: "facing",
                value: [
                    ["south", "south"],
                    ["west", "west"],
                    ["north", "north"],
                    ["east", "east"]
                ],
                description: "The direction the wall banner is facing."
            }
        ]
    },{
        item: [ "white_bed",
        "orange_bed",
        "magenta_bed",
        "light_blue_bed",
        "yellow_bed",
        "lime_bed",
        "pink_bed",
        "gray_bed",
        "light_gray_bed",
        "cyan_bed",
        "purple_bed",
        "blue_bed",
        "brown_bed",
        "green_bed",
        "red_bed",
        "black_bed" ],
        states: [{
            name: "facing",
            value: [
                ["south", "south"],
                ["west", "west"],
                ["north", "north"],
                ["east", "east"]
            ],
            description: "The direction the head of the bed is pointing."
        }, {
            name: "occupied",
            value: [
                ["True", "true"],
                ["False", "false"]
            ],
            description: "True when a player is using the bed."
        }, {
            name: "part",
            value: [
                ["Head", "head"],
                ["Foot", "foot"]
            ],
            description: "The half of the bed in the current block."
        }]
    }
];

const ItemTemplate = {
    item: [],
    states: [{
        name: "",
        value: [["a", 1]]
    }]
};

for(let i = 0; i < list.length; i++){
    let item = list[i].item;
    for(let j = 0; j < item.length; j++){
        let name = item[j];
        if(!name.includes("minecraft:")){
            item[j] = "minecraft:" + name;
        }
    }
}

console.table(list);

module.exports.list = list;
},{}],22:[function(require,module,exports){
const list = [["Stone", "stone"],
["Granite", "granite"],
["Polished Granite", "polished_granite"],
["Diorite", "diorite"],
["Polished Diorite", "polished_diorite"],
["Andesite", "andesite"],
["Polished Andesite", "polished_andesite"],
["Grass Block", "grass_block"],
["Dirt", "dirt"],
["Coarse Dirt", "coarse_dirt"],
["Podzol", "podzol"],
["Oak Planks", "oak_planks"],
["Spruce Planks", "spruce_planks"],
["Birch Planks", "birch_planks"],
["Jungle Planks", "jungle_planks"],
["Acacia Planks", "acacia_planks"],
["Dark Oak Planks", "dark_oak_planks"],
["Oak Sapling", "oak_sapling"],
["Spruce Sapling", "spruce_sapling"],
["Birch Sapling", "birch_sapling"],
["Jungle Sapling", "jungle_sapling"],
["Acacia Sapling", "acacia_sapling"],
["Dark Oak Sapling", "dark_oak_sapling"],
["Sand", "sand"],
["Red Sand", "red_sand"],
["Oak Log", "oak_log"],
["Spruce Log", "spruce_log"],
["Birch Log", "birch_log"],
["Jungle Log", "jungle_log"],
["Oak Wood", "oak_wood"],
["Spruce Wood", "spruce_wood"],
["Birch Wood", "birch_wood"],
["Jungle Wood", "jungle_wood"],
["Acacia Log", "acacia_log"],
["Dark Oak Log", "dark_oak_log"],
["Acacia Wood", "acacia_wood"],
["Dark Oak Wood", "dark_oak_wood"],
["Oak Leaves", "oak_leaves"],
["Spruce Leaves", "spruce_leaves"],
["Birch Leaves", "birch_leaves"],
["Jungle Leaves", "jungle_leaves"],
["Acacia Leaves", "acacia_leaves"],
["Dark Oak Leaves", "dark_oak_leaves"],
["Sponge", "sponge"],
["Wet Sponge", "wet_sponge"],
["Sandstone", "sandstone"],
["Chiseled Sandstone", "chiseled_sandstone"],
["Cut Sandstone", "cut_sandstone"],
["Note Block", "note_block"],
["Powered Rail", "powered_rail"],
["Cobweb", "cobweb"],
["Dead Bush", "dead_bush"],
["Grass", "grass"],
["Fern", "fern"],
["Dead Bush", "dead_bush"],
["Moving Piston", "moving_piston"],
["White Wool", "white_wool"],
["Orange Wool", "orange_wool"],
["Magenta Wool", "magenta_wool"],
["Light Blue Wool", "light_blue_wool"],
["Yellow Wool", "yellow_wool"],
["Lime Wool", "lime_wool"],
["Pink Wool", "pink_wool"],
["Gray Wool", "gray_wool"],
["Light Gray Wool", "light_gray_wool"],
["Cyan Wool", "cyan_wool"],
["Purple Wool", "purple_wool"],
["Blue Wool", "blue_wool"],
["Brown Wool", "brown_wool"],
["Green Wool", "green_wool"],
["Red Wool", "red_wool"],
["Black Wool", "black_wool"],
["Dandelion", "dandelion"],
["Poppy", "poppy"],
["Blue Orchid", "blue_orchid"],
["Allium", "allium"],
["Azure Bluet", "azure_bluet"],
["Red Tulip", "red_tulip"],
["Orange Tulip", "orange_tulip"],
["White Tulip", "white_tulip"],
["Pink Tulip", "pink_tulip"],
["Oxeye Daisy", "oxeye_daisy"],
["Oak Slab", "oak_slab"],
["Spruce Slab", "spruce_slab"],
["Birch Slab", "birch_slab"],
["Jungle Slab", "jungle_slab"],
["Acacia Slab", "acacia_slab"],
["Dark Oak Slab", "dark_oak_slab"],
["Stone Slab", "stone_slab"],
["Sandstone Slab", "sandstone_slab"],
["Petrified Oak Slab", "petrified_oak_slab"],
["Cobblestone Slab", "cobblestone_slab"],
["Brick Slab", "brick_slab"],
["Stone Brick Slab", "stone_brick_slab"],
["Nether Brick Slab", "nether_brick_slab"],
["Quartz Slab", "quartz_slab"],
["Smooth Stone", "smooth_stone"],
["Smooth Sandstone", "smooth_sandstone"],
["Smooth Quartz", "smooth_quartz"],
["Red Sandstone Slab", "red_sandstone_slab"],
["Smooth Red Sandstone", "smooth_red_sandstone"],
["Purpur Slab", "purpur_slab"],
["Bricks", "bricks"],
["Spawner", "spawner"],
["Nether Portal", "nether_portal"],
["Wall Torch", "wall_torch"],
["Torch", "torch"],
["Furnace", "furnace"],
["Cobblestone Stairs", "cobblestone_stairs"],
["Oak Pressure Plate", "oak_pressure_plate"],
["Redstone Ore", "redstone_ore"],
["Redstone Wall Torch", "redstone_wall_torch"],
["Redstone Torch", "redstone_torch"],
["Snow", "snow"],
["Snow Block", "snow_block"],
["Oak Fence", "oak_fence"],
["Carved Pumpkin", "carved_pumpkin"],
["Jack o\"Lantern", "jack_o_lantern"],
["Oak Trapdoor", "oak_trapdoor"],
["Infested Stone", "infested_stone"],
["Infested Cobblestone", "infested_cobblestone"],
["Infested Stone Bricks", "infested_stone_bricks"],
["Infested Mossy Stone Bricks", "infested_mossy_stone_bricks"],
["Infested Cracked Stone Bricks", "infested_cracked_stone_bricks"],
["Infested Chiseled Stone Bricks", "infested_chiseled_stone_bricks"],
["Stone Bricks", "stone_bricks"],
["Mossy Stone Bricks", "mossy_stone_bricks"],
["Cracked Stone Bricks", "cracked_stone_bricks"],
["Chiseled Stone Bricks", "chiseled_stone_bricks"],
["Brown Mushroom Block", "brown_mushroom_block"],
["Mushroom Stem", "mushroom_stem"],
["Red Mushroom Block", "red_mushroom_block"],
["Melon", "melon"],
["Oak Fence Gate", "oak_fence_gate"],
["Lily Pad", "lily_pad"],
["Nether Bricks", "nether_bricks"],
["End Stone Bricks", "end_stone_bricks"],
["Redstone Lamp", "redstone_lamp"],
["Cobblestone Wall", "cobblestone_wall"],
["Mossy Cobblestone Wall", "mossy_cobblestone_wall"],
["Oak Button", "oak_button"],
["Anvil", "anvil"],
["Chipped Anvil", "chipped_anvil"],
["Damaged Anvil", "damaged_anvil"],
["Daylight Detector", "daylight_detector"],
["Nether Quartz Ore", "nether_quartz_ore"],
["Block of Quartz", "quartz_block"],
["Chiseled Quartz Block", "chiseled_quartz_block"],
["Quartz Pillar", "quartz_pillar"],
["White Terracotta", "white_terracotta"],
["Orange Terracotta", "orange_terracotta"],
["Magenta Terracotta", "magenta_terracotta"],
["Light Blue Terracotta", "light_blue_terracotta"],
["Yellow Terracotta", "yellow_terracotta"],
["Lime Terracotta", "lime_terracotta"],
["Pink Terracotta", "pink_terracotta"],
["Gray Terracotta", "gray_terracotta"],
["Light Gray Terracotta", "light_gray_terracotta"],
["Cyan Terracotta", "cyan_terracotta"],
["Purple Terracotta", "purple_terracotta"],
["Blue Terracotta", "blue_terracotta"],
["Brown Terracotta", "brown_terracotta"],
["Green Terracotta", "green_terracotta"],
["Red Terracotta", "red_terracotta"],
["Black Terracotta", "black_terracotta"],
["White Carpet", "white_carpet"],
["Orange Carpet", "orange_carpet"],
["Magenta Carpet", "magenta_carpet"],
["Light Blue Carpet", "light_blue_carpet"],
["Yellow Carpet", "yellow_carpet"],
["Lime Carpet", "lime_carpet"],
["Pink Carpet", "pink_carpet"],
["Gray Carpet", "gray_carpet"],
["Light Gray Carpet", "light_gray_carpet"],
["Cyan Carpet", "cyan_carpet"],
["Purple Carpet", "purple_carpet"],
["Blue Carpet", "blue_carpet"],
["Brown Carpet", "brown_carpet"],
["Green Carpet", "green_carpet"],
["Red Carpet", "red_carpet"],
["Black Carpet", "black_carpet"],
["Terracotta", "terracotta"],
["Slime Block", "slime_block"],
["Sunflower", "sunflower"],
["Lilac", "lilac"],
["Double Tallgrass", "tall_grass"],
["Large Fern", "large_fern"],
["Rose Bush", "rose_bush"],
["Peony", "peony"],
["White Stained Glass", "white_stained_glass"],
["Orange Stained Glass", "orange_stained_glass"],
["Magenta Stained Glass", "magenta_stained_glass"],
["Light Blue Stained Glass", "light_blue_stained_glass"],
["Yellow Stained Glass", "yellow_stained_glass"],
["Lime Stained Glass", "lime_stained_glass"],
["Pink Stained Glass", "pink_stained_glass"],
["Gray Stained Glass", "gray_stained_glass"],
["Light Gray Stained Glass", "light_gray_stained_glass"],
["Cyan Stained Glass", "cyan_stained_glass"],
["Purple Stained Glass", "purple_stained_glass"],
["Blue Stained Glass", "blue_stained_glass"],
["Brown Stained Glass", "brown_stained_glass"],
["Green Stained Glass", "green_stained_glass"],
["Red Stained Glass", "red_stained_glass"],
["Black Stained Glass", "black_stained_glass"],
["White Stained Glass Pane", "white_stained_glass_pane"],
["Orange Stained Glass Pane", "orange_stained_glass_pane"],
["Magenta Stained Glass Pane", "magenta_stained_glass_pane"],
["Light Blue Stained Glass Pane", "light_blue_stained_glass_pane"],
["Yellow Stained Glass Pane", "yellow_stained_glass_pane"],
["Lime Stained Glass Pane", "lime_stained_glass_pane"],
["Pink Stained Glass Pane", "pink_stained_glass_pane"],
["Gray Stained Glass Pane", "gray_stained_glass_pane"],
["Light Gray Stained Glass Pane", "light_gray_stained_glass_pane"],
["Cyan Stained Glass Pane", "cyan_stained_glass_pane"],
["Purple Stained Glass Pane", "purple_stained_glass_pane"],
["Blue Stained Glass Pane", "blue_stained_glass_pane"],
["Brown Stained Glass Pane", "brown_stained_glass_pane"],
["Green Stained Glass Pane", "green_stained_glass_pane"],
["Red Stained Glass Pane", "red_stained_glass_pane"],
["Black Stained Glass Pane", "black_stained_glass_pane"],
["Prismarine", "prismarine"],
["Prismarine Bricks", "prismarine_bricks"],
["Dark Prismarine", "dark_prismarine"],
["Red Sandstone", "red_sandstone"],
["Chiseled Red Sandstone", "chiseled_red_sandstone"],
["Cut Red Sandstone", "cut_red_sandstone"],
["Magma Block", "magma_block"],
["Red Nether Bricks", "red_nether_bricks"],
["Light Gray Shulker Box", "light_gray_shulker_box"],
["Light Gray Glazed Terracotta", "light_gray_glazed_terracotta"],
["White Concrete", "white_concrete"],
["Orange Concrete", "orange_concrete"],
["Magenta Concrete", "magenta_concrete"],
["Light Blue Concrete", "light_blue_concrete"],
["Yellow Concrete", "yellow_concrete"],
["Lime Concrete", "lime_concrete"],
["Pink Concrete", "pink_concrete"],
["Gray Concrete", "gray_concrete"],
["Light Gray Concrete", "light_gray_concrete"],
["Cyan Concrete", "cyan_concrete"],
["Purple Concrete", "purple_concrete"],
["Blue Concrete", "blue_concrete"],
["Brown Concrete", "brown_concrete"],
["Green Concrete", "green_concrete"],
["Red Concrete", "red_concrete"],
["Black Concrete", "black_concrete"],
["White Concrete Powder", "white_concrete_powder"],
["Orange Concrete Powder", "orange_concrete_powder"],
["Magenta Concrete Powder", "magenta_concrete_powder"],
["Light Blue Concrete Powder", "light_blue_concrete_powder"],
["Yellow Concrete Powder", "yellow_concrete_powder"],
["Lime Concrete Powder", "lime_concrete_powder"],
["Pink Concrete Powder", "pink_concrete_powder"],
["Gray Concrete Powder", "gray_concrete_powder"],
["Light Gray Concrete Powder", "light_gray_concrete_powder"],
["Cyan Concrete Powder", "cyan_concrete_powder"],
["Purple Concrete Powder", "purple_concrete_powder"],
["Blue Concrete Powder", "blue_concrete_powder"],
["Brown Concrete Powder", "brown_concrete_powder"],
["Green Concrete Powder", "green_concrete_powder"],
["Red Concrete Powder", "red_concrete_powder"],
["Black Concrete Powder", "black_concrete_powder"],
["Oak Door", "oak_door"],
["Redstone Repeater", "repeater"],
["Redstone Comparator", "comparator"],
["Coal", "coal"],
["Charcoal", "charcoal"],
["Golden Apple", "golden_apple"],
["Enchanted Golden Apple", "enchanted_golden_apple"],
["Sign", "sign"],
["Water", "water"],
["Lava", "lava"],
["Oak Boat", "oak_boat"],
["Sugar cane", "sugar_cane"],
["Raw Cod", "cod"],
["Raw Salmon", "salmon"],
["Tropical Fish", "tropical_fish"],
["Pufferfish", "pufferfish"],
["Cooked Cod", "cooked_cod"],
["Cooked Salmon", "cooked_salmon"],
["Bone Meal", "bone_meal"],
["Orange Dye", "orange_dye"],
["Magenta Dye", "magenta_dye"],
["Light Blue Dye", "light_blue_dye"],
["Dandelion Yellow", "dandelion_yellow"],
["Lime Dye", "lime_dye"],
["Pink Dye", "pink_dye"],
["Gray Dye", "gray_dye"],
["Light Gray Dye", "light_gray_dye"],
["Cyan Dye", "cyan_dye"],
["Purple Dye", "purple_dye"],
["Lapis Lazuli", "lapis_lazuli"],
["Cocoa Beans", "cocoa_beans"],
["Cactus Green", "cactus_green"],
["Rose Red", "rose_red"],
["Ink Sac", "ink_sac"],
["White Bed", "white_bed"],
["Orange Bed", "orange_bed"],
["Magenta Bed", "magenta_bed"],
["Light Blue Bed", "light_blue_bed"],
["Yellow Bed", "yellow_bed"],
["Lime Bed", "lime_bed"],
["Pink Bed", "pink_bed"],
["Gray Bed", "gray_bed"],
["Light Gray Bed", "light_gray_bed"],
["Cyan Bed", "cyan_bed"],
["Purple Bed", "purple_bed"],
["Blue Bed", "blue_bed"],
["Brown Bed", "brown_bed"],
["Green Bed", "green_bed"],
["Red Bed", "red_bed"],
["Black Bed", "black_bed"],
["Melon Slice", "melon_slice"],
["Pumpkin Stem", "pumpkin_stem"],
["Attached Pumpkin Stem", "attached_pumpkin_stem"],
["Melon Stem", "melon_stem"],
["Attached Melon Stem", "attached_melon_stem"],
["Glistering Melon Slice", "glistering_melon_slice"],
["Bat Spawn Egg", "bat_spawn_egg"],
["Blaze Spawn Egg", "blaze_spawn_egg"],
["Cave Spider Spawn Egg", "cave_spider_spawn_egg"],
["Chicken Spawn Egg", "chicken_spawn_egg"],
["Cow Spawn Egg", "cow_spawn_egg"],
["Creeper Spawn Egg", "creeper_spawn_egg"],
["Donkey Spawn Egg", "donkey_spawn_egg"],
["Elder Guardian Spawn Egg", "elder_guardian_spawn_egg"],
["Enderman Spawn Egg", "enderman_spawn_egg"],
["Endermite Spawn Egg", "endermite_spawn_egg"],
["Evoker Spawn Egg", "evoker_spawn_egg"],
["Ghast Spawn Egg", "ghast_spawn_egg"],
["Guardian Spawn Egg", "guardian_spawn_egg"],
["Horse Spawn Egg", "horse_spawn_egg"],
["Husk Spawn Egg", "husk_spawn_egg"],
["Llama Spawn Egg", "llama_spawn_egg"],
["Magma Cube Spawn Egg", "magma_cube_spawn_egg"],
["Mooshroom Spawn Egg", "mooshroom_spawn_egg"],
["Mule Spawn Egg", "mule_spawn_egg"],
["Ocelot Spawn Egg", "ocelot_spawn_egg"],
["Parrot Spawn Egg", "parrot_spawn_egg"],
["Pig Spawn Egg", "pig_spawn_egg"],
["Polar Bear Spawn Egg", "polar_bear_spawn_egg"],
["Rabbit Spawn Egg", "rabbit_spawn_egg"],
["Sheep Spawn Egg", "sheep_spawn_egg"],
["Shulker Spawn Egg", "shulker_spawn_egg"],
["Silverfish Spawn Egg", "silverfish_spawn_egg"],
["Skeleton Spawn Egg", "skeleton_spawn_egg"],
["Skeleton Horse Spawn Egg", "skeleton_horse_spawn_egg"],
["Slime Spawn Egg", "slime_spawn_egg"],
["Spider Spawn Egg", "spider_spawn_egg"],
["Squid Spawn Egg", "squid_spawn_egg"],
["Stray Spawn Egg", "stray_spawn_egg"],
["Vex Spawn Egg", "vex_spawn_egg"],
["Villager Spawn Egg", "villager_spawn_egg"],
["Vindicator Spawn Egg", "vindicator_spawn_egg"],
["Witch Spawn Egg", "witch_spawn_egg"],
["Wither Skeleton Spawn Egg", "wither_skeleton_spawn_egg"],
["Wolf Spawn Egg", "wolf_spawn_egg"],
["Zombie Spawn Egg", "zombie_spawn_egg"],
["Zombie Horse Spawn Egg", "zombie_horse_spawn_egg"],
["Zombie Pigman Spawn Egg", "zombie_pigman_spawn_egg"],
["Zombie Villager Spawn Egg", "zombie_villager_spawn_egg"],
["Flower Pot", "flower_pot"],
["Potted Poppy", "potted_poppy"],
["Potted Dandelion", "potted_dandelion"],
["Potted Oak Sapling", "potted_oak_sapling"],
["Potted Spruce Sapling", "potted_spruce_sapling"],
["Potted Birch Sapling", "potted_birch_sapling"],
["Potted Jungle Sapling", "potted_jungle_sapling"],
["Potted Red Mushroom", "potted_red_mushroom"],
["Potted Brown Mushroom", "potted_brown_mushroom"],
["Potted Cactus", "potted_cactus"],
["Potted Dead Bush", "potted_dead_bush"],
["Potted Fern", "potted_fern"],
["Potted Acacia Sapling", "potted_acacia_sapling"],
["Potted Dark Oak Sapling", "potted_dark_oak_sapling"],
["Potted Blue Orchid", "potted_blue_orchid"],
["Potted Allium", "potted_allium"],
["Potted Azure Bluet", "potted_azure_bluet"],
["Potted Red Tulip", "potted_red_tulip"],
["Potted Orange Tulip", "potted_orange_tulip"],
["Potted White Tulip", "potted_white_tulip"],
["Potted Pink Tulip", "potted_pink_tulip"],
["Potted Oxeye Daisy", "potted_oxeye_daisy"],
["Skeleton Skull", "skeleton_skull"],
["Skeleton Wall Skull", "skeleton_wall_skull"],
["Wither Skeleton Skull", "wither_skeleton_skull"],
["Wither Skeleton Wall Skull", "wither_skeleton_wall_skull"],
["Zombie Head", "zombie_head"],
["Zombie Wall Head", "zombie_wall_head"],
["Player Head", "player_head"],
["Player Wall Head", "player_wall_head"],
["Creeper Head", "creeper_head"],
["Creeper Wall Head", "creeper_wall_head"],
["Dragon Head", "dragon_head"],
["Dragon Wall Head", "dragon_wall_head"],
["Firework Rocket", "firework_rocket"],
["Firework Star", "firework_star"],
["Nether Brick", "nether_brick"],
["White Banner", "white_banner"],
["Orange Banner", "orange_banner"],
["Magenta Banner", "magenta_banner"],
["Light Blue Banner", "light_blue_banner"],
["Yellow Banner", "yellow_banner"],
["Lime Banner", "lime_banner"],
["Pink Banner", "pink_banner"],
["Gray Banner", "gray_banner"],
["Light Gray Banner", "light_gray_banner"],
["Cyan Banner", "cyan_banner"],
["Purple Banner", "purple_banner"],
["Blue Banner", "blue_banner"],
["Brown Banner", "brown_banner"],
["Green Banner", "green_banner"],
["Red Banner", "red_banner"],
["Black Banner", "black_banner"],
["White Wall Banner", "white_wall_banner"],
["Orange Wall Banner", "orange_wall_banner"],
["Magenta Wall Banner", "magenta_wall_banner"],
["Light Blue Wall Banner", "light_blue_wall_banner"],
["Yellow Wall Banner", "yellow_wall_banner"],
["Lime Wall Banner", "lime_wall_banner"],
["Pink Wall Banner", "pink_wall_banner"],
["Gray Wall Banner", "gray_wall_banner"],
["Light Gray Wall Banner", "light_gray_wall_banner"],
["Cyan Wall Banner", "cyan_wall_banner"],
["Purple Wall Banner", "purple_wall_banner"],
["Blue Wall Banner", "blue_wall_banner"],
["Brown Wall Banner", "brown_wall_banner"],
["Green Wall Banner", "green_wall_banner"],
["Red Wall Banner", "red_wall_banner"],
["Black Wall Banner", "black_wall_banner"],
["Popped Chorus Fruit", "popped_chorus_fruit"],
["Music Disc 13", "music_disc_13"],
["Music Disc Cat", "music_disc_cat"],
["Music Disc Blocks", "music_disc_blocks"],
["Music Disc Chirp", "music_disc_chirp"],
["Music Disc Far", "music_disc_far"],
["Music Disc Mall", "music_disc_mall"],
["Music Disc Mellohi", "music_disc_mellohi"],
["Music Disc Stal", "music_disc_stal"],
["Music Disc Strad", "music_disc_strad"],
["Music Disc Ward", "music_disc_ward"],
["Music Disc 11", "music_disc_11"],
["Music Disc Wait", "music_disc_wait"]];

module.exports = list.sort(function(a, b){
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
});
},{}],23:[function(require,module,exports){
const blockList = require("./lists/blocks.js");
// console.table(blockList);
module.exports.items = blockList;
module.exports.blockState = require("./lists/blockState");

/**
 * Get a minecraft block name from id
 * 
 * @param {String} id the block id
 */
module.exports.getItemName = function(id){
    if(!id.includes("minecraft:")){
        id = "minecraft:" + id;
    }
    for(let i = 0; i < blockList.length; i++){
        const arr = blockList[i];
        if(arr[1] == id){
            return arr[0];
        }
    }
    return null;
};
},{"./lists/blockState":21,"./lists/blocks.js":22}],24:[function(require,module,exports){
const JSEvents = require("jsevents");

class jsModal {

    constructor(heading, content, success, cancel) {
        this.success = typeof success === "string" ? success : "Submit";
        this.cancel = typeof cancel === "string" ? cancel : "Cancel";

        this.events = new JSEvents(this);

        this.modalContent = document.createChild("div");
        this.heading = heading;

        this.create();

        this.content = content;
    }

    /**
     * set the modal content
     */
    set content(content) {
        this.modalContent = content;
        // refresh the content in the modal
        let body = this.elements.body;
        body.innerHTML = "";
        body.appendChild(this.modalContent);
    }
    /**
     * get the modal content
     */
    get content() {
        return this.modalContent;
    }

    get successBtn() {
        return this.elements.successBtn;
    }

    get cancelBtn() {
        return this.elements.cancelBtn;
    }

    /**
     * create the modal
     */
    create() {
        const that = this;
        this.elements = {};

        // create the modal
        let dialog = document.createChild("div", {
            classList: ["modal", "hide", "fade", "in"],
            style: "display: none;",
            childNodes: [{
                type: "div",
                options: {
                    classList: ["modal-dialog"]
                }
            }]
        });
        this.dialog = dialog;

        let modal = dialog.firstChild.createChild("div", {
            classList: ["modal-content"]
        })
        this.modal = modal;

        // create the header
        let headDiv = modal.createChild("div")
        this.elements.heading = headDiv.createChild("div", {
            classList: ["modal-header"]
        });

        this.elements.header = this.elements.heading.createChild("h5", {
            text: this.heading,
            classList: ["modal-title"]
        });

        this.elements.heading.createChild("button", {
            type: "button",
            classList: ["close"],
            "data-dismiss": "modal",
            "aria-label": "Close",
            childNodes: [{
                type: "span",
                options: {
                    "aria-hidden": "true",
                    text: "×"
                }
            }]
        });

        // create the body
        let body = modal.createChild("div", {
            classList: ["modal-body"]
        });
        this.elements.body = body;

        body.innerHTML = "";
        body.appendChild(this.modalContent);

        // create the footer
        let footer = modal.createChild("div", {
            classList: ["modal-footer"]
        });
        this.elements.footer = footer;

        let successBtn = footer.createChild("span", {
            classList: ["btn", "btn-success"],
            text: this.success,
            on: {
                click: function () {
                    console.log("Trigger Success function");
                    that.events.triggerCallback("success", that, []);
                }
            }
        });
        this.elements.successBtn = successBtn;

        let cancelBtn = footer.createChild("span", {
            classList: ["btn"],
            "data-dismiss": "modal",
            text: this.cancel,
            on: {
                click: function () {
                    that.events.triggerCallback("cancel", that, []);
                }
            }
        });
        this.elements.cancelBtn = cancelBtn;

        document.body.appendChild(dialog);

        this.show();
    }

    /**
     * show the dialog
     */
    show() {
        $(this.dialog).modal();
    }

    /**
     * hide the dialog
     */
    hide() {
        $(this.dialog).modal("hide");
    }

    /**
     * remove the modal element
     */
    destroy() {
        const that = this;

        if (this.dialog.style.display === "none") {
            $(this.dialog).remove();
        } else{
            this.hide();
            setTimeout(function(){
                that.destroy();
            }, 500);
        }
    }
}

module.exports = jsModal;
},{"jsevents":17}],25:[function(require,module,exports){
let project = require("projects");
const FileTree = require("filetree");
const JSEvents = require("jsevents");
const newFileStructure = require("./newfile.js");

const projectSettings = require("./settings");

const Blockly = require("blockly");


class ProjectFile {
    constructor(name) {
        this.name = name;
        this.setup();
        const that = this;

        // load the project
        project.load(name).then(function (data) {
            console.log("loading Data");
            that.setFile(data);

        }).catch(function (err) {
            console.warn(err);
            // then this is a new project
            console.log("New Project");
            that.file.name = name;
            that.save();
        });
    }

    onLoad() {
        let projectEl = document.getElementById("project-list-current");
        projectEl.innerText = this.file.name;

        this.events.triggerCallback("load", this, []);
    }

    setFile(file) {
        this.file = file;

        this.fileTrees = {};

        let element = document.getElementById("files-list-menu");
        element.innerHTML = "";

        for (let d in this.file.data) {
            let options = {
                name: d
            };

            let tree = new FileTree(
                element,
                this.file.data[d].files,
                options
            );
            this.treeSetup(tree, d);
            this.fileTrees[d] = tree;
        }

        this.onLoad();
    }

    setup() {
        this.file = newFileStructure();

        this.events = new JSEvents(this);
    }

    setData(data) {
        for (let d in data) {
            if (d === "data") {
                continue;
            }
            this.file[d] = data[d];
        }

        return this;
    }

    /**
     * set the event handlers for the file trees
     * 
     * @param {FileTree} tree the file tree class
     */
    treeSetup(tree, name) {
        const that = this;
        // used for the functions because blockly is a complete file 
        tree.on("selected", function () {
            that.workspace = Blockly.open(name, that);
        });
        tree.on("file-opened", function (file) {
            console.log("Opening File", file);
            // open the blocky file editor class
        });
    }

    /**
     * save the data
     */
    save() {
        console.log("Save File", this.file);
        project.save(this.file);
    }

    get data() {
        return this.file;
    }

    /**
     * 
     */
    updateDOM() {

    }

    settings() {
        const that = this;

        let settings = new projectSettings(this);

        settings.on("save", function () {

        });

        settings.on("delete", function () {
            console.log("Delete Project");
            project.delete(that.name)
                .then(function () {
                    // deleted load the demo and scrap the settings menu
                    settings.close();
                    project.loadDemo();
                })
                .catch(function (err) {
                    // not deleted for some reason
                    // TODO: send to message to a toast
                    console.log("Delete Request Canceled", err.message);
                });
        });
    }

    /**
     * insert the blockly xml and code to save
     */
    setBlocklyData(type, xml, code) {
        switch (type) {
            case "functions":
                this.file.data.functions.blockly_xml = xml;
                this.file.data.functions.code = code;
                this.save();
                // console.log(type, xml, code);
                break;
        }
    }
}

module.exports = ProjectFile;
},{"./newfile.js":26,"./settings":28,"blockly":2,"filetree":15,"jsevents":17,"projects":27}],26:[function(require,module,exports){
module.exports = function () {
    return {
        name: "",
        namespace: "",
        data: {
            advancements: {
                files: []
            },
            functions: {
                code: "",
                blockly_xml: "",
                files: []
            },
            loot_tables: {
                files: []
            },
            structures: {
                files: []
            },
            recipes: {
                files: []
            },
            tags: {
                files: []
            }
        }
    };
};
},{}],27:[function(require,module,exports){
(function (global){
const ProjectFile = require("./file.js");
const newFileStructure = require("./newfile.js");

/**
 * get the list of local projects
 * 
 * @returns {Promise}
 */
async function getList() {
    let names = [];

    let pro = localStorage.getItem("projects");
    if (pro) {
        let list = JSON.parse(pro);

        for (let i = 0; i < list.length; i++) {
            let project = list[i];
            names.push(project.name);
        }
    }

    return names;
}
module.exports.list = getList;

/**
 * update the projects list on the upper left
 */
function updateVisualList() {
    let div = $("#project-list-dropdown");
    div.empty();

    getList().then(function (li) {
        li.sort();
        for (let i = 0; i < li.length; i++) {
            let name = li[i];

            let a = document.createElement("a");
            a.setAttribute("href", "#project_" + name);
            a.classList.add("dropdown-item");
            a.appendChild(document.createTextNode(name));
            div.append(a);
        }
    });
}
module.exports.updateVisualList = updateVisualList;

/**
 * load a file by name
 * 
 * @param {String} name the project name
 */
async function loadProject(name) {
    let pro = localStorage.getItem("projects");
    if (pro) {
        let list = JSON.parse(pro);

        for (let i = 0; i < list.length; i++) {
            let project = list[i];
            if (project.name === name) {
                return project;
            }
        }
    }

    throw new Error("Project Not Found");
}

module.exports.load = loadProject;

module.exports.loadDemo = function () {
    fetch("demo.json").then(function (response) {
        return response.json();

    }).then(function (data) {
        saveFunction(data)
            .then(function () {
                let name = data.name;
                openProject(name);
            })
            .catch(function (err) {
                console.error(err);
                console.error(new Error("Failed to save the demo"));
            });

    }).catch(function (err) {
        console.error(err);
    });
}

/**
 * Create a new project and save it
 * 
 * @param {Object} data the form data
 * 
 * @returns {Promise}
 */
module.exports.new = async function (data) {
    let name = null;
    let file = newFileStructure();

    // add all the form data to the file
    for (let i = 0; i < data.length; i++) {
        file[data[i].name] = data[i].value;
    }

    // set the name var
    if (file.name) {
        name = file.name;
    }
    if (name === null || name === "") {
        throw new Error("Data Pack name can't be blank.");
    }
    if (file.namespace === null || file.namespace === "") {
        throw new Error("Namespace can't be blank");
    }
    
    // save the file and open it
    await saveFunction(file);

    // open the file
    let newFile = null;
    await openProject(name).then(function(f){
        newFile = f;
    });

    return newFile;
};

/**
 * load a project and open it
 * 
 * @param {String} name the project name
 * @returns {Promise}
 */
function openProject(name) {
    return new Promise(function (resolve, reject) {
        // check if the project exists
        loadProject(name)
            .then(function () {
                let file = new ProjectFile(name);
                global.openFile = file;

                resolve(file);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
module.exports.open = openProject;

/**
 * save the file to localStorage
 * 
 * @param {Object} file the file object
 */
async function saveFunction(file) {
    let pro = localStorage.getItem("projects");
    let list = [];
    let saved = false;

    if (pro) {
        list = JSON.parse(pro);


        for (let i = 0; i < list.length; i++) {
            let project = list[i];
            if (project.name === file.name) {
                list[i] = file;
                saved = true;
            }
        }
    }
    if (!saved) {
        list.push(file);
    }
    localStorage.setItem("projects", JSON.stringify(list));
    setTimeout(function () {
        updateVisualList();
    }, 1);
};
module.exports.save = saveFunction;

/**
 * delete a project from the browser cache
 * 
 * @param {String} name the project name
 * 
 * @returns {Promise}
 */
function deleteProject(name) {
    return new Promise(function (resolve, reject) {
        loadProject(name)
            .then(function (data) {
                if (confirm("Are you sure you want to delete '" + name + "'?")) {
                    let pro = localStorage.getItem("projects");
                    let deleted = false;
                    if (pro) {
                        let list = JSON.parse(pro);

                        for (let i = list.length - 1; i >= 0; i--) {
                            let project = list[i];
                            if (project.name === name) {
                                list.splice(i, 1);
                                deleted = true;
                            }
                        }
                        localStorage.setItem("projects", JSON.stringify(list));
                        setTimeout(function () {
                            updateVisualList();
                        }, 1);
                    }

                    if (!deleted) {
                        reject(new Error("Project Not Found or otherwise wasn't able to be deleted"));
                    } else{
                        resolve();
                    }
                } else {
                    reject(new Error("Delete cancelled."));
                }
            })
            .catch(function (err) {
                reject(err);
            })
    });
};

module.exports.delete = deleteProject;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./file.js":25,"./newfile.js":26}],28:[function(require,module,exports){
const jsEvents = require("jsevents");

const Modal = require("modal");


class ProjectFileSettings {

    constructor(that){
        this.events = new jsEvents(this);
        this.parent = that;

        this.open();
    }

    /**
     * open a settings dialog
     */
    open(){
        const that = this;
        let content = document.createChild("p", {
            text: "Set some settings"
        });

        content.appendChild(this.deleteButton);

        let modal = new Modal(this.parent.name + " settings", content, "Save");
        console.log(modal);
        modal.on("cancel", function(){
            this.destroy();
            that.modal = null;
        });

        modal.on("success", function(){
            console.log("Submitted");
            this.destroy();
            that.modal = null;
        });

        this.modal = modal;
    }

    close(){
        if(this.modal){
            this.modal.destroy();
        }
    }

    get deleteButton(){
        const that = this;
        let button = document.createChild("button", {
            classList: ["btn", "btn-danger", "float-right"],
            type: "button",
            text: "Delete",
            on :{
                click: function(){
                    that.events.triggerCallback("delete", that, []);
                }
            }
        });

        button.insertBefore(document.createChild("i", {
            classList: ["material-icons", "align-middle"],
            text: "delete"
        }), button.firstChild);

        return button;
    }
}

module.exports = ProjectFileSettings;
},{"jsevents":17,"modal":24}]},{},[1]);
