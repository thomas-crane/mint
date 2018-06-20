const expect = require('chai').expect;
const Mint = require('../lib');

describe('Lexer', function () {
    describe('#advance()', function () {
        it('should advance the current character by one.', function () {
            const lexer = new Mint.Lexer('abcd');
            expect(lexer.currentChar).to.equal('a');
            lexer.advance();
            expect(lexer.currentChar).to.equal('b');
            lexer.advance();
            expect(lexer.currentChar).to.equal('c');
            lexer.advance();
            expect(lexer.currentChar).to.equal('d');
        });
        it('should return the position it advanced from.', function () {
            const lexer = new Mint.Lexer('abcd');
            expect(lexer.advance()).to.deep.equal({ line: 1, col: 1 });
            expect(lexer.advance()).to.deep.equal({ line: 1, col: 2 });
            expect(lexer.advance()).to.deep.equal({ line: 1, col: 3 });
            expect(lexer.advance()).to.deep.equal({ line: 1, col: 4 });
        });
        it('should set currentChar to the empty string if there are no more characters.', function () {
            const lexer = new Mint.Lexer('a');
            expect(lexer.currentChar).to.equal('a');
            lexer.advance();
            expect(lexer.currentChar).to.equal('');
            lexer.advance();
            expect(lexer.currentChar).to.equal('');
            lexer.advance();
            expect(lexer.currentChar).to.equal('');
        });
    });

    describe('#nextToken()', function () {
        it('should return EOF if there are no characters left.', function () {
            const lexer = new Mint.Lexer('a');
            expect(lexer.nextToken().type).to.not.equal(Mint.TokenType.EOF);
            expect(lexer.nextToken().type).to.equal(Mint.TokenType.EOF);
            expect(lexer.nextToken().type).to.equal(Mint.TokenType.EOF);
            expect(lexer.nextToken().type).to.equal(Mint.TokenType.EOF);
        });
        it('should ignore whitespace and line breaks.', function () {
            const lexer = new Mint.Lexer('a        b\n\n\nc');
            expect(lexer.nextToken().value).to.equal('a');
            expect(lexer.nextToken().value).to.equal('b');
            expect(lexer.nextToken().value).to.equal('c');
        });
        it('should ignore comments.', function () {
            const lexer = new Mint.Lexer('# this will be ignored.');
            expect(lexer.nextToken().type).to.equal(Mint.TokenType.EOF);
        });
        it('should capture numbers correctly.', function () {
            let lexer = new Mint.Lexer('1');
            expect(lexer.nextToken().value).to.equal(1);
            lexer = new Mint.Lexer('100');
            expect(lexer.nextToken().value).to.equal(100);
            lexer = new Mint.Lexer('1.45');
            expect(lexer.nextToken().value).to.equal(1.45);
            lexer = new Mint.Lexer('0.0');
            expect(lexer.nextToken().value).to.equal(0.0);

            lexer = new Mint.Lexer('.10');
            expect(() => lexer.nextToken()).to.throw();
            lexer = new Mint.Lexer('10.');
            expect(() => lexer.nextToken()).to.throw();
        });
        it('should capture variables correctly.', function () {
            let lexer = new Mint.Lexer('ab cd');
            expect(lexer.nextToken().value).to.equal('ab');
            expect(lexer.nextToken().value).to.equal('cd');

            lexer = new Mint.Lexer('aB Cd Ef GH');
            expect(lexer.nextToken().value).to.equal('aB');
            expect(lexer.nextToken().value).to.equal('Cd');
            expect(lexer.nextToken().value).to.equal('Ef');
            expect(lexer.nextToken().value).to.equal('GH');

            lexer = new Mint.Lexer('a100 100a');
            expect(lexer.nextToken().value).to.equal('a100');
            expect(lexer.nextToken().value).to.equal(100);
            expect(lexer.nextToken().value).to.equal('a');
        });
    });

    describe('#allTokens()', function () {
        it('should always end with an EOF token.', function () {
            let lexer = new Mint.Lexer('');
            let tokens = lexer.allTokens();
            expect(tokens[tokens.length - 1].type).to.equal(Mint.TokenType.EOF);

            lexer = new Mint.Lexer('a b c');
            tokens = lexer.allTokens();
            expect(tokens[tokens.length - 1].type).to.equal(Mint.TokenType.EOF);

            lexer = new Mint.Lexer('let x be fn with x, y returning x / y;');
            tokens = lexer.allTokens();
            expect(tokens[tokens.length - 1].type).to.equal(Mint.TokenType.EOF);
        });

        // All lengths appear to be 1 more than they should be
        // because of the EOF token at the end.
        it('should return an array of all tokens.', function () {
            let lexer = new Mint.Lexer('');
            expect(lexer.allTokens().length).to.equal(1);

            lexer = new Mint.Lexer('a b c');
            expect(lexer.allTokens().length).to.equal(4);

            lexer = new Mint.Lexer('let x be 10;');
            expect(lexer.allTokens().length).to.equal(6);
        });
    });

    describe('#throw()', function () {
        it('should throw an error with the given name.', function () {
            let lexer = new Mint.Lexer('');
            expect(() => lexer.throw('TestError')).to.throw().property('name', 'TestError');
            expect(() => lexer.throw('AnotherTestError')).to.throw().property('name', 'AnotherTestError');
        });
    });
});