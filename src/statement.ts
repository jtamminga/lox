import Expr, { Variable } from "./expr";
import Token from "./token";

export default abstract class Stmt {
    abstract accept<T>(visitor: Visitor<T>): T
}

export interface Visitor<T> {
    visitExpressionStmt(stmt: Expression): T
    visitPrintStmt(stmt: Print): T
    visitVarStmt(stmt: Var): T
    visitBlockStmt(stmt: Block): T
    visitIfStmt(stmt: If): T
    visitWhileStmt(stmt: While): T
    visitFunctionStmt(stmt: Function): T
    visitReturnStmt(stmt: Return): T
    visitClassStmt(stmt: Class): T
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

export class Block extends Stmt {
    statements: Stmt[]

    constructor(statements: Stmt[]) {
        super()
        this.statements = statements
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitBlockStmt(this)
    }
}

export class If extends Stmt {
    condition: Expr
    thenBranch: Stmt
    elseBranch: Stmt

    constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
        super()
        this.condition = condition
        this.thenBranch = thenBranch
        this.elseBranch = elseBranch
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitIfStmt(this)
    }
}

export class While extends Stmt {
    condition: Expr
    body: Stmt

    constructor(condition: Expr, body: Stmt) {
        super()
        this.condition = condition
        this.body = body
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitWhileStmt(this)
    }
}

export class Function extends Stmt {
    name: Token
    params: Token[]
    body: Stmt[]

    constructor(name: Token, params: Token[], body: Stmt[]) {
        super()
        this.name = name
        this.params = params
        this.body = body
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitFunctionStmt(this)
    }
}

export class Return extends Stmt {
    keyword: Token
    value: Expr

    constructor(keyword: Token, value: Expr) {
        super()
        this.keyword = keyword
        this.value = value
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitReturnStmt(this)
    }
}

export class Class extends Stmt {
    name: Token
    superclass: Variable
    methods: Function[]

    constructor(name: Token, methods: Function[], superclass?: Variable) {
        super()
        this.name = name
        this.superclass = superclass
        this.methods = methods
    }

    accept<T>(visitor: Visitor<T>): T {
        return visitor.visitClassStmt(this)
    }
}