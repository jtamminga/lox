import LoxCallable from "./loxCallable"
import Interpreter from "./interpreter";
import LoxInstance from "./loxInstance";
import LoxFunction from "./loxFunction";

export default class LoxClass implements LoxCallable {
    readonly name: string
    private readonly methods = new Map<string, LoxFunction>()

    constructor(name: string, methods: Map<string, LoxFunction>) {
        this.name = name
        this.methods = methods
    }

    arity(): number {
        let initializer = this.findMethod("init")
        if (initializer == null) return 0
        return initializer.arity()
    }

    call(interpreter: Interpreter, args: any[]): any {
        let instance = new LoxInstance(this)
        let initializer = this.findMethod("init")
        if (initializer != null) {
            initializer.bind(instance).call(interpreter, args)
        }
        return instance
    }

    findMethod(name: string): LoxFunction {
        if (this.methods.has(name)) {
            return this.methods.get(name)
        }

        return null
    }

    toString(): string {
        return this.name
    }
}