const expect = require('chai').expect;
const Mint = require('../lib');

describe('Environment', function () {
    describe('#setItem()', function () {
        it('should store the given item and name.', function () {
            const env = new Mint.Environment();
            env.setItem('test-string', 'mystring');
            env.setItem('test-number', 431);
            env.setItem('test-object', { foo: 'bar' });

            expect(env.ids).to.have.property('test-string', 'mystring');
            expect(env.ids).to.have.property('test-number', 431);
            expect(env.ids).to.have.property('test-object').that.deep.equals({ foo: 'bar' });
        });
        it('should not effect items in parent environments.', function () {
            const root = new Mint.Environment();
            const firstLevel = new Mint.Environment(root);
            const secondLevel = new Mint.Environment(firstLevel);

            secondLevel.setItem('test-string', 'mystring');
            expect(root.ids).not.to.have.property('test-string');
            expect(firstLevel.ids).not.to.have.property('test-string');
        });
        it('should throw a VariableMutation error if an existing item is set again.', function () {
            const env = new Mint.Environment();
            env.setItem('test-string', 'mystring');
            expect(() => env.setItem('test-string', 'otherstring')).to.throw().property('name', 'VariableMutation');
        });
    });
    describe('#getItem()', function () {
        it('should get the item from the immediate environment if available.', function () {
            const env = new Mint.Environment();
            env.setItem('test-string', 'mystring');
            env.setItem('test-number', 431);
            env.setItem('test-object', { foo: 'bar' });

            expect(env.getItem('test-string')).to.equal('mystring');
            expect(env.getItem('test-number')).to.equal(431);
            expect(env.getItem('test-object')).to.deep.equal({ foo: 'bar' });
        });
        it('should get the item from a parent environment if not immediately available.', function () {
            const root = new Mint.Environment();
            const firstLevel = new Mint.Environment(root);
            const secondLevel = new Mint.Environment(firstLevel);
            const thirdLevel = new Mint.Environment(secondLevel);

            root.setItem('test-string', 'mystring');
            firstLevel.setItem('test-number', 431);
            secondLevel.setItem('test-object', { foo: 'bar' });

            expect(thirdLevel.getItem('test-string')).to.equal('mystring');
            expect(thirdLevel.getItem('test-number')).to.equal(431);
            expect(thirdLevel.getItem('test-object')).to.deep.equal({ foo: 'bar' });
        });
        it('should throw a NullReference error if the item does not exist.', function () {
            const env = new Mint.Environment();
            expect(() => env.getItem('test-string')).to.throw().property('name', 'NullReference');
            expect(() => env.getItem('test-number')).to.throw().property('name', 'NullReference');
            expect(() => env.getItem('test-object')).to.throw().property('name', 'NullReference');
        });
    });
    describe('#distance()', function () {
        it('should return the length of the parent chain of an environment.', function () {
            const root = new Mint.Environment();
            const firstLevel = new Mint.Environment(root);
            const secondLevel = new Mint.Environment(firstLevel);
            const thirdLevel = new Mint.Environment(secondLevel);
            expect(root.distance()).to.equal(0);
            expect(firstLevel.distance()).to.equal(1);
            expect(secondLevel.distance()).to.equal(2);
            expect(thirdLevel.distance()).to.equal(3);
        });
    });
});