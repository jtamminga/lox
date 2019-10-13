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
    // declaration -> classDecl
    //              | funDecl
    //              | varDecl
    //              | statment
    Parser.prototype.declaration = function () {
        try {
            if (this.match(tokenType_1["default"].CLASS))
                return this.classDeclaration();
            if (this.match(tokenType_1["default"].FUN))
                return this["function"]("function");
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
    // classDecl -> "class" IDENTIFIER ( "<" IDENTIFIER )?
    //              "{" function* "}"
    Parser.prototype.classDeclaration = function () {
        var name = this.consume(tokenType_1["default"].IDENTIFIER, "Expect class name.");
        var superClass = null;
        if (this.match(tokenType_1["default"].LESS)) {
            this.consume(tokenType_1["default"].IDENTIFIER, "Expect superclass name.");
            superClass = new Expr.Variable(this.previous());
        }
        this.consume(tokenType_1["default"].LEFT_BRACE, "Expect '{' before class body.");
        var methods = [];
        while (!this.check(tokenType_1["default"].RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this["function"]("method"));
        }
        this.consume(tokenType_1["default"].RIGHT_BRACE, "Expect '}' after class body.");
        return new Stmt.Class(name, methods, superClass);
    };
    // function -> IDENTIFIER "(" parameters? ")" block
    Parser.prototype["function"] = function (kind) {
        // function name
        var name = this.consume(tokenType_1["default"].IDENTIFIER, "Expect " + kind + " name.");
        // parameters
        this.consume(tokenType_1["default"].LEFT_PAREN, "Expect '(' after " + kind + " name.");
        var params = [];
        if (!this.check(tokenType_1["default"].RIGHT_PAREN)) {
            do {
                if (params.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 parameters.");
                }
                params.push(this.consume(tokenType_1["default"].IDENTIFIER, "Expect parameter name."));
            } while (this.match(tokenType_1["default"].COMMA));
        }
        this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after parameters");
        // body
        this.consume(tokenType_1["default"].LEFT_BRACE, "Expect '{' before " + kind + " body.");
        var body = this.block();
        return new Stmt.Function(name, params, body);
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
    //            | forStmt
    //            | ifStmt
    //            | printStmt
    //            | returnStmt
    //            | whileStmt
    //            | block
    Parser.prototype.statement = function () {
        if (this.match(tokenType_1["default"].FOR))
            return this.forStatement();
        if (this.match(tokenType_1["default"].IF))
            return this.ifStatement();
        if (this.match(tokenType_1["default"].PRINT))
            return this.printStatement();
        if (this.match(tokenType_1["default"].RETURN))
            return this.returnStatement();
        if (this.match(tokenType_1["default"].WHILE))
            return this.whileStatement();
        if (this.match(tokenType_1["default"].LEFT_BRACE))
            return new Stmt.Block(this.block());
        return this.expressionStatement();
    };
    // printStmt -> "print" expression ";"
    Parser.prototype.printStatement = function () {
        var value = this.expression();
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after value.");
        return new Stmt.Print(value);
    };
    // returnStmt -> "return" expression? ";"
    Parser.prototype.returnStatement = function () {
        var keyword = this.previous();
        var value = null;
        if (!this.check(tokenType_1["default"].SEMICOLON)) {
            value = this.expression();
        }
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after return value.");
        return new Stmt.Return(keyword, value);
    };
    // block -> "{" declaration "}"
    Parser.prototype.block = function () {
        var statements = [];
        while (!this.check(tokenType_1["default"].RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration());
        }
        this.consume(tokenType_1["default"].RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    };
    // exprStmt -> expression ";"
    Parser.prototype.expressionStatement = function () {
        var expr = this.expression();
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after expression.");
        return new Stmt.Expression(expr);
    };
    // ifStatement -> "if" "(" expression ")" statement ( "else" statement )?
    Parser.prototype.ifStatement = function () {
        this.consume(tokenType_1["default"].LEFT_PAREN, "Expect '(' after 'if'.");
        var condition = this.expression();
        this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after if condition.");
        var thenBranch = this.statement();
        var elseBranch = null;
        if (this.match(tokenType_1["default"].ELSE)) {
            elseBranch = this.statement();
        }
        return new Stmt.If(condition, thenBranch, elseBranch);
    };
    // whileStmt -> "while" "(" expression ")" statement
    Parser.prototype.whileStatement = function () {
        this.consume(tokenType_1["default"].LEFT_PAREN, "Expect '(' after 'while'.");
        var condition = this.expression();
        this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after condition.");
        var body = this.statement();
        return new Stmt.While(condition, body);
    };
    // forStmt -> "for" "(" ( varDecl | exprStmt | ";" )
    //            expression? ";"
    //            expression? ")" statement
    Parser.prototype.forStatement = function () {
        // Note this technique is desugaring.
        // This function transforms the for loop to a while loop
        this.consume(tokenType_1["default"].LEFT_PAREN, "Expect '(' after 'for'.");
        // var declaration, or expression
        var initializer;
        if (this.match(tokenType_1["default"].SEMICOLON)) {
            initializer = null;
        }
        else if (this.match(tokenType_1["default"].VAR)) {
            initializer = this.varDeclaration();
        }
        else {
            initializer = this.expressionStatement();
        }
        // condition
        var condition;
        if (!this.check(tokenType_1["default"].SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(tokenType_1["default"].SEMICOLON, "Expect ';' after loop condition.");
        // increment
        var increment;
        if (!this.check(tokenType_1["default"].RIGHT_PAREN)) {
            increment = this.expression();
        }
        this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after for clauses.");
        var body = this.statement();
        // time to desugar :o
        // the body consists of the body
        // plus the incrementer if any
        if (increment != null) {
            body = new Stmt.Block([
                body,
                new Stmt.Expression(increment)
            ]);
        }
        // use a while loop to desugar the for loop
        if (condition == null)
            condition = new Expr.Literal(true);
        body = new Stmt.While(condition, body);
        if (initializer != null) {
            body = new Stmt.Block([
                initializer,
                body
            ]);
        }
        return body;
    };
    // expression -> assignment
    Parser.prototype.expression = function () {
        return this.assignment();
    };
    // asignment -> IDENTIFIER "=" assignment
    //            | logic_or
    Parser.prototype.assignment = function () {
        var expr = this.or();
        if (this.match(tokenType_1["default"].EQUAL)) {
            var equals = this.previous();
            var value = this.assignment();
            if (expr instanceof Expr.Variable) {
                return new Expr.Assign(expr.name, value);
            }
            else if (expr instanceof Expr.Get) {
                var get = expr;
                return new Expr.Set(get.object, get.name, value);
            }
            this.error(equals, "Invalid assignment target.");
        }
        return expr;
    };
    // logic_or -> logic_and ( "or" logic_and )*
    Parser.prototype.or = function () {
        var expr = this.and();
        while (this.match(tokenType_1["default"].OR)) {
            var operator = this.previous();
            var right = this.and();
            expr = new Expr.Logical(expr, operator, right);
        }
        return expr;
    };
    // logic_and -> equality ( "and" equality )*
    Parser.prototype.and = function () {
        var expr = this.equality();
        while (this.match(tokenType_1["default"].AND)) {
            var operator = this.previous();
            var right = this.equality();
            expr = new Expr.Logical(expr, operator, right);
        }
        return expr;
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
    //        | call
    Parser.prototype.unary = function () {
        if (this.match(tokenType_1["default"].BANG, tokenType_1["default"].MINUS)) {
            var operator = this.previous();
            var right = this.unary();
            return new Expr.Unary(operator, right);
        }
        return this.call();
    };
    // call -> primary ( "(" arguments? ")" | "." IDENTIFIER )*
    Parser.prototype.call = function () {
        var expr = this.primary();
        while (true) {
            if (this.match(tokenType_1["default"].LEFT_PAREN)) {
                expr = this.finishCall(expr);
            }
            else if (this.match(tokenType_1["default"].DOT)) {
                var name_1 = this.consume(tokenType_1["default"].IDENTIFIER, "Expect property name after '.'.");
                expr = new Expr.Get(expr, name_1);
            }
            else {
                break;
            }
        }
        return expr;
    };
    // arguments -> expression ( "," expression )*
    // Note: this also handles the paren tokens too,
    //       therefore not one-to-one with the grammer
    Parser.prototype.finishCall = function (callee) {
        var args = [];
        if (!this.check(tokenType_1["default"].RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.");
                }
                args.push(this.expression());
            } while (this.match(tokenType_1["default"].COMMA));
        }
        var paren = this.consume(tokenType_1["default"].RIGHT_PAREN, "Expect ')' after arguments.");
        return new Expr.Call(callee, paren, args);
    };
    // primary -> NUMBER | STRING | "false" | "true" | "nil" | "this"
    //          | "(" expression ")" | IDENTIFIER
    //          | "super" "." IDENTIFIER
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
        if (this.match(tokenType_1["default"].SUPER)) {
            var keyword = this.previous();
            this.consume(tokenType_1["default"].DOT, "Expect '.' after 'super'.");
            var method = this.consume(tokenType_1["default"].IDENTIFIER, "Expect superclass method name.");
            return new Expr.Super(keyword, method);
        }
        if (this.match(tokenType_1["default"].THIS))
            return new Expr.This(this.previous());
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