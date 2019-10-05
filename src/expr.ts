import Token from "./token"

export default abstract class Expr {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitBinaryExpr(binary: Binary): T
    visitGroupingExpr(grouping: Grouping): T
    visitLiteralExpr(literal: Literal): T
    visitUnaryExpr(unary: Unary): T
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