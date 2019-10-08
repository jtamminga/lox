import * as Expr from './expr'
import * as Stmt from './statement'
import Interpreter from './interpreter';
import Token from './token';

export default class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
    private readonly interpreter: Interpreter
    private readonly scopes: Map<string, boolean>[]

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter
    }

    visitBinaryExpr(binary: Expr.Binary): void {
        throw new Error("Method not implemented.");
    }

    visitGroupingExpr(grouping: Expr.Grouping): void {
        throw new Error("Method not implemented.");
    }

    visitLiteralExpr(literal: Expr.Literal): void {
        throw new Error("Method not implemented.");
    }

    visitUnaryExpr(unary: Expr.Unary): void {
        throw new Error("Method not implemented.");
    }

    visitVariableExpr(expr: Expr.Variable): void {
        throw new Error("Method not implemented.");
    }

    visitAssignExpr(expr: Expr.Assign): void {
        throw new Error("Method not implemented.");
    }

    visitLogicalExpr(expr: Expr.Logical): void {
        throw new Error("Method not implemented.");
    }

    visitCallExpr(expr: Expr.Call): void {
        throw new Error("Method not implemented.");
    }

    visitExpressionStmt(stmt: Stmt.Expression): void {
        throw new Error("Method not implemented.");
    }

    visitPrintStmt(stmt: Stmt.Print): void {
        throw new Error("Method not implemented.");
    }

    visitVarStmt(stmt: Stmt.Var): void {
        this.declare(stmt.name)
        if (stmt.initializer != null) {
            this.resolve(stmt)
        }
        this.define(stmt.name)
    }

    visitBlockStmt(stmt: Stmt.Block): void {
        this.beginScope()
        this.resolve(stmt.statements)
        this.endScope()
    }

    visitIfStmt(stmt: Stmt.If): void {
        throw new Error("Method not implemented.");
    }

    visitWhileStmt(stmt: Stmt.While): void {
        throw new Error("Method not implemented.");
    }

    visitFunctionStmt(stmt: Stmt.Function): void {
        throw new Error("Method not implemented.");
    }

    visitReturnStmt(stmt: Stmt.Return): void {
        throw new Error("Method not implemented.");
    }

    //#region Helpers

    private resolve(statements: Stmt.default | Stmt.default[]): void {
        if (statements instanceof Stmt.default) {
            statements.accept(this)
            return
        }

        for (const statement of statements) {
            statement.accept(this)
        }
    }

    private beginScope(): void {
        this.scopes.push(new Map<string, boolean>())
    }

    private endScope(): void {
        this.scopes.pop()
    }

    private declare(name: Token): void {
        if (this.scopes.length == 0) return

        // get the last element
        let scope = this.scopes.slice(-1)[0]
        scope.set(name.lexeme, false)
    }

    //#endregion
}