import * as Expr from "./expr";

export default class AstPrinter implements Expr.Visitor<string> {
    visitVariableStmt<T>(stmt: Expr.Variable) {
        throw new Error("Method not implemented.");
    }

    print(expr: Expr.default): string {
        return expr.accept(this)
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

    private parenthesize(name: string, ...exprs: Expr.default[]): string {
        let text: string = '(' + name

        for (const expr of exprs) {
            text += ' ' + expr.accept(this)
        }

        text += ')'
        return text
    }

}