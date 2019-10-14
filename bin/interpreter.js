"use strict";
exports.__esModule = true;
var tokenType_1 = require("./tokenType");
var errors_1 = require("./errors");
var lox_1 = require("./lox");
var environment_1 = require("./environment");
var loxFunction_1 = require("./loxFunction");
var return_1 = require("./return");
var loxClass_1 = require("./loxClass");
var loxInstance_1 = require("./loxInstance");
var loxArray_1 = require("./loxArray");
var Interpreter = /** @class */ (function () {
    function Interpreter() {
        this.globals = new environment_1["default"]();
        this.environment = this.globals;
        this.locals = new Map();
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
            if (error instanceof errors_1.RuntimeError) {
                lox_1.runtimeError(error);
            }
            else {
                throw error;
            }
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
    Interpreter.prototype.resolve = function (expr, depth) {
        this.locals.set(expr, depth);
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
        return this.lookUpVariable(expr.name, expr);
    };
    Interpreter.prototype.visitAssignExpr = function (expr) {
        var value = this.evaluate(expr.value);
        var distance = this.locals.get(expr);
        if (distance != null) {
            this.environment.assignAt(distance, expr.name, value);
        }
        else {
            this.globals.assign(expr.name, value);
        }
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
    Interpreter.prototype.visitGetExpr = function (expr) {
        var object = this.evaluate(expr.object);
        if (object instanceof loxInstance_1["default"]) {
            return object.get(expr.name);
        }
        throw new errors_1.RuntimeError(expr.name, "Only instances have properties.");
    };
    Interpreter.prototype.visitSetExpr = function (expr) {
        var object = this.evaluate(expr.object);
        if (!(object instanceof loxInstance_1["default"])) {
            throw new errors_1.RuntimeError(expr.name, "Only instances have fields.");
        }
        var value = this.evaluate(expr.value);
        object.set(expr.name, value);
        return value;
    };
    Interpreter.prototype.visitThisExpr = function (expr) {
        return this.lookUpVariable(expr.keyword, expr);
    };
    Interpreter.prototype.visitSuperExpr = function (expr) {
        var distance = this.locals.get(expr);
        var superClass = this.environment.getAt(distance, "super");
        // "this" is always one level nearer than "super"'s environment
        var object = this.environment.getAt(distance - 1, "this");
        var method = superClass.findMethod(expr.method.lexeme);
        if (method == null) {
            throw new errors_1.RuntimeError(expr.method, "Undefined property '" + expr.method.lexeme + "'.");
        }
        return method.bind(object);
    };
    Interpreter.prototype.visitArrayLiteralExpr = function (expr) {
        var _this = this;
        var values = expr.elements.map(function (e) { return _this.evaluate(e); });
        return new loxArray_1["default"](values);
    };
    Interpreter.prototype.visitIndexGetExpr = function (expr) {
        var indexee = this.evaluate(expr.indexee);
        if (!(indexee instanceof loxArray_1["default"])) {
            throw new errors_1.RuntimeError(expr.bracket, "Cannot index this expression.");
        }
        var index = this.evaluate(expr.index);
        if (typeof index != "number") {
            throw new errors_1.RuntimeError(expr.bracket, "Can only use a number to index.");
        }
        if (indexee.elements[index] === undefined) {
            return null;
        }
        return indexee.elements[index];
    };
    Interpreter.prototype.visitIndexSetExpr = function (expr) {
        var array = this.evaluate(expr.indexee);
        if (!(array instanceof loxArray_1["default"])) {
            throw new errors_1.RuntimeError(expr.bracket, "Variable is not an array.");
        }
        var index = this.evaluate(expr.index);
        if (typeof index != "number") {
            throw new errors_1.RuntimeError(expr.bracket, "Can only use a number to index.");
        }
        var value = this.evaluate(expr.value);
        array.elements[index] = value;
    };
    // statements
    Interpreter.prototype.visitClassStmt = function (stmt) {
        var superClass = null;
        if (stmt.superClass != null) {
            superClass = this.evaluate(stmt.superClass);
            if (!(superClass instanceof loxClass_1["default"])) {
                throw new errors_1.RuntimeError(stmt.superClass.name, "Superclass must be a class.");
            }
        }
        this.environment.define(stmt.name.lexeme, null);
        if (stmt.superClass != null) {
            this.environment = new environment_1["default"](this.environment);
            this.environment.define("super", superClass);
        }
        var methods = new Map();
        for (var _i = 0, _a = stmt.methods; _i < _a.length; _i++) {
            var method = _a[_i];
            var func = new loxFunction_1["default"](method, this.environment, method.name.lexeme == "init");
            methods.set(method.name.lexeme, func);
        }
        var klass = new loxClass_1["default"](stmt.name.lexeme, methods, superClass);
        if (superClass != null) {
            this.environment = this.environment.enclosing;
        }
        this.environment.assign(stmt.name, klass);
    };
    Interpreter.prototype.visitExpressionStmt = function (stmt) {
        this.evaluate(stmt.expression);
    };
    Interpreter.prototype.visitFunctionStmt = function (stmt) {
        var func = new loxFunction_1["default"](stmt, this.environment, false);
        this.environment.define(stmt.name.lexeme, func);
    };
    Interpreter.prototype.visitPrintStmt = function (stmt) {
        var value = this.evaluate(stmt.expression);
        if (value === null) {
            console.log("nil");
        }
        else {
            console.log(value.toString());
        }
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
    Interpreter.prototype.lookUpVariable = function (name, expr) {
        var distance = this.locals.get(expr);
        if (distance != null) {
            return this.environment.getAt(distance, name.lexeme);
        }
        else {
            return this.globals.get(name);
        }
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