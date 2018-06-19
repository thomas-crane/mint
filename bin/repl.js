const Mint = require('../lib');
const readline = require('readline');

class REPL {
    constructor() {
        this.repl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: ': ',
            completer: this.completer
        });
        this.interpreter = new Mint.Interpreter();

        this.repl.on('line', (line) => {
            if (['.exit', '.quit', '.q'].indexOf(line) !== -1) {
                this.repl.close();
                return;
            }
            if (line === '.reset') {
                this.interpreter = new Mint.Interpreter();
                console.log('The global environment has been reset.');
                this.repl.prompt();
                return;
            }
            if (line === '.help') {
                this.printHelp();
                this.repl.prompt();
                return;
            }
            try {
                const lexer = new Mint.Lexer(line);
                const parser = new Mint.Parser(lexer);
                const results = this.interpreter.interpret(parser.parse());
                for (const res of results) {
                    console.log(res);
                }
            } catch (error) {
                console.log(`Error: ${error.name}`);
                console.log(error.message + '\n');
            }
            this.repl.prompt();
        });
    }

    printHelp() {
        console.log('\n--- Mint REPL help ---');
        console.log('.reset   Resets the global environment (clears all variables)');
        console.log('.exit    Exit the REPL (.quit, .q also work)');
        console.log('.help    Print this message\n');
    }

    completer(line) {
        const completions = '.help .exit .quit .q .reset'.split(' ');
        const hits = completions.filter((c) => c.startsWith(line));
        if (hits.length > 0) {
            return [hits, line];
        } else {
            return [completions, line];
        }
    }

    start() {
        this.repl.prompt();
    }
}
module.exports = REPL;
