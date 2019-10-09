import * as Expr from './expr'
import * as Stmt from './statement'
import Interpreter from './interpreter';
import Token from './token';
import { error } from './lox';

export default class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
    private readonly interpreter: Interpreter
    private readonly scopes: Map<string, boolean>[] = []
    private currentFunction: FunctionType = FunctionType.None

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter
    }

    resolve(statements: Expr.default | Stmt.default | Stmt.default[]): void {
        if (statements instanceof Expr.default) {
            statements.accept(this)
            return
        }

        if (statements instanceof Stmt.default) {
            statements.accept(this)
            return
        }

        for (const statement of statements) {
            statement.accept(this)
        }
    }

    visitBinaryExpr(binary: Expr.Binary): void {
        this.resolve(binary.left)
        this.resolve(binary.right)
    }

    visitGroupingExpr(grouping: Expr.Grouping): void {
        this.resolve(grouping.expr)
    }

    visitLiteralExpr(literal: Expr.Literal): void {
        
    }

    visitUnaryExpr(unary: Expr.Unary): void {
        this.resolve(unary.right)
    }

    visitVariableExpr(expr: Expr.Variable): void {
        if (this.scopes.length > 0 && this.curScope().get(expr.name.lexeme) === false) {
            error(expr.name, "Cannot read local variable in its own initializer.")
        }

        this.resolveLocal(expr, expr.name)
    }

    visitAssignExpr(expr: Expr.Assign): void {
        this.resolve(expr.value)
        this.resolveLocal(expr, expr.name)
    }

    visitLogicalExpr(expr: Expr.Logical): void {
        this.resolve(expr.left)
        this.resolve(expr.right)
    }

    visitCallExpr(expr: Expr.Call): void {
        this.resolve(expr.callee)

        for (const arg of expr.arguments) {
            this.resolve(arg)
        }
    }

    visitExpressionStmt(stmt: Stmt.Expression): void {
        this.resolve(stmt.expression)
    }

    visitPrintStmt(stmt: Stmt.Print): void {
        this.resolve(stmt.expression)
    }

    visitVarStmt(stmt: Stmt.Var): void {
        this.declare(stmt.name)
        if (stmt.initializer != null) {
            this.resolve(stmt.initializer)
        }
        this.define(stmt.name)
    }

    visitBlockStmt(stmt: Stmt.Block): void {
        this.beginScope()
        this.resolve(stmt.statements)
        this.endScope()
    }

    visitIfStmt(stmt: Stmt.If): void {
        this.resolve(stmt.condition)
        this.resolve(stmt.thenBranch)
        if (stmt.elseBranch != null) this.resolve(stmt.elseBranch)
    }

    visitWhileStmt(stmt: Stmt.While): void {
        this.resolve(stmt.condition)
        this.resolve(stmt.body)
    }

    visitFunctionStmt(stmt: Stmt.Function): void {
        this.declare(stmt.name)
        this.define(stmt.name)

        this.resolveFunction(stmt, FunctionType.Function)
    }

    visitReturnStmt(stmt: Stmt.Return): void {
        if (this.currentFunction == FunctionType.None) {
            error(stmt.keyword, "Cannot return when not in function.")
        }

        if (stmt.value != null) {
            this.resolve(stmt.value)
        }
    }

    //#region Helpers

    private beginScope(): void {
        this.scopes.push(new Map<string, boolean>())
    }

    private endScope(): void {
        this.scopes.pop()
    }

    private declare(name: Token): void {
        if (this.scopes.length == 0) return

        let scope = this.curScope()
        if (scope.has(name.lexeme)) {
            error(name, "Variable with this name already declared in this scope.")
        }

        scope.set(name.lexeme, false)
    }

    private define(name: Token): void {
        if (this.scopes.length == 0) return      

        this.curScope().set(name.lexeme, true)
    }

    /**
     * Resolve the scope the variable is declared
     * @param expr The expression representing the variable
     * @param name The variable token
     */
    private resolveLocal(expr: Expr.Variable, name: Token): void {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name.lexeme)) {
                this.interpreter.resolve(expr, this.scopes.length - 1 - i)
                return
            }
        }

        // not found, assume it is global
    }

    private resolveFunction(func: Stmt.Function, type: FunctionType): void {
        let enclosingFunction = this.currentFunction
        this.currentFunction = type

        this.beginScope()
        for (const param of func.params) {
            this.declare(param)
            this.define(param)
        }
        this.resolve(func.body)
        this.endScope()

        this.currentFunction = enclosingFunction
    }

    private curScope(): Map<string, boolean> {
        return this.scopes.slice(-1)[0]
    }

    //#endregion
}

enum FunctionType {
    None,
    Function
}