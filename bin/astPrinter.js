"use strict";
exports.__esModule = true;
var AstPrinter = /** @class */ (function () {
    function AstPrinter() {
    }
    AstPrinter.prototype.print = function (expr) {
        return expr.accept(this);
    };
    AstPrinter.prototype.visitCallExpr = function (expr) {
        throw new Error("Method not implemented.");
    };
    AstPrinter.prototype.visitLogicalExpr = function (expr) {
        throw new Error("Method not implemented.");
    };
    AstPrinter.prototype.visitAssignExpr = function (expr) {
        throw new Error("Method not implemented.");
    };
    AstPrinter.prototype.visitVariableExpr = function (stmt) {
        throw new Error("Method not implemented.");
    };
    AstPrinter.prototype.visitBinaryExpr = function (expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    };
    AstPrinter.prototype.visitGroupingExpr = function (expr) {
        return this.parenthesize('group', expr.expr);
    };
    AstPrinter.prototype.visitLiteralExpr = function (expr) {
        if (expr.value == null)
            return 'nil';
        return expr.value;
    };
    AstPrinter.prototype.visitUnaryExpr = function (expr) {
        return this.parenthesize(expr.operator.lexeme, expr.right);
    };
    AstPrinter.prototype.parenthesize = function (name) {
        var exprs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            exprs[_i - 1] = arguments[_i];
        }
        var text = '(' + name;
        for (var _a = 0, exprs_1 = exprs; _a < exprs_1.length; _a++) {
            var expr = exprs_1[_a];
            text += ' ' + expr.accept(this);
        }
        text += ')';
        return text;
    };
    return AstPrinter;
}());
exports["default"] = AstPrinter;
//# sourceMappingURL=astPrinter.js.map