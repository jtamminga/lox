import Token from "./token";
import * as Expr from "./expr";
import Type from './tokenType'
import * as Lox from "./lox";
import { ParseError } from "./errors";
import * as Stmt from "./stmt"


type FunKind = "function" | "method"


export default class Parser {
    private tokens: Token[]
    private current: number = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    // program -> declaration* EOF
    public parse(): Stmt.default[] {
        let statements: Stmt.default[] = []
        while (!this.isAtEnd()) {
            statements.push(this.declaration())
        }

        return statements
    }

    // declaration -> classDecl
    //              | funDecl
    //              | varDecl
    //              | statment
    private declaration(): Stmt.default {
        try {
            if (this.match(Type.CLASS)) return this.classDeclaration()
            if (this.match(Type.FUN)) return this.function("function")
            if (this.match(Type.VAR)) return this.varDeclaration()

            return this.statement()
        } catch (error) {
            if (error instanceof ParseError) {
                this.synchronize()
                return null
            }

            // at this point something went really wrong
            throw error
        }
    }

    // classDecl -> "class" IDENTIFIER ( "<" IDENTIFIER )?
    //              "{" function* "}"
    private classDeclaration(): Stmt.default {
        let name = this.consume(Type.IDENTIFIER, "Expect class name.")

        let superClass: Expr.Variable = null
        if (this.match(Type.LESS)) {
            this.consume(Type.IDENTIFIER, "Expect superclass name.")
            superClass = new Expr.Variable(this.previous())
        }

        this.consume(Type.LEFT_BRACE, "Expect '{' before class body.")

        let methods: Stmt.Function[] = []
        while (!this.check(Type.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.function("method"))
        }

        this.consume(Type.RIGHT_BRACE, "Expect '}' after class body.")

        return new Stmt.Class(name, methods, superClass)
    }

    // function -> IDENTIFIER "(" parameters? ")" block
    private function(kind: FunKind): Stmt.Function {
        // function name
        let name = this.consume(Type.IDENTIFIER, `Expect ${kind} name.`)
        
        // parameters
        this.consume(Type.LEFT_PAREN, `Expect '(' after ${kind} name.`)
        let params: Token[] = []
        if (!this.check(Type.RIGHT_PAREN)) {
            do {
                if (params.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 parameters.")
                }

                params.push(this.consume(Type.IDENTIFIER, "Expect parameter name."))
            } while (this.match(Type.COMMA))
        }
        this.consume(Type.RIGHT_PAREN, "Expect ')' after parameters")

        // body
        this.consume(Type.LEFT_BRACE, `Expect '{' before ${kind} body.`)
        let body = this.block()
        return new Stmt.Function(name, params, body)
    }

    // varDecl -> "var" IDENTIFIER ( "=" expression )? ";"
    private varDeclaration(): Stmt.default {
        let name = this.consume(Type.IDENTIFIER, "Expect variable name.")

        let initializer: Expr.default
        if (this.match(Type.EQUAL)) {
            initializer = this.expression()
        }

        this.consume(Type.SEMICOLON, "Expect ';' after variable declaration.")
        return new Stmt.Var(name, initializer)
    }

    // statement -> exprStmt
    //            | forStmt
    //            | ifStmt
    //            | printStmt
    //            | returnStmt
    //            | whileStmt
    //            | block
    private statement(): Stmt.default {
        if (this.match(Type.FOR)) return this.forStatement()
        if (this.match(Type.IF)) return this.ifStatement()
        if (this.match(Type.PRINT)) return this.printStatement()
        if (this.match(Type.RETURN)) return this.returnStatement()
        if (this.match(Type.WHILE)) return this.whileStatement()
        if (this.match(Type.LEFT_BRACE)) return new Stmt.Block(this.block())

        return this.expressionStatement()
    }

    // printStmt -> "print" expression ";"
    private printStatement(): Stmt.default {
        let value = this.expression()
        this.consume(Type.SEMICOLON, "Expect ';' after value.")
        return new Stmt.Print(value)
    }

    // returnStmt -> "return" expression? ";"
    private returnStatement(): Stmt.default {
        let keyword = this.previous()
        let value: Expr.default = null
        if (!this.check(Type.SEMICOLON)) {
            value = this.expression()
        }

        this.consume(Type.SEMICOLON, "Expect ';' after return value.")
        return new Stmt.Return(keyword, value)
    }

