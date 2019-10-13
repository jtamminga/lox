import * as Expr from './expr'
import * as Stmt from './statement'
import Interpreter from './interpreter';
import Token from './token';
import { error } from './lox';

export default class Resolver implements Expr.Visitor<void>, Stmt.Visitor<void> {
    private readonly interpreter: Interpreter
    private readonly scopes: Map<string, boolean>[] = []
    private currentFunction: FunctionType = FunctionType.None
    private currentClass: ClassType = ClassType.None

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

    visitGetExpr(expr: Expr.Get): void {
        this.resolve(expr.object)
    }

    visitSetExpr(expr: Expr.Set): void {
        this.resolve(expr.value)
        this.resolve(expr.object)
    }

    visitThisExpr(expr: Expr.This): void {
        if (this.currentClass == ClassType.None) {
            error(expr.keyword,
                "Cannot use 'this' outside of a class.")
            return
        }

        this.resolveLocal(expr, expr.keyword)
    }

    visitSuperExpr(expr: Expr.Super): void {
        if (this.currentClass == ClassType.None) {
            error(expr.keyword,
                "Cannot use 'super' outside of a class.")
        } else if (this.currentClass != ClassType.SubClass) {
            error(expr.keyword,
                "Cannot use 'super' in a class with no superclass.")
        }

        this.resolveLocal(expr, expr.keyword)
    }

    //

    visitClassStmt(stmt: Stmt.Class): void {
        let enclosingClass = this.currentClass
        this.currentClass = ClassType.Class

        this.declare(stmt.name)
        this.define(stmt.name)

        if (stmt.superClass != null && 
            stmt.name.lexeme == stmt.superClass.name.lexeme) {
                error(stmt.superClass.name,
                    "A class cannot inherit from itself.")
        }

        if (stmt.superClass != null) {
            this.currentClass = ClassType.SubClass
            this.resolve(stmt.superClass)
        }

        if (stmt.superClass != null) {
            this.beginScope()
            this.curScope().set("super", true)
        }

        this.beginScope()
        this.curScope().set("this", true)

        for (const method of stmt.methods) {
            let declaration = FunctionType.Method
            if (method.name.lexeme == "init") {
                declaration = FunctionType.Initializer
            }

            this.resolveFunction(method, declaration)
        }

        this.endScope()

        if (stmt.superClass != null) this.endScope()

        this.currentClass = enclosingClass
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
            if (this.currentFunction == FunctionType.Initializer) {
                error(stmt.keyword,
                    "Cannot return a value from an initializer.")
            }

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

    // 
    // Variable bindings happen in 2 seperate stages - declaring & defining.
    //
    // Consider the following:
    //   var a = "outer";
    //   {
    //       var a = a;
    //   }
    //
    // Three options:
    // 1) run initializer, then put var in scope
    //    > this would make the inner a set to "outer"
    // 2) put var in scope, then run initializer
    //    > a would just be set to itself (so just nil)
    // 3) make it an error to reference a variable in its initializer
    //    > the one we do, because this is most likely a mistake
    // 

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
    private resolveLocal(expr: Expr.default, name: Token): void {
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
    Function,
    Initializer,
    Method
}

enum ClassType {
    None,
    Class,
    SubClass
}