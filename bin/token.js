"use strict";
exports.__esModule = true;
var tokenType_1 = require("./tokenType");
var Token = /** @class */ (function () {
    function Token(type, lexeme, literal, line) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    Token.prototype.toString = function () {
        return tokenType_1["default"][this.type] + " " + this.lexeme + " " + this.literal;
    };
    return Token;
}());
exports["default"] = Token;
//# sourceMappingURL=token.js.map