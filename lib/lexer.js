const Token = require('./token');
const TokenType = require('./token-type');
const chars = require('./chars');

class Lexer {
    constructor(text) {
        this.text = text;
        this.pos = 1;
        this.col = 1;
        this.line = 1;
        this.currentChar = this.text[0];
    }

    /**
     * Advances the `currentChar` by one.
     * @returns {{line: number, col: number}} The position before advancing.
     */
    advance() {
        const current = {
            line: this.line,
            col: this.col
        };
        this.col++;
        if (this.currentChar === '\n') {
            this.line++;
            this.col = 1;
        }
        this.currentChar = this.text[this.pos++];
        if (!this.currentChar) {
            this.currentChar = '';
        }
        return current;
    }

    /**
     * Returns all tokens by calling `nextToken` until an `EOF` is reached.
     * @returns {Token[]} The array of all tokens.
     */
    allTokens() {
        const tokens = [this.nextToken()];
        while (tokens[tokens.length - 1].type !== TokenType.EOF) {
            tokens.push(this.nextToken());
        }
        return tokens;
    }

    /**
     * Returns the next valid token from the text, or null if none were found.
     * @returns {Token} The token that was found.
     */
    nextToken() {
        // eof.
        if (!this.currentChar) {
            return new Token({ line: this.line, col: this.col }, TokenType.EOF);
        }

        // whitespace
        if (chars.isSpace(this.currentChar)) {
            while (chars.isSpace(this.currentChar)) {
                this.advance();
            }
            return this.nextToken();
        }

        // comments
        if (this.currentChar === '#') {
            while (this.currentChar && this.currentChar !== '\n') {
                this.advance();
            }
            this.advance();
            return this.nextToken();
        }

        // single char tokens
        if (this.currentChar === ';') {
            const pos = this.advance();
            return new Token(pos, TokenType.SEMI);
        }
        if (this.currentChar === ',') {
            const pos = this.advance();
            return new Token(pos, TokenType.COMMA);
        }
        if (this.currentChar === '(') {
            const pos = this.advance();
            return new Token(pos, TokenType.LPAREN);
        }
        if (this.currentChar === ')') {
            const pos = this.advance();
            return new Token(pos, TokenType.RPAREN);
        }
        if (this.currentChar === '{') {
            const pos = this.advance();
            return new Token(pos, TokenType.LCURLY);
        }
        if (this.currentChar === '}') {
            const pos = this.advance();
            return new Token(pos, TokenType.RCURLY);
        }
        if (this.currentChar === '|') {
            const pos = this.advance();
            return new Token(pos, TokenType.PIPE);
        }
        if (this.currentChar === '+') {
            const pos = this.advance();
            return new Token(pos, TokenType.ADD, '+');
        }
        if (this.currentChar === '*') {
            const pos = this.advance();
            return new Token(pos, TokenType.MUL, '*');
        }
        if (this.currentChar === '-') {
            const pos = this.advance();
            return new Token(pos, TokenType.SUB, '-');
        }
        if (this.currentChar === '/') {
            const pos = this.advance();
            return new Token(pos, TokenType.DIV, '/');
        }

        // numbers
        if (chars.isNum(this.currentChar)) {
            const start = {
                line: this.line,
                col: this.col
            };
            let result = '';
            while (chars.isNum(this.currentChar)) {
                result += this.currentChar;
                this.advance();
            }
            if (this.currentChar === '.') {
                result += this.currentChar;
                while (chars.isNum(this.currentChar)) {
                    result += this.currentChar;
                    this.advance();
                }
            }
            return new Token(start, TokenType.NUM, +result);
        }

        // vars/keywords
        if (chars.isVarStart(this.currentChar)) {
            const start = {
                line: this.line,
                col: this.col
            };
            let result = '';
            while (chars.isVarBody(this.currentChar)) {
                result += this.currentChar;
                this.advance();
            }
            // keywords
            switch (result.toLowerCase()) {
                case 'let': return new Token(start, TokenType.LET);
                case 'be': return new Token(start, TokenType.BE);
                case 'fn': return new Token(start, TokenType.FN);
                case 'with': return new Token(start, TokenType.WITH);
                case 'of': return new Token(start, TokenType.OF);
                case 'returning': return new Token(start, TokenType.RETURNING);
                case 'print': return new Token(start, TokenType.PRINT);
                default: return new Token(start, TokenType.VAR, result);
            }
        }
        const error = new Error(`Unrecognized char "${this.currentChar}"\n\tat Ln ${this.line} Col ${this.col}`);
        error.name = 'InvalidCharacter';
        throw error;
    }
}
module.exports = Lexer;
