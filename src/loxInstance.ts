import LoxClass from "./loxClass";
import Token from "./token";
import { RuntimeError } from "./errors";

export default class LoxInstance {
    private klass: LoxClass
    private fields = new Map<string, any>()

    constructor(klass: LoxClass) {
        this.klass = klass
    }

    get(name: Token): any {
        if (this.fields.has(name.lexeme)) {
            return this.fields.get(name.lexeme)
        }

        let method = this.klass.findMethod(name.lexeme)
        if (method != null) return method

        throw new RuntimeError(name,
            `Undefined property '${name.lexeme}'.`)
    }

    set(name: Token, value: any): void {
        this.fields.set(name.lexeme, value)
    }

    toString(): string {
        return this.klass.name + " instance"
    }
}