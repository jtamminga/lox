import Token from "./token"

export default abstract class Expr {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitBinaryExpr(expr: Binary): T
    visitGroupingExpr(expr: Grouping): T
    visitLiteralExpr(expr: Literal): T
    visitUnaryExpr(expr: Unary): T
    visitVariableExpr(expr: Variable): T
    visitAssignExpr(expr: Assign): T
    visitLogicalExpr(expr: Logical): T
    visitCallExpr(expr: Call): T
    visitGetExpr(expr: Get): T
    visitSetExpr(expr: Set): T
    visitThisExpr(expr: This): T
    visitSuperExpr(expr: Super): T
    visitArrayLiteralExpr(expr: ArrayLiteral): T
    visitIndexGetExpr(expr: IndexGet): T
    visitIndexSetExpr(expr: IndexSet): T
}

export class Binary extends Expr {
    readonly left: Expr
    readonly operator: Token
    readonly right: Expr

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
    readonly expr: Expr

    constructor(expr: Expr) {
        super()
        this.expr = expr
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitGroupingExpr(this)
    }
}

export class Literal extends Expr {
    readonly value: any

    constructor(value: any) {
        super()
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitLiteralExpr(this)
    }
}

export class Unary extends Expr {
    readonly operator: Token
    readonly right: Expr

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
    readonly name: Token

    constructor(name: Token) {
        super()
        this.name = name
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitVariableExpr(this)
    }
}

export class Assign extends Expr {
    readonly name: Token
    readonly value: Expr

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
    readonly left: Expr
    readonly operator: Token
    readonly right: Expr

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
    readonly callee: Expr
    readonly paren: Token
    readonly arguments: Expr[]

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
    readonly object: Expr
    readonly name: Token

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
    readonly object: Expr
    readonly name: Token
    readonly value: Expr

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

export class This extends Expr { 
    readonly keyword: Token

    constructor(keyword: Token) {
        super()
        this.keyword = keyword
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitThisExpr(this)
    }
}

export class Super extends Expr {
    readonly keyword: Token
    readonly method: Token

    constructor(keyword: Token, method: Token) {
        super()
        this.keyword = keyword
        this.method = method
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitSuperExpr(this)
    }
}

export class ArrayLiteral extends Expr {
    readonly elements: Expr[]
    readonly bracket: Token

    constructor(elements: Expr[], bracket: Token) {
        super()
        this.elements = elements
        this.bracket = bracket
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitArrayLiteralExpr(this)
    }
}

export class IndexGet extends Expr {
    readonly indexee: Expr
    readonly bracket: Token
    readonly index: Expr

    constructor(indexee: Expr, bracket: Token, index: Expr) {
        super()
        this.indexee = indexee
        this.bracket = bracket
        this.index = index
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIndexGetExpr(this)
    }
}

export class IndexSet extends Expr {
    readonly indexee: Expr
    readonly bracket: Token
    readonly index: Expr
    readonly value: Expr

    constructor(indexee: Expr, bracket: Token, index: Expr, value: Expr) {
        super()
        this.indexee = indexee
        this.bracket = bracket
        this.index = index
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIndexSetExpr(this)
    }
}