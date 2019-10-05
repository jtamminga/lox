import Token from "./token"
import { RuntimeError } from "./errors"

export default class Environment {
    private values: Map<string, any> = new Map<string, any>()

    define(name: string, value: any): void {
        this.values.set(name, value)
    }

    get(name: Token): any {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme)
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }
}