    // block -> "{" declaration "}"
    private block(): Stmt.default[] {
        let statements: Stmt.default[] = []

        while (!this.check(Type.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration())
        }

        this.consume(Type.RIGHT_BRACE, "Expect '}' after block.")
        return statements
    }

    // exprStmt -> expression ";"
    private expressionStatement(): Stmt.default {
        let expr = this.expression()
        this.consume(Type.SEMICOLON, "Expect ';' after expression.")
        return new Stmt.Expression(expr)
    }

    // ifStatement -> "if" "(" expression ")" statement ( "else" statement )?
    private ifStatement(): Stmt.default {
        this.consume(Type.LEFT_PAREN, "Expect '(' after 'if'.")
        let condition = this.expression()
        this.consume(Type.RIGHT_PAREN, "Expect ')' after if condition.")

        let thenBranch = this.statement()
        let elseBranch: Stmt.default = null
        if (this.match(Type.ELSE)) {
            elseBranch = this.statement()
        }

        return new Stmt.If(condition, thenBranch, elseBranch)
    }

    // whileStmt -> "while" "(" expression ")" statement
    private whileStatement(): Stmt.default {
        this.consume(Type.LEFT_PAREN, "Expect '(' after 'while'.")
        let condition = this.expression()
        this.consume(Type.RIGHT_PAREN, "Expect ')' after condition.")
        let body = this.statement()

        return new Stmt.While(condition, body)
    }

    // forStmt -> "for" "(" ( varDecl | exprStmt | ";" )
    //            expression? ";"
    //            expression? ")" statement
    private forStatement(): Stmt.default {
        // Note this technique is desugaring.
        // This function transforms the for loop to a while loop

        this.consume(Type.LEFT_PAREN, "Expect '(' after 'for'.")

        // var declaration, or expression
        let initializer: Stmt.default
        if (this.match(Type.SEMICOLON)) {
            initializer = null
        } else if (this.match(Type.VAR)) {
            initializer = this.varDeclaration()
        } else {
            initializer = this.expressionStatement()
        }

        // condition
        let condition: Expr.default
        if (!this.check(Type.SEMICOLON)) {
            condition = this.expression()
        }
        this.consume(Type.SEMICOLON, "Expect ';' after loop condition.")

        // increment
        let increment: Expr.default
        if (!this.check(Type.RIGHT_PAREN)) {
            increment = this.expression()
        }
        this.consume(Type.RIGHT_PAREN, "Expect ')' after for clauses.")
        let body = this.statement()

        // time to desugar :o

        // the body consists of the body
        // plus the incrementer if any
        if (increment != null) {
            body = new Stmt.Block([
                body,
                new Stmt.Expression(increment)
            ])
        }

        // use a while loop to desugar the for loop
        if (condition == null) condition = new Expr.Literal(true)
        body = new Stmt.While(condition, body)

        if (initializer != null) {
            body = new Stmt.Block([
                initializer,
                body
            ])
        }

        return body
    }

    // expression -> assignment
    private expression(): Expr.default {
        return this.assignment()
    }

    // asignment -> ( call "." )? IDENTIFIER "=" assignment
    //            | logic_or
    private assignment(): Expr.default {
        let expr = this.or()

        if (this.match(Type.EQUAL)) {
            let equals = this.previous()
            let value = this.assignment()

            if (expr instanceof Expr.Variable) {
                return new Expr.Assign(expr.name, value)
            } else if (expr instanceof Expr.Get) {
                let get = <Expr.Get> expr
                return new Expr.Set(get.object, get.name, value)
            } else if (expr instanceof Expr.IndexGet) {
                return new Expr.IndexSet(expr, expr.bracket,
                    expr.index, value)
            }

            this.error(equals, "Invalid assignment target.")
        }

        return expr
    }

    // logic_or -> logic_and ( "or" logic_and )*
    private or(): Expr.default {
        let expr = this.and()

        while (this.match(Type.OR)) {
            let operator = this.previous()
            let right = this.and()
            expr = new Expr.Logical(expr, operator, right)
        }

        return expr
    }

