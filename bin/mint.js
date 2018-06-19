#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const Mint = require('../lib');
const REPL = require('./repl');


const args = process.argv.slice(2);

if (args.length === 0) {
    const repl = new REPL();
    repl.start();
    return;
}

const filePath = path.join(process.cwd(), ...args[0].split(/\\|\//));
const shouldCompile = args.some(a => a === '--compile');

try {
    const contents = fs.readFileSync(filePath, { encoding: 'utf8' });
    const lexer = new Mint.Lexer(contents);
    const parser = new Mint.Parser(lexer);
    const result = parser.parse();
    if (shouldCompile) {
        fs.writeFileSync(filePath + '.js', result.toString());
        const fileName = filePath.split(path.sep).pop();
        console.log(`Compiled ./${fileName} to ./${fileName}.js`)
    } else {
        const interpreter = new Mint.Interpreter();
        interpreter.interpret(result);
        const debug = args.some(a => a === '--debug');
        if (debug) {
            console.log('Environments: ');
            for (const env of interpreter.environments) {
                const info = env.getInfo();
                for (const str of info) {
                    console.log(`${'  '.repeat(env.distance())}${str}`);
                }
            }
        }
    }
} catch (error) {
    if (error.code === 'ENOENT') {
        console.log(`The file "${args[0]}" could not be found.`);
    } else {
        console.log(`\nError: ${error.name}`);
        console.log(error.message + '\n');
    }
}