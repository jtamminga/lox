import * as Expr from "./expr";
import * as Stmt from "./statement"
import Type from './tokenType'
import Token from "./token";
import { RuntimeError } from "./errors";
import { runtimeError } from "./lox";
import Environment from "./environment";

export default class Interpreter implements Expr.Visitor<any>, Stmt.Visitor<void> {
    private environment: Environment = new Environment()

    interpret(statements: Stmt.default[]): void {
        try {
            for (const statement of statements) {
                this.execute(statement)
            }
        } catch (error) {
            runtimeError(error)
        }
    }

    private execute(statement: Stmt.default): void {
        statement.accept(this)
    }

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

    visitVariableStmt(expr: Expr.Variable) {
        return this.environment.get(expr.name)
    }

    //

    visitExpressionStmt(stmt: Stmt.Expression) {
        this.evaluate(stmt.expression)
    }

    visitPrintStmt(stmt: Stmt.Print) {
        let value = this.evaluate(stmt.expression)
        console.log(value)
    }

    visitVarStmt(stmt: Stmt.Var) {
        let value: any
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer)
        }

        this.environment.define(stmt.name.lexeme, value)
    }

    //#region Helpers

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