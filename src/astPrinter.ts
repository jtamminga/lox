import * as Expr from "./expr";

export default class AstPrinter implements Expr.Visitor<string> {
    print(expr: Expr.default): string {
        return expr.accept(this)
    }

    visitCallExpr(expr: Expr.Call): string {
        throw new Error("Method not implemented.");
    }

    visitLogicalExpr(expr: Expr.Logical): string {
        throw new Error("Method not implemented.");
    }

    visitAssignExpr(expr: Expr.Assign): string {
        throw new Error("Method not implemented.");
    }

    visitVariableExpr(stmt: Expr.Variable): string {
        throw new Error("Method not implemented.");
    }

    visitBinaryExpr(expr: Expr.Binary): string {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }

    visitGroupingExpr(expr: Expr.Grouping): string {
        return this.parenthesize('group', expr.expr)
    }

    visitLiteralExpr(expr: Expr.Literal): string {
        if (expr.value == null) return 'nil'
        return expr.value
    }

    visitUnaryExpr(expr: Expr.Unary): string {
        return this.parenthesize(expr.operator.lexeme, expr.right)
    }

    visitGetExpr(expr: Expr.Get): string {
        throw new Error("Method not implemented.");
    }
    visitSetExpr(expr: Expr.Set): string {
        throw new Error("Method not implemented.");
    }

    private parenthesize(name: string, ...exprs: Expr.default[]): string {
        let text: string = '(' + name

        for (const expr of exprs) {
            text += ' ' + expr.accept(this)
        }

        text += ')'
        return text
    }

}