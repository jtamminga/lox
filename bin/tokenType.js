"use strict";
exports.__esModule = true;
var TokenType;
(function (TokenType) {
    // Single-character tokens.                      
    TokenType[TokenType["LEFT_PAREN"] = 0] = "LEFT_PAREN";
    TokenType[TokenType["RIGHT_PAREN"] = 1] = "RIGHT_PAREN";
    TokenType[TokenType["LEFT_BRACE"] = 2] = "LEFT_BRACE";
    TokenType[TokenType["RIGHT_BRACE"] = 3] = "RIGHT_BRACE";
    TokenType[TokenType["COMMA"] = 4] = "COMMA";
    TokenType[TokenType["DOT"] = 5] = "DOT";
    TokenType[TokenType["MINUS"] = 6] = "MINUS";
    TokenType[TokenType["PLUS"] = 7] = "PLUS";
    TokenType[TokenType["SEMICOLON"] = 8] = "SEMICOLON";
    TokenType[TokenType["SLASH"] = 9] = "SLASH";
    TokenType[TokenType["STAR"] = 10] = "STAR";
    TokenType[TokenType["LEFT_SQR"] = 11] = "LEFT_SQR";
    TokenType[TokenType["RIGHT_SQR"] = 12] = "RIGHT_SQR";
    // One or two character tokens.                  
    TokenType[TokenType["BANG"] = 13] = "BANG";
    TokenType[TokenType["BANG_EQUAL"] = 14] = "BANG_EQUAL";
    TokenType[TokenType["EQUAL"] = 15] = "EQUAL";
    TokenType[TokenType["EQUAL_EQUAL"] = 16] = "EQUAL_EQUAL";
    TokenType[TokenType["GREATER"] = 17] = "GREATER";
    TokenType[TokenType["GREATER_EQUAL"] = 18] = "GREATER_EQUAL";
    TokenType[TokenType["LESS"] = 19] = "LESS";
    TokenType[TokenType["LESS_EQUAL"] = 20] = "LESS_EQUAL";
    // Literals.                                     
    TokenType[TokenType["IDENTIFIER"] = 21] = "IDENTIFIER";
    TokenType[TokenType["STRING"] = 22] = "STRING";
    TokenType[TokenType["NUMBER"] = 23] = "NUMBER";
    // Keywords.                                     
    TokenType[TokenType["AND"] = 24] = "AND";
    TokenType[TokenType["CLASS"] = 25] = "CLASS";
    TokenType[TokenType["ELSE"] = 26] = "ELSE";
    TokenType[TokenType["FALSE"] = 27] = "FALSE";
    TokenType[TokenType["FUN"] = 28] = "FUN";
    TokenType[TokenType["FOR"] = 29] = "FOR";
    TokenType[TokenType["IF"] = 30] = "IF";
    TokenType[TokenType["NIL"] = 31] = "NIL";
    TokenType[TokenType["OR"] = 32] = "OR";
    TokenType[TokenType["PRINT"] = 33] = "PRINT";
    TokenType[TokenType["RETURN"] = 34] = "RETURN";
    TokenType[TokenType["SUPER"] = 35] = "SUPER";
    TokenType[TokenType["THIS"] = 36] = "THIS";
    TokenType[TokenType["TRUE"] = 37] = "TRUE";
    TokenType[TokenType["VAR"] = 38] = "VAR";
    TokenType[TokenType["WHILE"] = 39] = "WHILE";
    TokenType[TokenType["EOF"] = 40] = "EOF";
})(TokenType || (TokenType = {}));
// need to 'export default' this way
// https://github.com/Microsoft/TypeScript/issues/3320#issuecomment-107241679
exports["default"] = TokenType;
//# sourceMappingURL=tokenType.js.map