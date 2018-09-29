(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

$( document ).ready(function(){
    require("load");
});
},{"load":6}],2:[function(require,module,exports){
let idNum = 0;
const html = require("html");
const JSEvents = require("jsevents");

class FileTree{
    
    /**
     * 
     * @param {Element} parent html element to put the file tree under
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
        console.log(this.events);
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
            classList: ["active", "border-top", "border-bottom"]
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
},{"html":3,"jsevents":4}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){


class JSEvents{

    constructor(caller){
        this.events = {};
        const that = this;
        if (caller) {
            caller.on = function (event, callback) {
                console.log("Register", event);
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
        console.log("Trigger Event", event);
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
},{}],5:[function(require,module,exports){

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
},{}],6:[function(require,module,exports){
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

let div = document.getElementById("files-list-menu");

const FileTree = require("filetree");

// let fileTree = new FileTree(div, [
//     {
//         type: "file",
//         name: "File 1",
//         contents: ""
//     }, {
//         type: "dir",
//         name: "Folder 1",
//         contents: [
//             {
//                 type: "file",
//                 name: "File 2",
//                 contents: ""
//             }
//         ]
//     }
// ], {
//     name: "Functions"
// });

// fileTree.on("change", function(){
//     console.log("Changed");
// });

// fileTree.on("selected", function(current){
//     // console.log(current);
// });

// fileTree.on("file-opened", function(current){
//     // console.log(current);
// });

// fileTree.on("dir-opened", function(current){
//     // console.log(current);
// });

// fileTree.on("new-file", function(){
//     // console.log("new file");
// });
// fileTree.on("new-dir", function(){
//     // console.log("new dir");
// });
// fileTree.on("new", function(){
//     // console.log("new file or dir");
// });


// console.log(fileTree);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./createChild":5,"./sidebar":7,"filetree":2,"projects":11}],7:[function(require,module,exports){
var min = 175;
var max = 400;
var mainmin = 150;

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > min && x < max && e.pageX < ($(window).width() - mainmin)) {  
          $('#sidebar').css("width", x);
          $('#content').css("margin-left", x);
        }
    })
});
$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});
},{}],8:[function(require,module,exports){
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
},{"jsevents":4}],9:[function(require,module,exports){
let project = require("projects");
const FileTree = require("filetree");
const JSEvents = require("jsevents");
const newFileStructure = require("./newfile.js");

const projectSettings = require("./settings");


class ProjectFile{
    constructor(name){
        this.name = name;
        this.setup();
        const that = this;

        // load the project
        project.load(name).then(function(data){
            console.log("loading Data");
            that.setFile(data);

        }).catch(function(err){
            console.warn(err);
            // then this is a new project
            console.log("New Project");
            that.file.name = name;
            that.save();
        });
        console.log(this);
    }

    onLoad(){
        let projectEl = document.getElementById("project-list-current");
        projectEl.innerText = this.file.name;

        this.events.triggerCallback("load", this, []);
    }

    setFile(file){
        this.file = file;

        this.fileTrees = {};

        let element = document.getElementById("files-list-menu");
        element.innerHTML = "";

        for(let d in this.file.data){
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

    setup(){
        this.file = newFileStructure();

        this.events = new JSEvents(this);
    }

    setData(data){
        for(let d in data){
            if(d === "data"){
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
    treeSetup(tree, name){
        tree.on("file-opened", function(file){
            console.log("Opening File", file);
            // open the blocky file editor class
        });
    }

    /**
     * save the data
     */
    save(){
        console.log("Save File", this.file);
        project.save(this.file);
    }

    get data(){
        return this.file;
    }

    /**
     * 
     */
    updateDOM(){

    }

    settings(){
        const that = this;

        let settings = new projectSettings(this);

        settings.on("save", function(){

        });

        settings.on("delete", function(){
            console.log("Delete Project");
            project.delete(that.name)
                .then(function(){
                    // deleted load the demo and scrap the settings menu
                    settings.close();
                    project.loadDemo();
                })
                .catch(function(err){
                    // not deleted for some reason
                    // TODO: send to message to a toast
                    console.log("Delete Request Canceled", err.message);
                });
        });
    }
}

module.exports = ProjectFile;
},{"./newfile.js":10,"./settings":12,"filetree":2,"jsevents":4,"projects":11}],10:[function(require,module,exports){
module.exports = function () {
    return {
        name: "",
        namespace: "",
        data: {
            advancements: {
                files: []
            },
            functions: {
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
},{}],11:[function(require,module,exports){
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
},{"./file.js":9,"./newfile.js":10}],12:[function(require,module,exports){
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
},{"jsevents":4,"modal":8}]},{},[1]);
