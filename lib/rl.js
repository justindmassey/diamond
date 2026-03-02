const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
module.exports = function (prompt, online) {
  rl.setPrompt(prompt);
  rl.on("line", function (line) {
    online(line);
    rl.prompt();
  });
  rl.prompt();
  return rl;
};
