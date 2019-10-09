import { readFile } from 'fs'
import Scanner from './scanner'
import Token from './token'
import TokenType from './tokenType'
import Parser from './parser'
import AstPrinter from './astPrinter'
import Interpreter from './interpreter'
import { RuntimeError } from './errors'
import Resolver from './resolver'

let args: string[] = process.argv.slice(2)
let hadError: boolean = false
let hadRuntimeError: boolean = false
let interpreter = new Interpreter()

// starting point

if (args.length > 1) {
    console.log('Usage: lox [script]')
    process.exit(64)
} else if (args.length == 1) {
    runFile(args[0])
} else {
    runPrompt()
}

// functions

function runFile(path: string): void {
    readFile(path, 'utf8', (err, data) => {
        if (!err) {
            run(data)
            if (hadError) process.exit(65)
            if (hadRuntimeError) process.exit(70)
        }
    })
}

function runPrompt(): void {
    process.stdin.on('data', data => {        
        run(data.toString().trim())
        hadError = false
    })
}

function run(src: string): void {
    let scanner = new Scanner(src)
    let tokens = scanner.scanTokens()

    let parser = new Parser(tokens)
    let statements = parser.parse()

    // stop if there was a syntax error
    if (hadError) return

    let resolver = new Resolver(interpreter)
    resolver.resolve(statements)

    // stop if there was a resolution error
    if (hadError) return

    interpreter.interpret(statements)
}

export function report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error ${where}: ${message}`)
    hadError = true
}

export function error(item: Token | number, message: string): void {
    if (item instanceof Token) {
        if (item.type == TokenType.EOF) {
            report(item.line, "at end", message)
        } else {
            report(item.line, `at '${item.lexeme}'`, message)
        }
    } else {
        report(item, "", message)
    }
}

export function runtimeError(error: RuntimeError) {
    console.error(`${error.message}\n[line ${error.token.line}]`)
    hadRuntimeError = true
}