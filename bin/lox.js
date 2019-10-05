"use strict";
exports.__esModule = true;
var fs_1 = require("fs");
var scanner_1 = require("./scanner");
var token_1 = require("./token");
var tokenType_1 = require("./tokenType");
var parser_1 = require("./parser");
var interpreter_1 = require("./interpreter");
var args = process.argv.slice(2);
var hadError = false;
var hadRuntimeError = false;
var interpreter = new interpreter_1["default"]();
// starting point
if (args.length > 1) {
    console.log('Usage: lox [script]');
    process.exit(64);
}
else if (args.length == 1) {
    runFile(args[0]);
}
else {
    runPrompt();
}
// functions
function runFile(path) {
    fs_1.readFile(path, 'utf8', function (err, data) {
        if (!err) {
            run(data);
            if (hadError)
                process.exit(65);
            if (hadRuntimeError)
                process.exit(70);
        }
    });
}
function runPrompt() {
    process.stdin.on('data', function (data) {
        run(data.toString().trim());
        hadError = false;
    });
}
function run(src) {
    var scanner = new scanner_1["default"](src);
    var tokens = scanner.scanTokens();
    var parser = new parser_1["default"](tokens);
    var statements = parser.parse();
    if (hadError)
        return;
    interpreter.interpret(statements);
}
function report(line, where, message) {
    console.log("[line " + line + "] Error " + where + ": " + message);
    hadError = true;
}
exports.report = report;
function error(item, message) {
    if (item instanceof token_1["default"]) {
        if (item.type == tokenType_1["default"].EOF) {
            report(item.line, " at end", message);
        }
        else {
            report(item.line, " at '" + item.lexeme + "'", message);
        }
    }
    else {
        report(item, "", message);
    }
}
exports.error = error;
function runtimeError(error) {
    console.error(error.message + "\n[line " + error.token.line + "]");
    hadRuntimeError = true;
}
exports.runtimeError = runtimeError;
//# sourceMappingURL=lox.js.map