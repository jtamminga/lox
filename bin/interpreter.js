"use strict";
exports.__esModule = true;
var tokenType_1 = require("./tokenType");
var errors_1 = require("./errors");
var lox_1 = require("./lox");
var Interpreter = /** @class */ (function () {
    function Interpreter() {
    }
    Interpreter.prototype.interpret = function (statements) {
        try {
            for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
                var statement = statements_1[_i];
                this.execute(statement);
            }
        }
        catch (error) {
            lox_1.runtimeError(error);
        }
    };
    Interpreter.prototype.execute = function (statement) {
        statement.accept(this);
    };
    Interpreter.prototype.visitBinaryExpr = function (binary) {
        var left = this.evaluate(binary.left);
        var right = this.evaluate(binary.right);
        switch (binary.operator.type) {
            case tokenType_1["default"].GREATER:
                this.checkNumberOperands(binary.operator, left, right);
                return left > right;
            case tokenType_1["default"].GREATER_EQUAL:
                this.checkNumberOperands(binary.operator, left, right);
                return left >= right;
            case tokenType_1["default"].LESS:
                this.checkNumberOperands(binary.operator, left, right);
                return left < right;
            case tokenType_1["default"].LESS_EQUAL:
                this.checkNumberOperands(binary.operator, left, right);
                return left <= right;
            case tokenType_1["default"].MINUS:
                this.checkNumberOperands(binary.operator, left, right);
                return left - right;
            case tokenType_1["default"].PLUS:
                if (typeof (left) === 'number' && typeof (right) === 'number')
                    return left + right;
                if (typeof (left) === 'string' && typeof (right) === 'string')
                    return left + right;
                throw new errors_1.RuntimeError(binary.operator, "Operands must both be numbers or strings");
            case tokenType_1["default"].SLASH:
                this.checkNumberOperands(binary.operator, left, right);
                return left / right;
            case tokenType_1["default"].STAR:
                this.checkNumberOperands(binary.operator, left, right);
                return left * right;
            case tokenType_1["default"].BANG_EQUAL: return !this.isEqual(left, right);
            case tokenType_1["default"].EQUAL_EQUAL: return this.isEqual(left, right);
        }
        return null;
    };
    Interpreter.prototype.visitGroupingExpr = function (grouping) {
        return this.evaluate(grouping.expr);
    };
    Interpreter.prototype.visitLiteralExpr = function (literal) {
        return literal.value;
    };
    Interpreter.prototype.visitUnaryExpr = function (unary) {
        var right = this.evaluate(unary.right);
        switch (unary.operator.type) {
            case tokenType_1["default"].BANG:
                return !this.isTruthy(right);
            case tokenType_1["default"].MINUS:
                this.checkNumberOperand(unary.operator, right);
                return -right;
        }
        return null;
    };
    //
    Interpreter.prototype.visitExpressionStmt = function (stmt) {
        this.evaluate(stmt.expression);
    };
    Interpreter.prototype.visitPrintStmt = function (stmt) {
        var value = this.evaluate(stmt.expression);
        console.log(value);
    };
    //#region Helpers
    Interpreter.prototype.checkNumberOperand = function (operator, operand) {
        if (typeof operand === 'number')
            return;
        throw new errors_1.RuntimeError(operator, "Operand must be a number.");
    };
    Interpreter.prototype.checkNumberOperands = function (operator, left, right) {
        if (typeof left === 'number' && typeof right === 'number')
            return;
        throw new errors_1.RuntimeError(operator, "Operands must be numbers.");
    };
    Interpreter.prototype.evaluate = function (expr) {
        return expr.accept(this);
    };
    Interpreter.prototype.isTruthy = function (object) {
        if (object == null)
            return false;
        if (typeof (object) === 'boolean')
            return object;
        return true;
    };
    Interpreter.prototype.isEqual = function (a, b) {
        return a !== null && a === b;
    };
    return Interpreter;
}());
exports["default"] = Interpreter;
//# sourceMappingURL=interpreter.js.map