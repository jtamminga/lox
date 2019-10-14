import LoxInstance from "./loxInstance";
import Token from "./token";
import LoxCallable from "./loxCallable";
import Interpreter from "./interpreter";

export default class LoxArray extends LoxInstance {
    readonly elements: any[]

    constructor(elements: any[] = []) {
        super(null)
        this.elements = elements
    }

    get(name: Token): any {
        switch (name.lexeme) {
            case "length": return this.elements.length
            case "push": return Push(this.elements)
        }
    }

    toString(): string {
        return `[${this.elements.join(',')}]`
    }
}


let Push = (elements: any[]) => ({
    arity: () => 1,
    call: (interpreter: Interpreter, args: any[]) => {
        elements.push(args[0])
    }
})