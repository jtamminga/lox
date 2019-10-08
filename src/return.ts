export default class Return extends Error {
    readonly value: any

    constructor(value: any) {
        super()
        this.value = value

        Object.setPrototypeOf(this, Return.prototype)
    }
}