"use strict";
exports.__esModule = true;
var errors_1 = require("./errors");
var Environment = /** @class */ (function () {
    function Environment() {
        this.values = new Map();
    }
    Environment.prototype.define = function (name, value) {
        this.values.set(name, value);
    };
    Environment.prototype.get = function (name) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }
        throw new errors_1.RuntimeError(name, "Undefined variable " + name.lexeme + ".");
    };
    return Environment;
}());
exports["default"] = Environment;
//# sourceMappingURL=environment.js.map