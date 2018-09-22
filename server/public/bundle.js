(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

$( document ).ready(function(){
    require("load");
});
},{"load":2}],2:[function(require,module,exports){
// run onload of the doc
const project = require("projects");
require("./sidebar");

project.updateVisualList();

window.addEventListener("hashchange", function(){
    onHashChange();
});

function onHashChange(){
    let hash = location.hash;
    if(hash.includes("#project_")){
        let name = decodeURI(hash.replace("#project_", ""));
        console.log(name);
    }
}

$("#new-project-form").on("submit", function(event){
    event.preventDefault();

    project.new($( this ).serializeArray()).then(function(name){
        // open the created project
        project.open(name);
        $('#projectsModal').modal('hide');
    });
});
},{"./sidebar":3,"projects":5}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
let project = require("projects");

class ProjectFile{
    constructor(name){
        this.setup();
        const that = this;

        // load the file
        project.load(name).then(function(data){
            console.log(data);
            that.file = data;
        }).catch(function(){
            // then this is a new file
            console.log("New File");
            that.file.name = name;
            that.save();
        });
        console.log(this);
    }

    setup(){
        this.file = {
            name: "",
            data: {}
        };
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
}

module.exports = ProjectFile;
},{"projects":5}],5:[function(require,module,exports){
(function (global){

/**
 * get the list of local projects
 * 
 * @returns {Promise}
 */
async function getList () {
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
function updateVisualList(){
    let div = $("#project-list-dropdown");
    div.empty();

    getList().then(function(li){
        li.sort();
        for(let i = 0; i < li.length; i++){
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
async function loadProject(name){
    let pro = localStorage.getItem("projects");
    if (pro) {
        let list = JSON.parse(pro);

        for (let i = 0; i < list.length; i++) {
            let project = list[i];
            if(project.name === name){
                return project;
            }
        }
    }

    throw new Error("Project Not Found");
}

module.exports.load = loadProject;

/**
 * Create a new project and save it
 * 
 * @param {Object} data the form data
 * 
 * @returns {Promise}
 */
module.exports.new = async function(data){
    let name = null;
    let file = {};
    for(let i = 0; i < data.length; i++){
        file[data[i].name] = data[i].value;
    }
    if(file.name){
        name = file.name;
    }
    return name;
};

/**
 * load a project and open it
 * 
 * @param {String} name the project name
 */
module.exports.open = function(name){
    const ProjectFile = require("./file.js");

    let file = new ProjectFile(name);

    global.openFile = file;
};

/**
 * save the file to localStorage
 * 
 * @param {Object} file the file object
 */
module.exports.save = async function(file){
    let pro = localStorage.getItem("projects");
    let list = [];
    let saved = false;

    if (pro) {
        list = JSON.parse(pro);
        

        for (let i = 0; i < list.length; i++) {
            let project = list[i];
            if(project.name === file.name){
                list[i] = file;
                saved = true;
            }
        }
    }
    if(!saved){
        list.push(file);
    }
    localStorage.setItem("projects", JSON.stringify(list));
    setTimeout(function(){
        updateVisualList();
    }, 1);
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./file.js":4}]},{},[1]);
