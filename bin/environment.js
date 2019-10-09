"use strict";
exports.__esModule = true;
var errors_1 = require("./errors");
var Environment = /** @class */ (function () {
    function Environment(enclosing) {
        if (enclosing === void 0) { enclosing = null; }
        this.values = new Map();
        this.enclosing = enclosing;
    }
    Environment.prototype.define = function (name, value) {
        this.values.set(name, value);
    };
    Environment.prototype.get = function (name) {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme);
        }
        if (this.enclosing != null) {
            return this.enclosing.get(name);
        }
        throw new errors_1.RuntimeError(name, "Undefined variable " + name.lexeme + ".");
    };
    Environment.prototype.getAt = function (distance, name) {
        return this.ancestor(distance).values.get(name);
    };
    Environment.prototype.assign = function (name, value) {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value);
            return;
        }
        if (this.enclosing != null) {
            this.enclosing.assign(name, value);
            return;
        }
        throw new errors_1.RuntimeError(name, "Undefined variable '" + name.lexeme + "'.");
    };
    Environment.prototype.assignAt = function (distance, name, value) {
        this.ancestor(distance).values.set(name.lexeme, value);
    };
    Environment.prototype.ancestor = function (distance) {
        var environment = this;
        for (var i = 0; i < distance; i++) {
            environment = environment.enclosing;
        }
        return environment;
    };
    return Environment;
}());
exports["default"] = Environment;
//# sourceMappingURL=environment.js.map