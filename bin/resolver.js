"use strict";
exports.__esModule = true;
var Expr = require("./expr");
var Stmt = require("./statement");
var lox_1 = require("./lox");
var Resolver = /** @class */ (function () {
    function Resolver(interpreter) {
        this.scopes = [];
        this.currentFunction = FunctionType.None;
        this.currentClass = ClassType.None;
        this.interpreter = interpreter;
    }
    Resolver.prototype.resolve = function (statements) {
        if (statements instanceof Expr["default"]) {
            statements.accept(this);
            return;
        }
        if (statements instanceof Stmt["default"]) {
            statements.accept(this);
            return;
        }
        for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
            var statement = statements_1[_i];
            statement.accept(this);
        }
    };
    Resolver.prototype.visitBinaryExpr = function (binary) {
        this.resolve(binary.left);
        this.resolve(binary.right);
    };
    Resolver.prototype.visitGroupingExpr = function (grouping) {
        this.resolve(grouping.expr);
    };
    Resolver.prototype.visitLiteralExpr = function (literal) {
    };
    Resolver.prototype.visitUnaryExpr = function (unary) {
        this.resolve(unary.right);
    };
    Resolver.prototype.visitVariableExpr = function (expr) {
        if (this.scopes.length > 0 && this.curScope().get(expr.name.lexeme) === false) {
            lox_1.error(expr.name, "Cannot read local variable in its own initializer.");
        }
        this.resolveLocal(expr, expr.name);
    };
    Resolver.prototype.visitAssignExpr = function (expr) {
        this.resolve(expr.value);
        this.resolveLocal(expr, expr.name);
    };
    Resolver.prototype.visitLogicalExpr = function (expr) {
        this.resolve(expr.left);
        this.resolve(expr.right);
    };
    Resolver.prototype.visitCallExpr = function (expr) {
        this.resolve(expr.callee);
        for (var _i = 0, _a = expr.arguments; _i < _a.length; _i++) {
            var arg = _a[_i];
            this.resolve(arg);
        }
    };
    Resolver.prototype.visitGetExpr = function (expr) {
        this.resolve(expr.object);
    };
    Resolver.prototype.visitSetExpr = function (expr) {
        this.resolve(expr.value);
        this.resolve(expr.object);
    };
    Resolver.prototype.visitThisExpr = function (expr) {
        if (this.currentClass == ClassType.None) {
            lox_1.error(expr.keyword, "Cannot use 'this' outside of a class.");
            return;
        }
        this.resolveLocal(expr, expr.keyword);
    };
    Resolver.prototype.visitClassStmt = function (stmt) {
        var enclosingClass = this.currentClass;
        this.currentClass = ClassType.Class;
        this.declare(stmt.name);
        this.define(stmt.name);
        this.beginScope();
        this.curScope().set("this", true);
        for (var _i = 0, _a = stmt.methods; _i < _a.length; _i++) {
            var method = _a[_i];
            var declaration = FunctionType.Method;
            this.resolveFunction(method, declaration);
        }
        this.endScope();
        this.currentClass = enclosingClass;
    };
    Resolver.prototype.visitExpressionStmt = function (stmt) {
        this.resolve(stmt.expression);
    };
    Resolver.prototype.visitPrintStmt = function (stmt) {
        this.resolve(stmt.expression);
    };
    Resolver.prototype.visitVarStmt = function (stmt) {
        this.declare(stmt.name);
        if (stmt.initializer != null) {
            this.resolve(stmt.initializer);
        }
        this.define(stmt.name);
    };
    Resolver.prototype.visitBlockStmt = function (stmt) {
        this.beginScope();
        this.resolve(stmt.statements);
        this.endScope();
    };
    Resolver.prototype.visitIfStmt = function (stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.thenBranch);
        if (stmt.elseBranch != null)
            this.resolve(stmt.elseBranch);
    };
    Resolver.prototype.visitWhileStmt = function (stmt) {
        this.resolve(stmt.condition);
        this.resolve(stmt.body);
    };
    Resolver.prototype.visitFunctionStmt = function (stmt) {
        this.declare(stmt.name);
        this.define(stmt.name);
        this.resolveFunction(stmt, FunctionType.Function);
    };
    Resolver.prototype.visitReturnStmt = function (stmt) {
        if (this.currentFunction == FunctionType.None) {
            lox_1.error(stmt.keyword, "Cannot return when not in function.");
        }
        if (stmt.value != null) {
            this.resolve(stmt.value);
        }
    };
    //#region Helpers
    Resolver.prototype.beginScope = function () {
        this.scopes.push(new Map());
    };
    Resolver.prototype.endScope = function () {
        this.scopes.pop();
    };
    // 
    // Variable bindings happen in 2 seperate stages - declaring & defining.
    //
    // Consider the following:
    //   var a = "outer";
    //   {
    //       var a = a;
    //   }
    //
    // Three options:
    // 1) run initializer, then put var in scope
    //    > this would make the inner a set to "outer"
    // 2) put var in scope, then run initializer
    //    > a would just be set to itself (so just nil)
    // 3) make it an error to reference a variable in its initializer
    //    > the one we do, because this is most likely a mistake
    // 
    Resolver.prototype.declare = function (name) {
        if (this.scopes.length == 0)
            return;
        var scope = this.curScope();
        if (scope.has(name.lexeme)) {
            lox_1.error(name, "Variable with this name already declared in this scope.");
        }
        scope.set(name.lexeme, false);
    };
    Resolver.prototype.define = function (name) {
        if (this.scopes.length == 0)
            return;
        this.curScope().set(name.lexeme, true);
    };
    /**
     * Resolve the scope the variable is declared
     * @param expr The expression representing the variable
     * @param name The variable token
     */
    Resolver.prototype.resolveLocal = function (expr, name) {
        for (var i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i);
                return;
            }
        }
        // not found, assume it is global
    };
    Resolver.prototype.resolveFunction = function (func, type) {
        var enclosingFunction = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for (var _i = 0, _a = func.params; _i < _a.length; _i++) {
            var param = _a[_i];
            this.declare(param);
            this.define(param);
        }
        this.resolve(func.body);
        this.endScope();
        this.currentFunction = enclosingFunction;
    };
    Resolver.prototype.curScope = function () {
        return this.scopes.slice(-1)[0];
    };
    return Resolver;
}());
exports["default"] = Resolver;
var FunctionType;
(function (FunctionType) {
    FunctionType[FunctionType["None"] = 0] = "None";
    FunctionType[FunctionType["Function"] = 1] = "Function";
    FunctionType[FunctionType["Method"] = 2] = "Method";
})(FunctionType || (FunctionType = {}));
var ClassType;
(function (ClassType) {
    ClassType[ClassType["None"] = 0] = "None";
    ClassType[ClassType["Class"] = 1] = "Class";
})(ClassType || (ClassType = {}));
//# sourceMappingURL=resolver.js.map