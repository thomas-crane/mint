const Mint = require('../lib');

/**
 * This class is used to provide a stream of tokens for testing
 * purposes. The tokens should be provided in the format
 * `{ type: TokenType, value?: string | number }`.
 * 
 * `provide()` should always be called before a `Parser` is created,
 * because the parser will immediately call `allTokens()`.
 */
class FakeTokenProvider {
    constructor() {
        this.tokens = [];
        this.col = 1;
    }

    provide(tokens) {
        this.col = 1;
        this.tokens = tokens;
    }

    allTokens() {
        return [
            ...this.tokens.map((token) => {
                const col = this.col;
                if (token.value) {
                    this.col += token.value.toString().length;
                } else {
                    this.col++;
                }
                return new Mint.Token({ line: 1, col: col }, token.type, token.value);
            }),
            new Mint.Token({ line: 1, col: this.col }, Mint.TokenType.EOF)
        ];
    }
}
module.exports = FakeTokenProvider;