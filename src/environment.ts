import Token from "./token"
import { RuntimeError } from "./errors"

export default class Environment {
    private enclosing: Environment
    private values: Map<string, any> = new Map<string, any>()

    constructor(enclosing: Environment = null) {
        this.enclosing = enclosing
    }

    define(name: string, value: any): void {
        this.values.set(name, value)
    }

    get(name: Token): any {
        if (this.values.has(name.lexeme)) {
            return this.values.get(name.lexeme)
        }

        if (this.enclosing != null) {
            return this.enclosing.get(name)
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }

    getAt(distance: number, name: string): any {
        return this.ancestor(distance).values.get(name)
    }

    assign(name: Token, value: any): void {
        if (this.values.has(name.lexeme)) {
            this.values.set(name.lexeme, value)
            return
        }

        if (this.enclosing != null) {
            this.enclosing.assign(name, value)
            return
        }

        throw new RuntimeError(name,
            `Undefined variable '${name.lexeme}'.`)
    }

    assignAt(distance: number, name: Token, value: any): void {
        this.ancestor(distance).values.set(name.lexeme, value)
    }

    ancestor(distance: number): Environment {
        let environment: Environment = this
        for (let i = 0; i < distance; i++) {
            environment = environment.enclosing
        }

        return environment
    }
}