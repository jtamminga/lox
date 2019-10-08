import Interpreter from "./interpreter";

export default interface LoxCallable {
    arity(): number
    call(interpreter: Interpreter, args: any[]): any
}