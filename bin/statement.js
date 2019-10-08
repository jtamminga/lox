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
/**
 * Represents a variable with initialization
 * var -> "var" IDENTIFIER "=" expression ";"
 */
var Var = /** @class */ (function (_super) {
    __extends(Var, _super);
    function Var(name, initializer) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.initializer = initializer;
        return _this;
    }
    Var.prototype.accept = function (visitor) {
        return visitor.visitVarStmt(this);
    };
    return Var;
}(Stmt));
exports.Var = Var;
var Block = /** @class */ (function (_super) {
    __extends(Block, _super);
    function Block(statements) {
        var _this = _super.call(this) || this;
        _this.statements = statements;
        return _this;
    }
    Block.prototype.accept = function (visitor) {
        return visitor.visitBlockStmt(this);
    };
    return Block;
}(Stmt));
exports.Block = Block;
var If = /** @class */ (function (_super) {
    __extends(If, _super);
    function If(condition, thenBranch, elseBranch) {
        var _this = _super.call(this) || this;
        _this.condition = condition;
        _this.thenBranch = thenBranch;
        _this.elseBranch = elseBranch;
        return _this;
    }
    If.prototype.accept = function (visitor) {
        return visitor.visitIfStmt(this);
    };
    return If;
}(Stmt));
exports.If = If;
var While = /** @class */ (function (_super) {
    __extends(While, _super);
    function While(condition, body) {
        var _this = _super.call(this) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    While.prototype.accept = function (visitor) {
        return visitor.visitWhileStmt(this);
    };
    return While;
}(Stmt));
exports.While = While;
var Function = /** @class */ (function (_super) {
    __extends(Function, _super);
    function Function(name, params, body) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.params = params;
        _this.body = body;
        return _this;
    }
    Function.prototype.accept = function (visitor) {
        return visitor.visitFunctionStmt(this);
    };
    return Function;
}(Stmt));
exports.Function = Function;
var Return = /** @class */ (function (_super) {
    __extends(Return, _super);
    function Return(keyword, value) {
        var _this = _super.call(this) || this;
        _this.keyword = keyword;
        _this.value = value;
        return _this;
    }
    Return.prototype.accept = function (visitor) {
        return visitor.visitReturnStmt(this);
    };
    return Return;
}(Stmt));
exports.Return = Return;
//# sourceMappingURL=statement.js.map