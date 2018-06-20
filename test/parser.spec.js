const FakeTokenProvider = require('./fake-token-provider');
const expect = require('chai').expect;
const Mint = require('../lib');
const tokenProvider = new FakeTokenProvider();

describe('Parser', function () {
    describe('#consume', function () {
        it('should advance to the next token.', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.VAR, value: 'bar' },
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.currentToken).to.have.property('value', 'foo');
            parser.consume(Mint.TokenType.VAR);
            expect(parser.currentToken).to.have.property('value', 'bar');
            parser.consume(Mint.TokenType.VAR);
            expect(parser.currentToken).to.have.property('type', Mint.TokenType.EOF);
        });
        it('should throw an InvalidSyntax error if the type to consume does not match the current type.', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.VAR, value: 'bar' },
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(() => parser.consume(Mint.TokenType.NUM)).to.throw().property('name', 'InvalidSyntax');
        });
    });
    describe('#num()', function () {
        it('should return a Num AST with the correct value.', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            let parser = new Mint.Parser(tokenProvider);
            expect(parser.num()).instanceof(Mint.AST.Num).property('value', 100);

            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 32.1 }
            ]);
            parser = new Mint.Parser(tokenProvider);
            expect(parser.num()).instanceof(Mint.AST.Num).property('value', 32.1);
        });
    });
    describe('#value()', function () {
        it('should match "var"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.value()).instanceof(Mint.AST.Var);
        });
        it('should match "num"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.value()).instanceof(Mint.AST.Num);
        });
        it(`should match "'-' value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.SUB, value: '-' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.value()).instanceof(Mint.AST.UnaryOp);
        });
        it(`should match "'+' value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.ADD, value: '+' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.value()).instanceof(Mint.AST.UnaryOp);
        });
        it(`should match "'(' expr ')'"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.LPAREN },
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.RPAREN }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.value()).instanceof(Mint.AST.Num);
        });
    });
    describe('#var()', function () {
        it('should return a Var AST with the correct name.', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' }
            ]);
            let parser = new Mint.Parser(tokenProvider);
            expect(parser.var()).instanceof(Mint.AST.Var).property('name', 'foo');

            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'Bar' }
            ]);
            parser = new Mint.Parser(tokenProvider);
            expect(parser.var()).instanceof(Mint.AST.Var).property('name', 'Bar');
        });
    });
    describe('#product', function () {
        it(`should match "value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            let parser = new Mint.Parser(tokenProvider);
            expect(parser.product()).instanceof(Mint.AST.Num);

            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' }
            ]);
            parser = new Mint.Parser(tokenProvider);
            expect(parser.product()).instanceof(Mint.AST.Var);
        });
        it(`should match "value '*' value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.MUL, value: '*' },
                { type: Mint.TokenType.VAR, value: 'foo' }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.product()).instanceof(Mint.AST.BinaryOp);
        });
        it(`should match "value '/' value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.DIV, value: '/' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.product()).instanceof(Mint.AST.BinaryOp);
        });
        it(`should match "value * value '/' value"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.MUL, value: '*' },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.DIV, value: '/' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.product()).instanceof(Mint.AST.BinaryOp);
        });
    });
    describe('#sum()', function () {
        // We will trust that #product() has been fully tested,
        // and just use its most basic form of "num" in these tests
        // to avoid extremely lengthy token provider statements

        it(`should match "product"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.sum()).instanceof(Mint.AST.Num);
        });
        it(`should match "product '+' product"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.ADD, value: '+' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.sum()).instanceof(Mint.AST.BinaryOp);
        });
        it(`should match "product '-' product"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.ADD, value: '-' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.sum()).instanceof(Mint.AST.BinaryOp);
        });
        it(`should match "product '+' product '-' product"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.ADD, value: '+' },
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.ADD, value: '-' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.sum()).instanceof(Mint.AST.BinaryOp);
        });
    });
    describe('#expr()', function () {
        // Again, trust that the leaves of this AST have
        // been fully tested, and use their most basic forms.
        it('should match "sum"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.expr()).instanceof(Mint.AST.Num);
        });
        it('should match "fn_call"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.OF, value: 'of' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.expr()).instanceof(Mint.AST.FnCall);
        });
    });
    describe('#print()', function () {
        it(`should match "'print' expr"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.PRINT },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.print()).instanceof(Mint.AST.Print);
        });
    });
    describe('#fnCall()', function () {
        it(`should match "var 'of' expr"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.OF, value: 'of' },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnCall()).instanceof(Mint.AST.FnCall);
        });
        it(`should match "var 'of' expr ',' expr"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.OF, value: 'of' },
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.COMMA },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnCall()).instanceof(Mint.AST.FnCall);
        });
    });
    describe('#fnArgs()', function () {
        it(`should match "'with' var"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'foo' }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnArgs()).instanceof(Mint.AST.FnArgs);
        });
        it(`should match "'with' var ',' var"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.COMMA },
                { type: Mint.TokenType.VAR, value: 'bar' }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnArgs()).instanceof(Mint.AST.FnArgs);
        });
    });
    describe('#fnDeclaration()', function () {
        it(`should match "'fn' 'with' var 'returning' num"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.FN },
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.RETURNING },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnDeclaration()).instanceof(Mint.AST.FnDeclaration);
        });
        it(`should match "'fn' 'with' var 'returning' 'fn' 'with' var 'returning' num"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.FN },
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.RETURNING },
                { type: Mint.TokenType.FN },
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'bar' },
                { type: Mint.TokenType.RETURNING },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.fnDeclaration()).instanceof(Mint.AST.FnDeclaration);
        });
    });
    describe('#declaration()', function () {
        it(`should match "'let' var 'be' num"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.LET },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.BE },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.declaration()).instanceof(Mint.AST.Declaration);
        });
        it(`should match "'let' var 'be' 'fn' 'with' var 'returning' num"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.LET },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.BE },
                { type: Mint.TokenType.FN },
                { type: Mint.TokenType.WITH },
                { type: Mint.TokenType.VAR, value: 'bar' },
                { type: Mint.TokenType.RETURNING },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.declaration()).instanceof(Mint.AST.Declaration);
        });
    });
    describe('#statement()', function () {
        it('should match "declaration"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.LET },
                { type: Mint.TokenType.VAR, value: 'foo' },
                { type: Mint.TokenType.BE },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.statement()).instanceof(Mint.AST.Declaration);
        });
        it('should match "expr"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.statement()).instanceof(Mint.AST.Num);
        });
        it('should match "print"', function () {
            tokenProvider.provide([
                { type: Mint.TokenType.PRINT },
                { type: Mint.TokenType.NUM, value: 100 }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.statement()).instanceof(Mint.AST.Print);
        });
    });
    describe('#program()', function () {
        it('should match "empty"', function () {
            tokenProvider.provide([]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.program()).instanceof(Mint.AST.Program);
        });
        it(`should match "statement ';'"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.SEMI }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.program()).instanceof(Mint.AST.Program);
        });
        it(`should match "statement ';' statement ';'"`, function () {
            tokenProvider.provide([
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.SEMI },
                { type: Mint.TokenType.NUM, value: 100 },
                { type: Mint.TokenType.SEMI }
            ]);
            const parser = new Mint.Parser(tokenProvider);
            expect(parser.program()).instanceof(Mint.AST.Program);
        });
    });
});