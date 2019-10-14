"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var loxInstance_1 = require("./loxInstance");
var LoxArray = /** @class */ (function (_super) {
    __extends(LoxArray, _super);
    function LoxArray(elements) {
        if (elements === void 0) { elements = []; }
        var _this = _super.call(this, null) || this;
        _this.elements = elements;
        return _this;
    }
    LoxArray.prototype.get = function (name) {
        switch (name.lexeme) {
            case "length": return this.elements.length;
            case "push": return Push(this.elements);
        }
    };
    LoxArray.prototype.toString = function () {
        return "[" + this.elements.join(',') + "]";
    };
    return LoxArray;
}(loxInstance_1["default"]));
exports["default"] = LoxArray;
var Push = function (elements) { return ({
    arity: function () { return 1; },
    call: function (interpreter, args) {
        elements.push(args[0]);
    }
}); };
//# sourceMappingURL=loxArray.js.map