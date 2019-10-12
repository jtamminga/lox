import * as Expr from "./expr";
import * as Stmt from "./statement"
import Type from './tokenType'
import Token from "./token";
import { RuntimeError } from "./errors";
import { runtimeError } from "./lox";
import Environment from "./environment";
import LoxCallable from "./loxCallable";
import LoxFunction from "./loxFunction";
import Return from "./return";
import LoxClass from "./loxClass";
import LoxInstance from "./loxInstance";

export default class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
    readonly globals: Environment = new Environment()
    private environment: Environment = this.globals
    private readonly locals: Map<Expr.default, number> = new Map<Expr.default, number>()

    constructor() {
        // this.globals.define("clock")
        let test: LoxCallable = {
            arity: () => 0,
            call: (interpreter: Interpreter, args: any[]) => {
                return Date.now()
            }
        }
    }

    interpret(statements: Stmt.default[]): void {
        try {
            for (const statement of statements) {
                this.execute(statement)
            }
        } catch (error) {
            if (error instanceof RuntimeError) {
                runtimeError(error)
            } else {
                throw error
            }
        }
    }

    executeBlock(statements: Stmt.default[], environment: Environment): void {
        let previous: Environment = this.environment

        try {
            this.environment = environment

            for (const statement of statements) {
                this.execute(statement)
            }
        } finally {
            this.environment = previous
        }
    }

    resolve(expr: Expr.default, depth: number): void {
        this.locals.set(expr, depth)
    }

    //

    visitBinaryExpr(binary: Expr.Binary) {
        let left = this.evaluate(binary.left)
        let right = this.evaluate(binary.right)

        switch (binary.operator.type) {
            case Type.GREATER:
                this.checkNumberOperands(binary.operator, left, right)
                return left > right
            case Type.GREATER_EQUAL:
                this.checkNumberOperands(binary.operator, left, right)
                return left >= right
            case Type.LESS:
                this.checkNumberOperands(binary.operator, left, right)
                return left < right
            case Type.LESS_EQUAL:
                this.checkNumberOperands(binary.operator, left, right)
                return left <= right
            case Type.MINUS:
                this.checkNumberOperands(binary.operator, left, right)
                return left - right
            case Type.PLUS:
                if (typeof(left) === 'number' && typeof(right) === 'number')
                    return left + right
                if (typeof(left) === 'string' && typeof(right) === 'string')
                    return left + right

                throw new RuntimeError(binary.operator,
                    "Operands must both be numbers or strings")
            case Type.SLASH:
                this.checkNumberOperands(binary.operator, left, right)
                return left / right
            case Type.STAR:
                this.checkNumberOperands(binary.operator, left, right)
                return left * right
            case Type.BANG_EQUAL: return !this.isEqual(left, right)
            case Type.EQUAL_EQUAL: return this.isEqual(left, right)
        }

        return null
    }

    visitGroupingExpr(grouping: Expr.Grouping) {
        return this.evaluate(grouping.expr)
    }

    visitLiteralExpr(literal: Expr.Literal) {
        return literal.value
    }

    visitUnaryExpr(unary: Expr.Unary) {
        let right = this.evaluate(unary.right)

        switch (unary.operator.type) {
            case Type.BANG:
                return !this.isTruthy(right)
            case Type.MINUS:
                this.checkNumberOperand(unary.operator, right)
                return -right
        }

        return null
    }

    visitVariableExpr(expr: Expr.Variable) {
        return this.lookUpVariable(expr.name, expr)
    }

    visitAssignExpr(expr: Expr.Assign) {
        let value = this.evaluate(expr.value)

        let distance = this.locals.get(expr)
        if (distance != null) {
            this.environment.assignAt(distance, expr.name, value)
        } else {
            this.globals.assign(expr.name, value)
        }

        return value
    }

    visitLogicalExpr(expr: Expr.Logical) {
        let left = this.evaluate(expr.left)

        if (expr.operator.type == Type.OR) {
            if (this.isTruthy(left)) return left
        } else {
            if (!this.isTruthy(left)) return left
        }

        return this.evaluate(expr.right)
    }

    visitCallExpr(expr: Expr.Call) {
        let callee = this.evaluate(expr.callee)

        let args = expr.arguments.map(arg =>
            this.evaluate(arg))

        // not instance of LoxCallable
        if (!(typeof callee.call === 'function')) {
            throw new RuntimeError(expr.paren,
                "Can only call functions and classes.")
        }

        let func: LoxCallable = <LoxCallable> callee
        if (args.length != func.arity()) {
            throw new RuntimeError(expr.paren,
                `Expected ${func.arity()} arguments but got ${args.length}.`)
        }

        return func.call(this, args)
    }

    visitGetExpr(expr: Expr.Get) {
        let object = this.evaluate(expr.object)
        if (object instanceof LoxInstance) {
            return (<LoxInstance> object).get(expr.name)
        }

        throw new RuntimeError(expr.name,
            "Only instances have properties.")
    }

    visitSetExpr(expr: Expr.Set) {
        let object = this.evaluate(expr.object)

        if (!(object instanceof LoxInstance)) {
            throw new RuntimeError(expr.name, "Only instances have fields.")
        }

        let value = this.evaluate(expr.value)
        object.set(expr.name, value)
    }

    visitThisExpr(expr: Expr.This) {
        return this.lookUpVariable(expr.keyword, expr)
    }

    // statements

    visitClassStmt(stmt: Stmt.Class) {
        this.environment.define(stmt.name.lexeme, null)

        let methods = new Map<string, LoxFunction>()
        for (const method of stmt.methods) {
            let func = new LoxFunction(method, this.environment,
                method.name.lexeme == "init")
            methods.set(method.name.lexeme, func)
        }

        let klass = new LoxClass(stmt.name.lexeme, methods)
        this.environment.assign(stmt.name, klass)
    }

    visitExpressionStmt(stmt: Stmt.Expression) {
        this.evaluate(stmt.expression)
    }

    visitFunctionStmt(stmt: Stmt.Function) {
        let func = new LoxFunction(stmt, this.environment, false)
        this.environment.define(stmt.name.lexeme, func)
    }

    visitPrintStmt(stmt: Stmt.Print) {
        let value = this.evaluate(stmt.expression)
        console.log(value.toString())
    }

    visitReturnStmt(stmt: Stmt.Return) {
        let value: any = null
        if (stmt.value != null) value = this.evaluate(stmt.value)
        throw new Return(value)
    }

    visitVarStmt(stmt: Stmt.Var) {
        let value: any
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer)
        }

        this.environment.define(stmt.name.lexeme, value)
    }

    visitBlockStmt(stmt: Stmt.Block) {
        this.executeBlock(stmt.statements, new Environment(this.environment))
    }

    visitIfStmt(stmt: Stmt.If) {
        if (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.thenBranch)
        } else if (stmt.elseBranch != null) {
            this.execute(stmt.elseBranch)
        }
    }

    visitWhileStmt(stmt: Stmt.While) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body)
        }
    }

    //#region Helpers

    private execute(statement: Stmt.default): void {
        statement.accept(this)
    }

    private lookUpVariable(name: Token, expr: Expr.default): any {
        let distance = this.locals.get(expr)
        if (distance != null) {
            return this.environment.getAt(distance, name.lexeme)
        } else {
            return this.globals.get(name)
        }
    }

    private checkNumberOperand(operator: Token, operand: any): void {
        if (typeof operand === 'number') return
        throw new RuntimeError(operator, "Operand must be a number.")
    }

    private checkNumberOperands(operator: Token, left: any, right: any): void {
        if (typeof left === 'number' && typeof right === 'number') return
        throw new RuntimeError(operator, "Operands must be numbers.")
    }

    private evaluate(expr: Expr.default): any {
        return expr.accept(this)
    }

    private isTruthy(object: any): boolean {
        if (object == null) return false
        if (typeof(object) === 'boolean') return <boolean>object
        return true
    }

    private isEqual(a: any, b: any): boolean {
        return a !== null && a === b
    }

    //#endregion
}