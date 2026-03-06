const readline = require("readline");

module.exports = function (prompt, online, completer) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer: completer
  });
  rl.setPrompt(prompt);
  rl.on("line", function (line) {
    online(line);
    rl.prompt();
  });
  rl.prompt();
  return rl;
};
