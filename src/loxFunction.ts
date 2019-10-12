import LoxCallable from "./loxCallable";
import { Function } from './statement'
import Interpreter from "./interpreter";
import Environment from "./environment";
import Return from "./return";
import LoxInstance from "./loxInstance";

export default class LoxFunction implements LoxCallable {
    private readonly declaration: Function
    private readonly closure: Environment
    private readonly isInitializer: boolean

    constructor(declaration: Function, closure: Environment, isInitializer: boolean) {
        this.declaration = declaration
        this.closure = closure
        this.isInitializer = isInitializer
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
                if (this.isInitializer) return this.closure.getAt(0, "this")

                return returnVal.value
            }
        }

        if (this.isInitializer) return this.closure.getAt(0, "this")
        return null
    }

    bind(instance: LoxInstance): LoxFunction {
        let environment = new Environment(this.closure)
        environment.define("this", instance)
        return new LoxFunction(this.declaration, environment, this.isInitializer)
    }

    toString(): string {
        return `<fn ${this.declaration.name.lexeme}>`
    }
}