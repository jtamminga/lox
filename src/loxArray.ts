import LoxInstance from "./loxInstance";

export default class LoxArray extends LoxInstance {
    readonly elements: any[]

    constructor(elements: any[] = []) {
        super(null)
        this.elements = elements
    }


} 