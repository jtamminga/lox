import Token from "./token"
import Type from "./tokenType"
import { error } from "./lox"

let keywords = {
    "and": Type.AND,
    "class": Type.CLASS,
    "else": Type.ELSE,
    "false": Type.FALSE,
    "for": Type.FOR,
    "fun": Type.FUN,
    "if": Type.IF,
    "nil": Type.NIL,
    "or": Type.OR,
    "print": Type.PRINT,
    "return": Type.RETURN,
    "super": Type.SUPER,
    "this": Type.THIS,
    "true": Type.TRUE,
    "var": Type.VAR,
    "while": Type.WHILE
}

export default class Scanner {
    private source: string
    private tokens: Token[] = []
    private start: number = 0
    private current: number = 0
    private line: number = 1

    constructor(source: string) {
        this.source = source
    }

    scanTokens(): Token[] {
        while(!this.isAtEnd()) {
            this.start = this.current
            this.scanToken()
        }

        this.tokens.push(new Token(Type.EOF, "", null, this.line))
        return this.tokens
    }

    private scanToken(): void {
        let c: string = this.advance()
        switch (c) {
            case '(': this.addToken(Type.LEFT_PAREN); break
            case ')': this.addToken(Type.RIGHT_PAREN); break
            case '{': this.addToken(Type.LEFT_BRACE); break
            case '}': this.addToken(Type.RIGHT_BRACE); break
            case '[': this.addToken(Type.LEFT_SQR); break
            case ']': this.addToken(Type.RIGHT_SQR); break
            case ',': this.addToken(Type.COMMA); break
            case '.': this.addToken(Type.DOT); break
            case '-': this.addToken(Type.MINUS); break
            case '+': this.addToken(Type.PLUS); break
            case ';': this.addToken(Type.SEMICOLON); break
            case '*': this.addToken(Type.STAR); break
            case '!':
                this.addToken(this.match('=') ? Type.BANG_EQUAL : Type.BANG)
                break
            case '=':
                this.addToken(this.match('=') ? Type.EQUAL_EQUAL : Type.EQUAL)
                break
            case '<':
                this.addToken(this.match('=') ? Type.LESS_EQUAL : Type.LESS)
                break
            case '>':
                this.addToken(this.match('=') ? Type.GREATER_EQUAL : Type.GREATER)
                break
            case '/':
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isAtEnd())
                        this.advance()
                } else {
                    this.addToken(Type.SLASH)
                }
                break
            case ' ':
            case '\r':
            case '\t':
                break
            case '\n':
                this.line++
                break
            case '"': this.string(); break
            default:
                if (this.isDigit(c)) {
                    this.number()
                } else if (this.isAlpha(c)) {
                    this.identifier()
                } else {
                    error(this.line, 'Unexpected character.')
                }
                break
        }
    }

    private string(): void {
        while (this.peek() != '"' && !this.isAtEnd()) {
            if (this.peek() == '\n') this.line++
            this.advance()
        }

        if (this.isAtEnd()) {
            error(this.line, "Unterminated string.")
            return
        }

        // the closing "
        this.advance()

        // trim the surrounding quotes
        let value = this.source.substring(this.start + 1, this.current - 1)
        this.addToken(Type.STRING, value)
    }

    private number(): void {
        while (this.isDigit(this.peek())) this.advance()

        if (this.peek() == '.' && this.isDigit(this.peekNext())) {
            this.advance() // consume .

            while (this.isDigit(this.peek())) this.advance()
        }

        let value = this.source.substring(this.start, this.current)
        this.addToken(Type.NUMBER, Number.parseFloat(value))
    }

    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance()

        let text = this.source.substring(this.start, this.current)
        
        let type: Type = keywords[text]
        if (type == null) type = Type.IDENTIFIER
        this.addToken(type)
    }

    //#region Helpers

    private advance(): string {
        return this.source[this.current++]
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false
        if (this.source[this.current] != expected) return false

        this.current++
        return true
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0'
        return this.source[this.current]
    }

    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0'
        return this.source[this.current + 1]
    }

    private addToken(type: Type, literal?: any): void {
        let text = this.source.substring(this.start, this.current)
        this.tokens.push(new Token(type, text, literal, this.line))
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length
    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9'
    }

    private isAlpha(c: string): boolean {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c == '_'
    }

    private isAlphaNumeric(c: string): boolean {
        return this.isAlpha(c) || this.isDigit(c)
    }

    //#endregion
}