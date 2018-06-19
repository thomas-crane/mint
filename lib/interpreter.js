const { NodeVisitor } = require('./ast/ast');
const Environment = require('./environment');

class Interpreter extends NodeVisitor {
    constructor() {
        super();
        this.rootEnvironment = new Environment(undefined, 'Global');
        this.environments.push(this.rootEnvironment);
    }

    interpret(program) {
        return this.visit(program, this.rootEnvironment);
    }

    visitProgram(node, env) {
        const results = [];
        for (const statement of node.statements) {
            results.push(this.visit(statement, env));
        }
        return results.filter(r => r);
    }
}
module.exports = Interpreter;
