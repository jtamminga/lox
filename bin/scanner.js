"use strict";
exports.__esModule = true;
var token_1 = require("./token");
var tokenType_1 = require("./tokenType");
var lox_1 = require("./lox");
var keywords = {
    "and": tokenType_1["default"].AND,
    "class": tokenType_1["default"].CLASS,
    "else": tokenType_1["default"].ELSE,
    "false": tokenType_1["default"].FALSE,
    "for": tokenType_1["default"].FOR,
    "fun": tokenType_1["default"].FUN,
    "if": tokenType_1["default"].IF,
    "nil": tokenType_1["default"].NIL,
    "or": tokenType_1["default"].OR,
    "print": tokenType_1["default"].PRINT,
    "return": tokenType_1["default"].RETURN,
    "super": tokenType_1["default"].SUPER,
    "this": tokenType_1["default"].THIS,
    "true": tokenType_1["default"].TRUE,
    "var": tokenType_1["default"].VAR,
    "while": tokenType_1["default"].WHILE
};
var Scanner = /** @class */ (function () {
    function Scanner(source) {
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.source = source;
    }
    Scanner.prototype.scanTokens = function () {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new token_1["default"](tokenType_1["default"].EOF, "", null, this.line));
        return this.tokens;
    };
    Scanner.prototype.scanToken = function () {
        var c = this.advance();
        switch (c) {
            case '(':
                this.addToken(tokenType_1["default"].LEFT_PAREN);
                break;
            case ')':
                this.addToken(tokenType_1["default"].RIGHT_PAREN);
                break;
            case '{':
                this.addToken(tokenType_1["default"].LEFT_BRACE);
                break;
            case '}':
                this.addToken(tokenType_1["default"].RIGHT_BRACE);
                break;
            case '[':
                this.addToken(tokenType_1["default"].LEFT_SQR);
                break;
            case ']':
                this.addToken(tokenType_1["default"].RIGHT_SQR);
                break;
            case ',':
                this.addToken(tokenType_1["default"].COMMA);
                break;
            case '.':
                this.addToken(tokenType_1["default"].DOT);
                break;
            case '-':
                this.addToken(tokenType_1["default"].MINUS);
                break;
            case '+':
                this.addToken(tokenType_1["default"].PLUS);
                break;
            case ';':
                this.addToken(tokenType_1["default"].SEMICOLON);
                break;
            case '*':
                this.addToken(tokenType_1["default"].STAR);
                break;
            case '!':
                this.addToken(this.match('=') ? tokenType_1["default"].BANG_EQUAL : tokenType_1["default"].BANG);
                break;
            case '=':
                this.addToken(this.match('=') ? tokenType_1["default"].EQUAL_EQUAL : tokenType_1["default"].EQUAL);
                break;
            case '<':
                this.addToken(this.match('=') ? tokenType_1["default"].LESS_EQUAL : tokenType_1["default"].LESS);
                break;
            case '>':
                this.addToken(this.match('=') ? tokenType_1["default"].GREATER_EQUAL : tokenType_1["default"].GREATER);
                break;
            case '/':
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd())
                        this.advance();
                }
                else {
                    this.addToken(tokenType_1["default"].SLASH);
                }
                break;
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n':
                this.line++;
                break;
            case '"':
                this.string();
                break;
            default:
                if (this.isDigit(c)) {
                    this.number();
                }
                else if (this.isAlpha(c)) {
                    this.identifier();
                }
                else {
                    lox_1.error(this.line, 'Unexpected character.');
                }
                break;
        }
    };
    Scanner.prototype.string = function () {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n')
                this.line++;
            this.advance();
        }
        if (this.isAtEnd()) {
            lox_1.error(this.line, "Unterminated string.");
            return;
        }
        // the closing "
        this.advance();
        // trim the surrounding quotes
        var value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(tokenType_1["default"].STRING, value);
    };
    Scanner.prototype.number = function () {
        while (this.isDigit(this.peek()))
            this.advance();
        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance(); // consume .
            while (this.isDigit(this.peek()))
                this.advance();
        }
        var value = this.source.substring(this.start, this.current);
        this.addToken(tokenType_1["default"].NUMBER, Number.parseFloat(value));
    };
    Scanner.prototype.identifier = function () {
        while (this.isAlphaNumeric(this.peek()))
            this.advance();
        var text = this.source.substring(this.start, this.current);
        var type = keywords[text];
        if (type == null)
            type = tokenType_1["default"].IDENTIFIER;
        this.addToken(type);
    };
    //#region Helpers
    Scanner.prototype.advance = function () {
        return this.source[this.current++];
    };
    Scanner.prototype.match = function (expected) {
        if (this.isAtEnd())
            return false;
        if (this.source[this.current] != expected)
            return false;
        this.current++;
        return true;
    };
    Scanner.prototype.peek = function () {
        if (this.isAtEnd())
            return '\0';
        return this.source[this.current];
    };
    Scanner.prototype.peekNext = function () {
        if (this.current + 1 >= this.source.length)
            return '\0';
        return this.source[this.current + 1];
    };
    Scanner.prototype.addToken = function (type, literal) {
        var text = this.source.substring(this.start, this.current);
        this.tokens.push(new token_1["default"](type, text, literal, this.line));
    };
    Scanner.prototype.isAtEnd = function () {
        return this.current >= this.source.length;
    };
    Scanner.prototype.isDigit = function (c) {
        return c >= '0' && c <= '9';
    };
    Scanner.prototype.isAlpha = function (c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '_';
    };
    Scanner.prototype.isAlphaNumeric = function (c) {
        return this.isAlpha(c) || this.isDigit(c);
    };
    return Scanner;
}());
exports["default"] = Scanner;
//# sourceMappingURL=scanner.js.map