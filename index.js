const cc = require("ccolor");
const parseIndentedText = require("./lib/parse-indented-text");
const path = require("path");
const fs = require("fs");

let rl;

class Node {
  constructor(name = "") {
    this.name = name;
    this.children = [];
  }

  add(path) {
    if (path.length) {
      let found = false;
      let added = false;
      let name = path[0];
      let rest = path.slice(1);
      if (name === "*") {
        for (let child of this.children) {
          if (child.add(rest)) {
            added = true;
          }
        }
        return added;
      }
      if (name.startsWith("+")) {
        name = name.slice(1);
        this.appendChild(new Node(name));
        added = true;
      }
      for (let child of this.children) {
        if (child.name == name) {
          found = true;
          if (child.add(rest)) {
            added = true;
          }
        }
      }
      if (!found) {
        let child = new Node(name);
        this.appendChild(child);
        added = true;
        child.add(rest);
      }
      return added;
    }
  }

  find(name, result = []) {
    for (let child of this.children) {
      if (name == "*" || child.name == name) {
        result.push(child);
      }
      child.find(name, result);
    }
    return result;
  }

  findPath(path, result = []) {
    if (!path.length) {
      return result;
    }
    for (let child of this.children) {
      if (child.name == path[0] || path[0] == "*") {
        if (path.length == 1) {
          result.push(child);
        } else {
          child.findPath(path.slice(1), result);
        }
      }
    }
    return result;
  }

  toString(indent = 0) {
    let string = " ".repeat(indent) + this.name + "\n";
    for (let child of this.children) {
      string += child.toString(indent + 4);
    }
    return string;
  }
  appendChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  getPath(path = []) {
    path.unshift(this.name);
    if (this.parent) {
      this.parent.getPath(path);
    }
    return path;
  }

  printPath() {
    console.log(cc.magenta(this.getPath().join(".")));
  }
}

let root;
let vars = {};

function online(line) {
  let m = line.match(/([^=]+)=(.*)/);
  if (m) {
    let key = m[1].trim();
    let value = m[2].trim();
    if (value) {
      vars[key] = value;
    } else {
      delete vars[key];
    }
    return;
  }
  line = line.replace(/([^.])\+([^.])/g, "$1.+$2");
  if (!line) {
    console.clear();
    line = ".";
  }
  if (line.trim() == ".") {
    for (let child of root.children) {
      process.stdout.write(child.toString());
    }
  } else {
    let remove = false;
    if (line.startsWith("-")) {
      remove = true;
      line = line.slice(1);
    }
    let path = line.split(".").map((name) => name.trim());
    for (let i = 0; i < path.length; i++) {
      let seg = path[i];
      if (seg.startsWith("+")) {
        let name = seg.slice(1);
        if (vars[name]) {
          path[i] = "+" + vars[name];
        }
      } else if (vars[seg]) {
        path[i] = vars[seg];
      }
    }
    if (remove) {
      let targets;
      let name = path[0];
      let rest = path.slice(1);
      if (!name) {
        if (!rest[0] && rest.length == 1) {
          root.children = [];
          save();
          return;
        }
        targets = root.findPath(rest);
      } else {
        let seeds = root.find(name);
        targets = [];
        for (let seed of seeds) {
          if (!rest.length) {
            targets.push(seed);
          } else {
            seed.findPath(rest, targets);
          }
        }
      }
      for (let node of targets) {
        if (node.parent) {
          node.parent.children = node.parent.children.filter((c) => c !== node);
        }
      }
    } else {
      let name = path[0];
      let rest = path.slice(1);
      if (!name) {
        if (!root.add(rest)) {
          printNodes(root.findPath(rest));
        }
      } else {
        let added = false;
        let nodes = root.find(name);
        if (!nodes.length) {
          root.add(path);
          added = true;
        } else {
          for (let node of nodes) {
            if (node.add(rest)) {
              added = true;
            }
          }
        }
        if (!added) {
          let out = [];
          for (let node of nodes) {
            if (rest.length) {
              node.findPath(rest, out);
            } else {
              out.push(node);
            }
          }
          printNodes(out);
        }
      }
    }
  }
  save();
}

function printNodes(nodes) {
  for (let i = 0; i < nodes.length; i++) {
    if (i > 0) {
      console.log();
    }
    nodes[i].printPath();
    if (nodes[i].children.length) {
      process.stdout.write(nodes[i].toString());
    }
  }
}

function convertNode(node) {
  let result = new Node(node.line);
  for (let child of node.children) {
    result.appendChild(convertNode(child));
  }
  return result;
}

let filename = path.join(__dirname, "diamond.tree");

function save() {
  fs.writeFile(filename, root.toString(), "utf8", (err) => {
    if (err) {
      console.error("error saving");
    }
  });
}

function load(callback) {
  fs.readFile(filename, "utf8", (err, data) => {
    if (data) {
      callback(convertNode(parseIndentedText(data)));
    } else callback(new Node());
  });
}

load((r) => {
  root = r;
  rl = require("./lib/rl")(cc.cyan("<> "), online);
});
