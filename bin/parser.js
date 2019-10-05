"use strict";
exports.__esModule = true;
var Expr = require("./expr");
var tokenType_1 = require("./tokenType");
var Lox = require("./lox");
var errors_1 = require("./errors");
var Stmt = require("./statement");
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.current = 0;
        this.tokens = tokens;
    }
    // program -> statement* EOF
    Parser.prototype.parse = function () {
        var statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }
        return statements;
    };
    // declaration -> varDecl
    //              | statment
    Parser.prototype.declaration = function () {
        try {
            if (this.match(tokenType_1["default"].VAR))
                return this.varDeclaration();
            return this.statement();
        }
        catch (error) {
            if (error instanceof errors_1.ParseError) {
                this.synchronize();
                return null;
            }
            // at this point something went really wrong
            throw error;
        }
    };
    // varDecl -> "var" IDENTIFIER ( "=" expression )? ";"
    Parser.prototype.varDeclaration = function () {
        var name = this.consume(tokenType_1["default"].IDENTIFIER, "Expect variable name.");
        var initializer;
        if (this.match(tokenType_1["default"].EQUAL)) {
            initializer = this.expression();
        }
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after variable declaration.");
        return new Stmt.Var(name, initializer);
    };
    // statement -> exprStmt
    //            | printStmt
    Parser.prototype.statement = function () {
        if (this.match(tokenType_1["default"].PRINT))
            return this.printStatement();
        return this.expressionStatement();
    };
    // printStmt -> "print" expression ";"
    Parser.prototype.printStatement = function () {
        var value = this.expression();
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    };
    // exprStmt -> expression ";"
    Parser.prototype.expressionStatement = function () {
        var expr = this.expression();
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    };
    // expression -> equality
    Parser.prototype.expression = function () {
        return this.equality();
    };
    // equality -> comparison (( "!=" | "==" ) comparison)*
    Parser.prototype.equality = function () {
        var operators = [tokenType_1["default"].BANG_EQUAL, tokenType_1["default"].EQUAL_EQUAL];
        return this.binaryOperator(operators, this.comparison.bind(this));
    };
    // comparison -> addition (( ">" | ">=" | "<" | "<=" ) addition)*
    Parser.prototype.comparison = function () {
        var operators = [tokenType_1["default"].GREATER, tokenType_1["default"].GREATER_EQUAL, tokenType_1["default"].LESS, tokenType_1["default"].LESS_EQUAL];
        return this.binaryOperator(operators, this.addition.bind(this));
    };
    // addition -> multiplication (( "-" | "+" ) multiplication)*
    Parser.prototype.addition = function () {
        var operators = [tokenType_1["default"].MINUS, tokenType_1["default"].PLUS];
        return this.binaryOperator(operators, this.multiplication.bind(this));
    };
    // multiplication -> unary (( "/" | "*" ) unary)*
    Parser.prototype.multiplication = function () {
        var operators = [tokenType_1["default"].SLASH, tokenType_1["default"].STAR];
        return this.binaryOperator(operators, this.unary.bind(this));
    };
    // unary -> ( "!" | "-" ) unary
    //        | primary
    Parser.prototype.unary = function () {
        if (this.match(tokenType_1["default"].BANG, tokenType_1["default"].MINUS)) {
            var operator = this.previous();
            var right = this.unary();
            return new Expr.Unary(operator, right);
        }
        return this.primary();
    };
    // primary -> NUMBER | STRING | "false" | "true" | "nil"
    //          | "(" expression ")"
    //          | IDENTIFIER
    Parser.prototype.primary = function () {
        if (this.match(tokenType_1["default"].FALSE))
            return new Expr.Literal(false);
        if (this.match(tokenType_1["default"].TRUE))
            return new Expr.Literal(true);
        if (this.match(tokenType_1["default"].NIL))
            return new Expr.Literal(null);
        if (this.match(tokenType_1["default"].NUMBER, tokenType_1["default"].STRING)) {
            return new Expr.Literal(this.previous().literal);
        }
        if (this.match(tokenType_1["default"].IDENTIFIER)) {
            return new Expr.Variable(this.previous());
        }
        if (this.match(tokenType_1["default"].LEFT_PAREN)) {
            var expr = this.expression();
            this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after expression.");
            return new Expr.Grouping(expr);
        }
        throw this.error(this.peek(), "Expect expression.");
    };
    /**
     * Generalize the binary operators
     * @param types The collection of types with the same precidence
     * @param higherOperator The operator with higher precidence
     */
    Parser.prototype.binaryOperator = function (types, higherOperator) {
        var expr = higherOperator.call(this);
        while (this.match.apply(this, types)) {
            var operator = this.previous();
            var right = higherOperator.call(this);
            expr = new Expr.Binary(expr, operator, right);
        }
        return expr;
    };
    //#region Helpers
    /**
     * Check if the next token is of the expected type. If so, consume it.
     * @param type The type to expect
     * @param message The message if the token was not found
     */
    Parser.prototype.consume = function (type, message) {
        if (this.check(type))
            return this.advance();
        throw this.error(this.peek(), message);
    };
    /**
     * Display an error with the token causing it
     * @param token The token that is causing the error
     * @param message The error message
     */
    Parser.prototype.error = function (token, message) {
        Lox.error(token, message);
        return new errors_1.ParseError();
    };
    /**
     * Consume tokens until a new statement starts.
     * This will help us get back on track to keep parsing after an error.
     */
    Parser.prototype.synchronize = function () {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type == tokenType_1["default"].SEMICOLON)
                return;
            switch (this.peek().type) {
                case tokenType_1["default"].CLASS:
                case tokenType_1["default"].FUN:
                case tokenType_1["default"].VAR:
                case tokenType_1["default"].FOR:
                case tokenType_1["default"].IF:
                case tokenType_1["default"].WHILE:
                case tokenType_1["default"].PRINT:
                case tokenType_1["default"].RETURN:
                    return;
            }
        }
        this.advance();
    };
    /**
     * Checks to see if the current token is any of the given types. Advances if true.
     */
    Parser.prototype.match = function () {
        var types = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            types[_i] = arguments[_i];
        }
        for (var _a = 0, types_1 = types; _a < types_1.length; _a++) {
            var type = types_1[_a];
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    };
    /**
    * Returns true if the current token is of the given type
    */
    Parser.prototype.check = function (type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type == type;
    };
    /**
     * Consumes the current token then returns it
     */
    Parser.prototype.advance = function () {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    };
    /**
     * Check if we ran out of tokens to parse
     */
    Parser.prototype.isAtEnd = function () {
        return this.peek().type == tokenType_1["default"].EOF;
    };
    /**
     * Returns the current token we hat yet to consume
     */
    Parser.prototype.peek = function () {
        return this.tokens[this.current];
    };
    /**
     * Returns the most recently consumed token
     */
    Parser.prototype.previous = function () {
        return this.tokens[this.current - 1];
    };
    return Parser;
}());
exports["default"] = Parser;
//# sourceMappingURL=parser.js.map