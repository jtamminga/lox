import Expr from "./expr";

export default abstract class Stmt {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitExpressionStmt<T>(stmt: Expression)
    visitPrintStmt<T>(stmt: Print)
}

export class Expression extends Stmt {
    expression: Expr

    constructor(expression: Expr) {
        super()
        this.expression = expression
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitExpressionStmt(this)
    }
}

export class Print extends Stmt {
    expression: Expr

    constructor(expression: Expr) {
        super()
        this.expression = expression
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitPrintStmt(this)
    }
}