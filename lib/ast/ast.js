const Environment = require('../environment');

class AST {
    toString() {
        return 'AST';
    }
}

class NodeVisitor {
    constructor() {
        this.environments = [];
    }
    /**
     * @param {AST} node The node to visit.
     * @param {Environment} env The current environment.
     */
    visit(node, env) {
        const name = node.constructor.name;
        const func = this[`visit${name}`];
        if (!func) {
            const error = new Error(`${name} visitor is unimplemented.`);
            error.name = 'UnimplementedVisitor';
            throw error;
        }
        return func.call(this, node, env);
    }

    visitBinaryOp(node, env) {
        const left = this.visit(node.left, env);
        const right = this.visit(node.right, env);
        switch (node.op) {
            case '+': return left + right;
            case '-': return left - right;
            case '/': return left / right;
            case '*': return left * right;
        }
        const error = new Error(`Invalid BinaryOp "${node.op}"`);
        error.name = 'InvalidBinaryOp';
        throw error;
    }

    visitUnaryOp(node, env) {
        const value = this.visit(node.value, env);
        switch (node.op) {
            case '+': return +value;
            case '-': return -value;
        }
    }

    visitDeclaration(node, env) {
        env.setItem(node.id.name, this.visit(node.value, env));
    }

    visitFnDeclaration(node, env) {
        return {
            args: this.visit(node.args, env),
            body: node.expr,
            container: env,
        }
    }

    visitFnArgs(node, env) {
        return node.vars;
    }

    visitFnCall(node, env) {
        const prototype = env.getItem(node.id.name);
        const args = node.args.map(a => this.visit(a, env));
        const funcScope = new Environment(prototype.container, `Fn_${node.id.name}`);
        this.environments.push(funcScope);
        prototype.args.map((a, i) => funcScope.setItem(a.name, args[i]));
        return this.visit(prototype.body, funcScope);
    }

    visitPrint(node, env) {
        const result = this.visit(node.expr, env);
        console.log(result);
    }

    visitVar(node, env) {
        return env.getItem(node.name);
    }

    visitNum(node, env) {
        return node.value;
    }
}
exports.NodeVisitor = NodeVisitor;

class Program extends AST {
    /**
     * @param {AST[]} statements The statements of the program.
     */
    constructor(statements) {
        super();
        this.statements = statements;
    }
    toString() {
        return `// Compiled from Mint\n${this.statements.map(s => `${s.toString()};`).join('\n')}\n`;
    }
}
exports.Program = Program;

class BinaryOp extends AST {
    /**
     * @param {AST} left The left operand.
     * @param {string} op The operator.
     * @param {AST} right The right operand.
     */
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    toString() {
        return `${this.left.toString()} ${this.op} ${this.right.toString()}`;
    }
}
exports.BinaryOp = BinaryOp;

class UnaryOp extends AST {
    /**
     * @param {string} op The operator.
     * @param {AST} value The operand.
     */
    constructor(op, value) {
        super();
        this.op = op;
        this.value = value;
    }
    toString() {
        return `${this.op}(${this.value.toString()})`;
    }
}
exports.UnaryOp = UnaryOp;

class Declaration extends AST {
    /**
     * @param {Var} id The id of the declaration.
     * @param {AST} value The value of the declaration.
     */
    constructor(id, value) {
        super();
        this.id = id;
        this.value = value;
    }
    toString() {
        return `const ${this.id.toString()} = ${this.value.toString()}`;
    }
}
exports.Declaration = Declaration;

class FnDeclaration extends AST {
    /**
     * @param {FnArgs} args The Fn arguments.
     * @param {AST} expr The body of the Fn.
     */
    constructor(args, expr) {
        super();
        this.args = args;
        this.expr = expr;
    }
    toString() {
        return `(${this.args.toString()}) => ${this.expr.toString()}`;
    }
}
exports.FnDeclaration = FnDeclaration;

class FnArgs extends AST {
    /**
     * @param {Var[]} vars The variable names.
     */
    constructor(vars) {
        super();
        this.vars = vars;
    }
    toString() {
        return this.vars.map(v => v.toString()).join(', ');
    }
}
exports.FnArgs = FnArgs;

class FnCall extends AST {
    /**
     * @param {Var} id The name of the Fn to call.
     * @param {AST[]} args The arguments to pass to the Fn.
     */
    constructor(id, args) {
        super();
        this.id = id;
        this.args = args;
    }
    toString() {
        return `${this.id.toString()}(${this.args.map(a => a.toString()).join(', ')})`;
    }
}
exports.FnCall = FnCall;

class Print extends AST {
    /**
     * @param {AST} expr The expression to print.
     */
    constructor(expr) {
        super();
        this.expr = expr;
    }
    toString() {
        return `console.log(${this.expr.toString()})`;
    }
}
exports.Print = Print;

class Var extends AST {
    /**
     * @param {string} name The name of the var.
     */
    constructor(name) {
        super();
        this.name = name;
    }
    toString() {
        return this.name;
    }
}
exports.Var = Var;

class Num extends AST {
    /**
     * @param {number} value The value of the num.
     */
    constructor(value) {
        super();
        this.value = value;
    }
    toString() {
        return this.value.toString();
    }
}
exports.Num = Num;
