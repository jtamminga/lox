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
var Expr = /** @class */ (function () {
    function Expr() {
    }
    return Expr;
}());
exports["default"] = Expr;
var Binary = /** @class */ (function (_super) {
    __extends(Binary, _super);
    function Binary(left, operator, right) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    Binary.prototype.accept = function (visitor) {
        return visitor.visitBinaryExpr(this);
    };
    return Binary;
}(Expr));
exports.Binary = Binary;
var Grouping = /** @class */ (function (_super) {
    __extends(Grouping, _super);
    function Grouping(expr) {
        var _this = _super.call(this) || this;
        _this.expr = expr;
        return _this;
    }
    Grouping.prototype.accept = function (visitor) {
        return visitor.visitGroupingExpr(this);
    };
    return Grouping;
}(Expr));
exports.Grouping = Grouping;
var Literal = /** @class */ (function (_super) {
    __extends(Literal, _super);
    function Literal(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    Literal.prototype.accept = function (visitor) {
        return visitor.visitLiteralExpr(this);
    };
    return Literal;
}(Expr));
exports.Literal = Literal;
var Unary = /** @class */ (function (_super) {
    __extends(Unary, _super);
    function Unary(operator, right) {
        var _this = _super.call(this) || this;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    Unary.prototype.accept = function (visitor) {
        return visitor.visitUnaryExpr(this);
    };
    return Unary;
}(Expr));
exports.Unary = Unary;
/**
 * Represents just a variable without an initialization
 * variable -> "var" IDENTIFIER ";"
 */
var Variable = /** @class */ (function (_super) {
    __extends(Variable, _super);
    function Variable(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        return _this;
    }
    Variable.prototype.accept = function (visitor) {
        return visitor.visitVariableExpr(this);
    };
    return Variable;
}(Expr));
exports.Variable = Variable;
var Assign = /** @class */ (function (_super) {
    __extends(Assign, _super);
    function Assign(name, value) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    Assign.prototype.accept = function (visitor) {
        return visitor.visitAssignExpr(this);
    };
    return Assign;
}(Expr));
exports.Assign = Assign;
var Logical = /** @class */ (function (_super) {
    __extends(Logical, _super);
    function Logical(left, operator, right) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.operator = operator;
        _this.right = right;
        return _this;
    }
    Logical.prototype.accept = function (visitor) {
        return visitor.visitLogicalExpr(this);
    };
    return Logical;
}(Expr));
exports.Logical = Logical;
var Call = /** @class */ (function (_super) {
    __extends(Call, _super);
    function Call(callee, paren, args) {
        var _this = _super.call(this) || this;
        _this.callee = callee;
        _this.paren = paren;
        _this.arguments = args;
        return _this;
    }
    Call.prototype.accept = function (visitor) {
        return visitor.visitCallExpr(this);
    };
    return Call;
}(Expr));
exports.Call = Call;
var Get = /** @class */ (function (_super) {
    __extends(Get, _super);
    function Get(object, name) {
        var _this = _super.call(this) || this;
        _this.object = object;
        _this.name = name;
        return _this;
    }
    Get.prototype.accept = function (visitor) {
        return visitor.visitGetExpr(this);
    };
    return Get;
}(Expr));
exports.Get = Get;
var Set = /** @class */ (function (_super) {
    __extends(Set, _super);
    function Set(object, name, value) {
        var _this = _super.call(this) || this;
        _this.object = object;
        _this.name = name;
        _this.value = value;
        return _this;
    }
    Set.prototype.accept = function (visitor) {
        return visitor.visitSetExpr(this);
    };
    return Set;
}(Expr));
exports.Set = Set;
var This = /** @class */ (function (_super) {
    __extends(This, _super);
    function This(keyword) {
        var _this = _super.call(this) || this;
        _this.keyword = keyword;
        return _this;
    }
    This.prototype.accept = function (visitor) {
        return visitor.visitThisExpr(this);
    };
    return This;
}(Expr));
exports.This = This;
var Super = /** @class */ (function (_super) {
    __extends(Super, _super);
    function Super(keyword, method) {
        var _this = _super.call(this) || this;
        _this.keyword = keyword;
        _this.method = method;
        return _this;
    }
    Super.prototype.accept = function (visitor) {
        return visitor.visitSuperExpr(this);
    };
    return Super;
}(Expr));
exports.Super = Super;
var ArrayLiteral = /** @class */ (function (_super) {
    __extends(ArrayLiteral, _super);
    function ArrayLiteral(elements, bracket) {
        var _this = _super.call(this) || this;
        _this.elements = elements;
        _this.bracket = bracket;
        return _this;
    }
    ArrayLiteral.prototype.accept = function (visitor) {
        return visitor.visitArrayLiteralExpr(this);
    };
    return ArrayLiteral;
}(Expr));
exports.ArrayLiteral = ArrayLiteral;
var IndexGet = /** @class */ (function (_super) {
    __extends(IndexGet, _super);
    function IndexGet(indexee, bracket, index) {
        var _this = _super.call(this) || this;
        _this.indexee = indexee;
        _this.bracket = bracket;
        _this.index = index;
        return _this;
    }
    IndexGet.prototype.accept = function (visitor) {
        return visitor.visitIndexGetExpr(this);
    };
    return IndexGet;
}(Expr));
exports.IndexGet = IndexGet;
var IndexSet = /** @class */ (function (_super) {
    __extends(IndexSet, _super);
    function IndexSet(indexee, bracket, index, value) {
        var _this = _super.call(this) || this;
        _this.indexee = indexee;
        _this.bracket = bracket;
        _this.index = index;
        _this.value = value;
        return _this;
    }
    IndexSet.prototype.accept = function (visitor) {
        return visitor.visitIndexSetExpr(this);
    };
    return IndexSet;
}(Expr));
exports.IndexSet = IndexSet;
//# sourceMappingURL=expr.js.map