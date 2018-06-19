class Token {
    /**
     * 
     * @param {{line: number, col: number}} pos The position of the token.
     * @param {Symbol} type The type of the token.
     * @param {string | number} value The value of the token.
     */
    constructor(pos, type, value) {
        this.line = pos.line;
        this.col = pos.col;
        this.type = type;
        this.value = value;
    }
}
module.exports = Token;