    // logic_and -> equality ( "and" equality )*
    private and(): Expr.default {
        let expr = this.equality()

        while (this.match(Type.AND)) {
            let operator = this.previous()
            let right = this.equality()
            expr = new Expr.Logical(expr, operator, right)
        }

        return expr
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
    //        | call
    private unary(): Expr.default {
        if (this.match(Type.BANG, Type.MINUS)) {
            let operator = this.previous()
            let right = this.unary()
            return new Expr.Unary(operator, right)
        }

        return this.call()
    }

    // call -> primary ( "(" arguments? ")" | "[" expression "]" | "." IDENTIFIER )*
    private call(): Expr.default {
        let expr = this.primary()

        while (true) {
            if (this.match(Type.LEFT_PAREN)) {
                expr = this.finishCall(expr)
            } else if (this.match(Type.LEFT_SQR)) {
                expr = this.finishIndex(expr)
            } else if (this.match(Type.DOT)) {
                let name = this.consume(Type.IDENTIFIER,
                    "Expect property name after '.'.")
                expr = new Expr.Get(expr, name)
            } else {
                break
            }
        }

        return expr
    }

    // arguments -> expression ( "," expression )*
    // Note: this also handles the paren tokens too,
    //       therefore not one-to-one with the grammer
    private finishCall(callee: Expr.default): Expr.default {
        let args: Expr.default[] = []
        if (!this.check(Type.RIGHT_PAREN)) {
            do {
                if (args.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 arguments.")
                }
                args.push(this.expression())
            } while (this.match(Type.COMMA));
        }

        let paren = this.consume(Type.RIGHT_PAREN, "Expect ')' after arguments.")

        return new Expr.Call(callee, paren, args)
    }

    // finishing "[" expression "]"
    private finishIndex(callee: Expr.default): Expr.default {
        let index = this.expression()
        let bracket = this.consume(Type.RIGHT_SQR, "Expect ']' after expression.")

        return new Expr.IndexGet(callee, bracket, index)
    }

    // primary -> NUMBER | STRING | "false" | "true" | "nil" | "this"
    //          | "(" expression ")" | IDENTIFIER
    //          | "super" "." IDENTIFIER
    //          | array
    private primary(): Expr.default {
        if (this.match(Type.FALSE)) return new Expr.Literal(false)
        if (this.match(Type.TRUE)) return new Expr.Literal(true)
        if (this.match(Type.NIL)) return new Expr.Literal(null)

        if (this.match(Type.NUMBER, Type.STRING)) {
            return new Expr.Literal(this.previous().literal)
        }

        if (this.match(Type.SUPER)) {
            let keyword = this.previous()
            this.consume(Type.DOT, "Expect '.' after 'super'.")
            let method = this.consume(Type.IDENTIFIER,
                "Expect superclass method name.")
            return new Expr.Super(keyword, method)
        }

        if (this.match(Type.THIS)) return new Expr.This(this.previous())

        if (this.match(Type.IDENTIFIER)) {
            return new Expr.Variable(this.previous())
        }

        if (this.match(Type.LEFT_PAREN)) {
            let expr = this.expression()
            this.consume(Type.RIGHT_PAREN, "Expect ')' after expression.")
            return new Expr.Grouping(expr)
        }

        if (this.match(Type.LEFT_SQR)) {
            return this.array()
        }

        throw this.error(this.peek(), "Expect expression.")
    }

    // array -> "[" arguments? "]"
    private array(): Expr.ArrayLiteral {
        let elements = []
        if (!this.check(Type.RIGHT_SQR)) {
            do {
                if (elements.length >= 255) {
                    this.error(this.peek(), "Cannot have more than 255 elements.")
                }
                elements.push(this.expression())
            } while (this.match(Type.COMMA))
        }

        let bracket = this.consume(Type.RIGHT_SQR, "Expect ']' after array elements.")

        return new Expr.ArrayLiteral(elements, bracket)
    }

    /**
     * Generalize the binary operators
     * @param types The collection of types with the same precidence
     * @param higherOperator The operator with higher precidence
     */
    private binaryOperator(types: Type[], higherOperator: () => Expr.default): Expr.default {
        let expr: Expr.default = higherOperator.call(this)

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
    private error(token: Token, message: string): ParseError {
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
     * Checks to see if the current token is any of the given types. Advances if true.
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