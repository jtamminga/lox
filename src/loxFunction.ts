import LoxCallable from "./loxCallable";
import { Function } from './statement'
import Interpreter from "./interpreter";
import Environment from "./environment";
import Return from "./return";

export default class LoxFunction implements LoxCallable {
    private readonly declaration: Function
    private readonly closure: Environment

    constructor(declaration: Function, closure: Environment) {
        this.declaration = declaration
        this.closure = closure
    }

    arity(): number {
        return this.declaration.params.length
    }
    
    call(interpreter: Interpreter, args: any[]): any {
        let environment = new Environment(this.closure)
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(
                this.declaration.params[i].lexeme,
                args[i]
            )
        }

        try {
            interpreter.executeBlock(this.declaration.body, environment)
        } catch (returnVal) {
            if (returnVal instanceof Return) {
                return returnVal.value
            }
        }

        return null
    }

    toString(): string {
        return `<fn ${this.declaration.name.lexeme}>`
    }
}