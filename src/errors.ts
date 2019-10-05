import Token from "./token";

export class RuntimeError extends Error {
    readonly token: Token

    constructor(token: Token, message: string) {
        super(message)
        this.token = token

        Object.setPrototypeOf(this, RuntimeError.prototype)
    }
}

export class ParseError extends Error {
    constructor(message?: string) {
        super(message)

        Object.setPrototypeOf(this, ParseError.prototype)
    }
 }