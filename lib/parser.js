const TokenType = require('./token-type');
const AST = require('./ast/ast');

class Parser {
    constructor(lexer) {
        this.tokens = lexer.allTokens();
        this.currentToken = this.tokens[0];
        this.pos = 1;
    }

    consume(type) {
        if (this.currentToken.type !== type) {
            const error = new Error(`Expected ${type.toString()}, got ${this.currentToken.type.toString()}\n\tat Ln ${this.currentToken.line} Col ${this.currentToken.col}`);
            error.name = 'InvalidSyntax';
            throw error;
        }
        this.currentToken = this.tokens[this.pos++];
    }

    parse() {
        return this.program();
    }

    /**
     * ```
     * program := (statement ';')+
     *          | empty
     * ```
     */
    program() {
        const statements = [];
        while (this.currentToken.type !== TokenType.EOF) {
            statements.push(this.statement());
            this.consume(TokenType.SEMI);
        }
        return new AST.Program(statements);
    }

    /**
     * ```
     * statement := declaration
     *            | expr
     *            | print
     * ```
     */
    statement() {
        if (this.currentToken.type === TokenType.LET) {
            return this.declaration();
        }
        if (this.currentToken.type === TokenType.PRINT) {
            return this.print();
        }
        return this.expr();
    }

    /**
     * ```
     * declaration := 'let' var 'be' (expr | fn_declaration) ';'
     * ```
     */
    declaration() {
        this.consume(TokenType.LET);
        const id = this.var();
        this.consume(TokenType.BE);
        let decl;
        if (this.currentToken.type === TokenType.FN) {
            decl = this.fnDeclaration();
        } else {
            decl = this.expr();
        }
        return new AST.Declaration(id, decl);
    }

    /**
     * ```
     * fn_declaration := 'fn' fn_args 'returning' expr
     * ```
     */
    fnDeclaration() {
        this.consume(TokenType.FN);
        const args = this.fnArgs();
        this.consume(TokenType.RETURNING);
        let body;
        if (this.currentToken.type === TokenType.FN) {
            body = this.fnDeclaration();
        } else {
            body = this.expr();
        }
        return new AST.FnDeclaration(args, body);
    }

    /**
     * ```
     * fn_args := 'with' var (',' var)*
     * ```
     */
    fnArgs() {
        this.consume(TokenType.WITH);
        const vars = [];
        vars.push(this.var());
        while (this.currentToken.type === TokenType.COMMA) {
            this.consume(TokenType.COMMA);
            vars.push(this.var());
        }
        return new AST.FnArgs(vars);
    }

    /**
     * ```
     * fn_call := var 'of' expr (',' expr)*
     * ```
     */
    fnCall() {
        const id = this.var();
        this.consume(TokenType.OF);
        const args = [];
        args.push(this.expr());
        while (this.currentToken.type === TokenType.COMMA) {
            this.consume(TokenType.COMMA);
            args.push(this.expr());
        }
        return new AST.FnCall(id, args);
    }

    /**
     * ```
     * print := 'print' expr
     * ```
     */
    print() {
        this.consume(TokenType.PRINT);
        const expr = this.expr();
        return new AST.Print(expr);
    }

    /**
     * ```
     * expr := sum
     *       | fn_call
     * ```
     */
    expr() {
        if (this.currentToken.type === TokenType.VAR) {
            // lookahead
            if (this.tokens[this.pos].type === TokenType.OF) {
                return this.fnCall();
            }
        }
        return this.sum();
    }

    /**
     * ```
     * sum := product (('+' | '-') product)*
     * ```
     */
    sum() {
        const left = this.product();
        if ([TokenType.ADD, TokenType.SUB].indexOf(this.currentToken.type) !== -1) {
            const op = this.currentToken.value;
            this.consume(this.currentToken.type);
            const right = this.product();
            return new AST.BinaryOp(left, op, right);
        }
        return left;
    }

    /**
     * ```
     * product := value (('*' | '/') value)*
     * ```
     */
    product() {
        const left = this.value();
        if ([TokenType.MUL, TokenType.DIV].indexOf(this.currentToken.type) !== -1) {
            const op = this.currentToken.value;
            this.consume(this.currentToken.type);
            const right = this.value();
            return new AST.BinaryOp(left, op, right);
        }
        return left;
    }

    /**
     * ```
     * var := [A-Za-z][A-Za-z0-9]*
     * ```
     */
    var() {
        const id = this.currentToken.value;
        this.consume(TokenType.VAR);
        return new AST.Var(id);
    }

    /**
     * ```
     * value := var
     *        | num
     *        | ('+' | '-') value
     *        | '(' expr ')'
     * ```
     */
    value() {
        if ([TokenType.ADD, TokenType.SUB].indexOf(this.currentToken.type) !== -1) {
            const op = this.currentToken.value;
            this.consume(this.currentToken.type);
            const value = this.value();
            return new AST.UnaryOp(op, value);
        }
        if (this.currentToken.type === TokenType.VAR) {
            return this.var();
        }
        if (this.currentToken.type === TokenType.LPAREN) {
            this.consume(TokenType.LPAREN);
            const expr = this.expr();
            this.consume(TokenType.RPAREN);
            return expr;
        }
        return this.num();
    }

    /**
     * num := [0-9]+ ('.'[0-9]+)?
     */
    num() {
        const value = this.currentToken.value;
        this.consume(TokenType.NUM);
        return new AST.Num(+value);
    }
}
module.exports = Parser;
