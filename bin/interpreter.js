"use strict";
exports.__esModule = true;
var tokenType_1 = require("./tokenType");
var errors_1 = require("./errors");
var lox_1 = require("./lox");
var environment_1 = require("./environment");
var loxFunction_1 = require("./loxFunction");
var return_1 = require("./return");
var Interpreter = /** @class */ (function () {
    function Interpreter() {
        this.globals = new environment_1["default"]();
        this.environment = this.globals;
        // this.globals.define("clock")
        var test = {
            arity: function () { return 0; },
            call: function (interpreter, args) {
                return Date.now();
            }
        };
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
    Interpreter.prototype.executeBlock = function (statements, environment) {
        var previous = this.environment;
        try {
            this.environment = environment;
            for (var _i = 0, statements_2 = statements; _i < statements_2.length; _i++) {
                var statement = statements_2[_i];
                this.execute(statement);
            }
        }
        finally {
            this.environment = previous;
        }
    };
    //
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
    Interpreter.prototype.visitVariableExpr = function (expr) {
        return this.environment.get(expr.name);
    };
    Interpreter.prototype.visitAssignExpr = function (expr) {
        var value = this.evaluate(expr.value);
        this.environment.assign(expr.name, value);
        return value;
    };
    Interpreter.prototype.visitLogicalExpr = function (expr) {
        var left = this.evaluate(expr.left);
        if (expr.operator.type == tokenType_1["default"].OR) {
            if (this.isTruthy(left))
                return left;
        }
        else {
            if (!this.isTruthy(left))
                return left;
        }
        return this.evaluate(expr.right);
    };
    Interpreter.prototype.visitCallExpr = function (expr) {
        var _this = this;
        var callee = this.evaluate(expr.callee);
        var args = expr.arguments.map(function (arg) {
            return _this.evaluate(arg);
        });
        // not instance of LoxCallable
        if (!(typeof callee.call === 'function')) {
            throw new errors_1.RuntimeError(expr.paren, "Can only call functions and classes.");
        }
        var func = callee;
        if (args.length != func.arity()) {
            throw new errors_1.RuntimeError(expr.paren, "Expected " + func.arity() + " arguments but got " + args.length + ".");
        }
        return func.call(this, args);
    };
    //
    Interpreter.prototype.visitExpressionStmt = function (stmt) {
        this.evaluate(stmt.expression);
    };
    Interpreter.prototype.visitFunctionStmt = function (stmt) {
        var func = new loxFunction_1["default"](stmt, this.environment);
        this.environment.define(stmt.name.lexeme, func);
    };
    Interpreter.prototype.visitPrintStmt = function (stmt) {
        var value = this.evaluate(stmt.expression);
        console.log(value);
    };
    Interpreter.prototype.visitReturnStmt = function (stmt) {
        var value = null;
        if (stmt.value != null)
            value = this.evaluate(stmt.value);
        throw new return_1["default"](value);
    };
    Interpreter.prototype.visitVarStmt = function (stmt) {
        var value;
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer);
        }
        this.environment.define(stmt.name.lexeme, value);
    };
    Interpreter.prototype.visitBlockStmt = function (stmt) {
        this.executeBlock(stmt.statements, new environment_1["default"](this.environment));
    };
    Interpreter.prototype.visitIfStmt = function (stmt) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch != null) {
            this.execute(stmt.elseBranch);
        }
    };
    Interpreter.prototype.visitWhileStmt = function (stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
    };
    //#region Helpers
    Interpreter.prototype.execute = function (statement) {
        statement.accept(this);
    };
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