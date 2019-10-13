"use strict";
exports.__esModule = true;
var loxInstance_1 = require("./loxInstance");
var LoxClass = /** @class */ (function () {
    function LoxClass(name, methods, superClass) {
        this.methods = new Map();
        this.name = name;
        this.methods = methods;
        this.superClass = superClass;
    }
    LoxClass.prototype.arity = function () {
        var initializer = this.findMethod("init");
        if (initializer == null)
            return 0;
        return initializer.arity();
    };
    LoxClass.prototype.call = function (interpreter, args) {
        var instance = new loxInstance_1["default"](this);
        var initializer = this.findMethod("init");
        if (initializer != null) {
            initializer.bind(instance).call(interpreter, args);
        }
        return instance;
    };
    LoxClass.prototype.findMethod = function (name) {
        if (this.methods.has(name)) {
            return this.methods.get(name);
        }
        if (this.superClass != null) {
            return this.superClass.findMethod(name);
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