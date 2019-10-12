import Token from "./token"

export default abstract class Expr {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitBinaryExpr(binary: Binary): T
    visitGroupingExpr(grouping: Grouping): T
    visitLiteralExpr(literal: Literal): T
    visitUnaryExpr(unary: Unary): T
    visitVariableExpr(expr: Variable): T
    visitAssignExpr(expr: Assign): T
    visitLogicalExpr(expr: Logical): T
    visitCallExpr(expr: Call): T
    visitGetExpr(expr: Get): T
    visitSetExpr(expr: Set): T
}

export class Binary extends Expr {
    left: Expr
    operator: Token
    right: Expr

    constructor(left: Expr, operator: Token, right: Expr) {
        super()
        this.left = left
        this.operator = operator
        this.right = right
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBinaryExpr(this)
    }
}

export class Grouping extends Expr {
    expr: Expr

    constructor(expr: Expr) {
        super()
        this.expr = expr
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGroupingExpr(this)
    }
}

export class Literal extends Expr {
    value: any

    constructor(value: any) {
        super()
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLiteralExpr(this)
    }
}

export class Unary extends Expr {
    operator: Token
    right: Expr

    constructor(operator: Token, right: Expr) {
        super()
        this.operator = operator
        this.right = right
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitUnaryExpr(this)
    }
}

/**
 * Represents just a variable without an initialization
 * variable -> "var" IDENTIFIER ";"
 */
export class Variable extends Expr {
    name: Token

    constructor(name: Token) {
        super()
        this.name = name
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableExpr(this)
    }
}

export class Assign extends Expr {
    name: Token
    value: Expr

    constructor(name: Token, value: Expr) {
        super()
        this.name = name
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitAssignExpr(this)
    }
}

export class Logical extends Expr {
    left: Expr
    operator: Token
    right: Expr

    constructor(left: Expr, operator: Token, right: Expr) {
        super()
        this.left = left
        this.operator = operator
        this.right = right
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLogicalExpr(this)
    }
}

export class Call extends Expr {
    callee: Expr
    paren: Token
    arguments: Expr[]

    constructor(callee: Expr, paren: Token, args: Expr[]) {
        super()
        this.callee = callee
        this.paren = paren
        this.arguments = args
    }
    
    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitCallExpr(this)
    }
}

export class Get extends Expr {
    object: Expr
    name: Token

    constructor(object: Expr, name: Token) {
        super()
        this.object = object
        this.name = name
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGetExpr(this)
    }
}

export class Set extends Expr {
    object: Expr
    name: Token
    value: Expr

    constructor(object: Expr, name: Token, value: Expr) {
        super()
        this.object = object
        this.name = name
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitSetExpr(this)
    }
}