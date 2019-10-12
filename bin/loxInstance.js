"use strict";
exports.__esModule = true;
var errors_1 = require("./errors");
var LoxInstance = /** @class */ (function () {
    function LoxInstance(klass) {
        this.fields = new Map();
        this.klass = klass;
    }
    LoxInstance.prototype.get = function (name) {
        if (this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme);
        }
        var method = this.klass.findMethod(name.lexeme);
        if (method != null)
            return method.bind(this);
        throw new errors_1.RuntimeError(name, "Undefined property '" + name.lexeme + "'.");
    };
    LoxInstance.prototype.set = function (name, value) {
        this.fields.set(name.lexeme, value);
    };
    LoxInstance.prototype.toString = function () {
        return this.klass.name + " instance";
    };
    return LoxInstance;
}());
exports["default"] = LoxInstance;
//# sourceMappingURL=loxInstance.js.map