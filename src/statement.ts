import Expr from "./expr";
import Token from "./token";

export default abstract class Stmt {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitExpressionStmt<T>(stmt: Expression)
    visitPrintStmt<T>(stmt: Print)
    visitVarStmt<T>(stmt: Var)
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

/**
 * Represents a variable with initialization
 * var -> "var" IDENTIFIER "=" expression ";"
 */
export class Var extends Stmt {
    name: Token
    initializer: Expr

    constructor(name: Token, initializer: Expr) {
        super()
        this.name = name
        this.initializer = initializer
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVarStmt(this)
    }
}