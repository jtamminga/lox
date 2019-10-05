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
var Stmt = /** @class */ (function () {
    function Stmt() {
    }
    return Stmt;
}());
exports["default"] = Stmt;
var Expression = /** @class */ (function (_super) {
    __extends(Expression, _super);
    function Expression(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    Expression.prototype.accept = function (visitor) {
        return visitor.visitExpressionStmt(this);
    };
    return Expression;
}(Stmt));
exports.Expression = Expression;
var Print = /** @class */ (function (_super) {
    __extends(Print, _super);
    function Print(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    Print.prototype.accept = function (visitor) {
        return visitor.visitPrintStmt(this);
    };
    return Print;
}(Stmt));
exports.Print = Print;
//# sourceMappingURL=statement.js.map