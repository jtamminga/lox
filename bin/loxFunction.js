"use strict";
exports.__esModule = true;
var environment_1 = require("./environment");
var return_1 = require("./return");
var LoxFunction = /** @class */ (function () {
    function LoxFunction(declaration, closure, isInitializer) {
        this.declaration = declaration;
        this.closure = closure;
        this.isInitializer = isInitializer;
    }
    LoxFunction.prototype.arity = function () {
        return this.declaration.params.length;
    };
    LoxFunction.prototype.call = function (interpreter, args) {
        var environment = new environment_1["default"](this.closure);
        for (var i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i]);
        }
        try {
            interpreter.executeBlock(this.declaration.body, environment);
        }
        catch (returnVal) {
            if (returnVal instanceof return_1["default"]) {
                if (this.isInitializer)
                    return this.closure.getAt(0, "this");
                return returnVal.value;
            }
        }
        if (this.isInitializer)
            return this.closure.getAt(0, "this");
        return null;
    };
    LoxFunction.prototype.bind = function (instance) {
        var environment = new environment_1["default"](this.closure);
        environment.define("this", instance);
        return new LoxFunction(this.declaration, environment, this.isInitializer);
    };
    LoxFunction.prototype.toString = function () {
        return "<fn " + this.declaration.name.lexeme + ">";
    };
    return LoxFunction;
}());
exports["default"] = LoxFunction;
//# sourceMappingURL=loxFunction.js.map