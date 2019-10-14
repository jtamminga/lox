enum TokenType {
    // Single-character tokens.                      
    LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,
    LEFT_SQR, RIGHT_SQR,

    // One or two character tokens.                  
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,

    // Literals.                                     
    IDENTIFIER, STRING, NUMBER,

    // Keywords.                                     
    AND, CLASS, ELSE, FALSE, FUN, FOR, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

    EOF
}

// need to 'export default' this way
// https://github.com/Microsoft/TypeScript/issues/3320#issuecomment-107241679
export default TokenType