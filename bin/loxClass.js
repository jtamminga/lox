"use strict";
exports.__esModule = true;
var loxInstance_1 = require("./loxInstance");
var LoxClass = /** @class */ (function () {
    function LoxClass(name, methods) {
        this.methods = new Map();
        this.name = name;
        this.methods = methods;
    }
    LoxClass.prototype.arity = function () {
        return 0;
    };
    LoxClass.prototype.call = function (interpreter, args) {
        var instance = new loxInstance_1["default"](this);
        return instance;
    };
    LoxClass.prototype.findMethod = function (name) {
        if (this.methods.has(name)) {
            return this.methods.get(name);
        }
        return null;
    };
    LoxClass.prototype.toString = function () {
        return this.name;
    };
    return LoxClass;
}());
exports["default"] = LoxClass;
//# sourceMappingURL=loxClass.js.map