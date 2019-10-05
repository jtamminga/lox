import Token from "./token";
import * as Expr from "./expr";
import Type from './tokenType'
import * as Lox from "./lox";
import { type } from "os";
import { ParseError } from "./errors";
import * as Stmt from "./statement"

export default class Parser {
    private tokens: Token[]
    private current: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    // program -> statement* EOF
    public parse(): Stmt.default[] {
        let statements: Stmt.default[] = []
        while (!this.isAtEnd()) {
            statements.push(this.statement())
        }

        return statements
    }

    // statement -> exprStmt
    //            | printStmt
    private statement(): Stmt.default {
        if (this.match(Type.PRINT)) return this.printStatement()

        return this.expressionStatement()
    }

    // printStmt -> "print" expression ";"
    private printStatement(): Stmt.default {
        let value = this.expression()
        this.consume(Type.SEMICOLON, "Expect ';' after value.")
        return new Stmt.Print(value)
    }

    // exprStmt -> expression ";"
    private expressionStatement(): Stmt.default {
        let expr = this.expression()
        this.consume(Type.SEMICOLON, "Expect ';' after expression.")
        return new Stmt.Expression(expr)
    }

    // expression -> equality
    private expression(): Expr.default {
        return this.equality()
    }

    // equality -> comparison (( "!=" | "==" ) comparison)*
    private equality(): Expr.default {
        let operators = [Type.BANG_EQUAL, Type.EQUAL_EQUAL]
        return this.binaryOperator(operators, this.comparison.bind(this))
    }

    // comparison -> addition (( ">" | ">=" | "<" | "<=" ) addition)*
    private comparison(): Expr.default {
        let operators = [Type.GREATER, Type.GREATER_EQUAL, Type.LESS, Type.LESS_EQUAL]
        return this.binaryOperator(operators, this.addition.bind(this))
    }

    // addition -> multiplication (( "-" | "+" ) multiplication)*
    private addition(): Expr.default {
        let operators = [Type.MINUS, Type.PLUS]
        return this.binaryOperator(operators, this.multiplication.bind(this))
    }

    // multiplication -> unary (( "/" | "*" ) unary)*
    private multiplication(): Expr.default {
        let operators = [Type.SLASH, Type.STAR]
        return this.binaryOperator(operators, this.unary.bind(this))
    }

    // unary -> ( "!" | "-" ) unary
    //        | primary
    private unary(): Expr.default {
        if (this.match(Type.BANG, Type.MINUS)) {
            let operator = this.previous()
            let right = this.unary()
            return new Expr.Unary(operator, right)
        }

        return this.primary()
    }

    // primary -> NUMBER | STRING | "false" | "true" | "nil"
    //          | "(" expression ")"
    private primary(): Expr.default {
        if (this.match(Type.FALSE)) return new Expr.Literal(false)
        if (this.match(Type.TRUE)) return new Expr.Literal(true)
        if (this.match(Type.NIL)) return new Expr.Literal(null)

        if (this.match(Type.NUMBER, Type.STRING)) {
            return new Expr.Literal(this.previous().literal)
        }

        if (this.match(Type.LEFT_PAREN)) {
            let expr = this.expression()
            this.consume(Type.RIGHT_PAREN, "Expect ')' after expression.")
            return new Expr.Grouping(expr)
        }

        throw this.error(this.peek(), "Expect expression.")
    }

    /**
     * Generalize the binary operators
     * @param types The collection of types with the same precidence
     * @param higherOperator The operator with higher precidence
     */
    private binaryOperator(types: Type[], higherOperator: () => Expr.default): Expr.default {
        let expr = higherOperator.call(this)

        while(this.match(...types)) {
            let operator = this.previous()
            let right = higherOperator.call(this)
            expr = new Expr.Binary(expr, operator, right)
        }

        return expr
    }

    //#region Helpers

    /**
     * Check if the next token is of the expected type. If so, consume it.
     * @param type The type to expect
     * @param message The message if the token was not found
     */
    private consume(type: Type, message: string): Token {
        if (this.check(type)) return this.advance()

        throw this.error(this.peek(), message)
    }

    /**
     * Display an error with the token causing it
     * @param token The token that is causing the error
     * @param message The error message
     */
    private error(token: Token, message: string): Error {
        Lox.error(token, message)
        return new ParseError()
    }

    /**
     * Consume tokens until a new statement starts.
     * This will help us get back on track to keep parsing after an error.
     */
    private synchronize(): void {
        this.advance()

        while(!this.isAtEnd()) {
            if (this.previous().type == Type.SEMICOLON) return

            switch (this.peek().type) {
                case Type.CLASS:
                case Type.FUN:
                case Type.VAR:
                case Type.FOR:
                case Type.IF:
                case Type.WHILE:
                case Type.PRINT:
                case Type.RETURN:
                    return
            }
        }

        this.advance()
    }

    /**
     * Checks to see if the current token is any of the given types
     */
    private match(...types: Type[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance()
                return true
            }
        }

        return false
    }

    /**
    * Returns true if the current token is of the given type
    */
    private check(type: Type): boolean {
        if (this.isAtEnd()) return false
        return this.peek().type == type
    }

    /**
     * Consumes the current token then returns it
     */
    private advance(): Token {
        if (!this.isAtEnd()) this.current++
        return this.previous()
    }

    /**
     * Check if we ran out of tokens to parse
     */
    private isAtEnd(): boolean {
        return this.peek().type == Type.EOF
    }

    /**
     * Returns the current token we hat yet to consume
     */
    private peek(): Token {
        return this.tokens[this.current]
    }

    /**
     * Returns the most recently consumed token
     */
    private previous(): Token {
        return this.tokens[this.current - 1]
    }

    //#endregion
}