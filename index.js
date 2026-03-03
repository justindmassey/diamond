const cc = require("ccolor");
const debug = false;
if (!debug) {
  const rl = require("./lib/rl")(cc.cyan("<> "), online);
}

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
      if (child.name == name) {
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
      if (child.name == path[0]) {
        if (path.length == 1) {
          result.push(child);
        } else {
          child.findPath(path.slice(1), result);
        }
      }
    }
    return result;
  }

  print(indent = 0) {
    console.log(" ".repeat(indent) + this.name);
    for (let child of this.children) {
      child.print(indent + 4);
    }
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
    console.log(cc.magenta(this.getPath().slice(1).join(".")));
  }
}

const root = new Node();

function online(line) {
  line = line.replace(/([^.])\+([^.])/g, "$1.+$2");
  if (line.trim() == ".") {
    for (let child of root.children) {
      child.print();
    }
  } else {
    let remove = false;
    if (line.startsWith("-")) {
      remove = true;
      line = line.slice(1);
    }
    let path = line.split(".").map((name) => name.trim());
    if (remove) {
      let targets;
      let name = path[0];
      let rest = path.slice(1);
      if (!name) {
        if (!rest[0]) {
          root.children = [];
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
          for (let node of root.findPath(rest)) {
            node.printPath();
            node.print();
            console.log();
          }
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
          for (let node of nodes) {
            node.printPath();
            node.print();
            console.log();
          }
        }
      }
    }
  }
}

if (debug) {
  online(".user.justin.name");
  online("name.vorname");
  online("name.nachname");
  online("name");
}
