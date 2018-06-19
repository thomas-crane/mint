# Mint
A simple, mathematical language.

## Contents
1. [Foreword](#foreword)
2. [Install](#install)
    + [From npm](#from-npm)
    + [From GitHub](#from-github)
3. [Using Mint](#using-mint)
    + [The REPL](#the-repl)
        + [REPL commands](#repl-commands)
    + [Interpreting a Mint file](#interpreting-a-mint-file)
    + [Compiling to JavaScript](#compiling-to-javascript)
4. [Syntax](#syntax)
    + [Comments](#comments)
    + [Variables in Mint](#variables-in-mint)
    + [Functions in Mint](#functions-in-mint)
        + [Parameters](#parameters)
        + [Function body and return value](#function-body-and-return-value)
        + [Calling functions](#calling-functions)
        + [Higher order functions](#higher-order-functions)
    + [Errors in Mint](#errors-in-mint)

## Foreword
This language is, for the most part, a learning project. It is not intended for any serious use cases. **Do not** expect this language to be highly performant or entirely bug-free.

# Install
## From `npm`
```bash
npm install -g mint-lang
```

## From GitHub
```bash
git clone https://github.com/thomas-crane/mint.git
cd mint
npm link
```

# Using Mint
There are several ways to use the Mint language after it is installed. Mint is first and foremost designed to be an interpreted language, but also has a compiler to JavaScript.

## The REPL
Mint has a REPL (**R**ead, **E**valuate, **P**rint, **L**oop) which can be started by simply using the command `mint` with no arguments. The REPL uses the same global environment for the whole session (unless reset), so variables can be declared and then later reused.

### REPL commands
+ `.exit` - Exits the REPL. `.quit` and `.q` also work.
+ `.help` - Prints the help message.
+ `.reset` - Resets the global environment (clears all variables).

## Interpreting a Mint file
Mint files can be interpreted using the command `mint` with the file to interpret as the argument. For example,
```bash
mint mymintfile.mint
```
The file to interpret is relative to the current working directory of the console, and may be a relative path.
```bash
mint mintfiles/example.mint
```

Optionally, the `--debug` flag can be included when interpreting a file. Using this flag will print the contents of all environments which were created while evaluating the file. For example,
```
# myfile.mint
let x be 10;
let y be 20;

> mint myfile.mint
> Environments:
> @Global
>   x: 10
>   y: 20
```

## Compiling to JavaScript
Mint files can be compiled to JavaScript by simply adding the `--compile` flag after the file path. If the flag is present, the program will not be evaluated, but will instead be written to a JavaScript file with the same name as the original file. For example,
```
mint myfile.mint --compile
```
Will compile the program and write the result to the file `myfile.mint.js`.

**The CLI will overwrite the file if it already exists**, so be sure not to use this command if there is a chance that an existing file may be accidentally overwritten.

# Syntax
Mint is designed to look and feel more like describing a mathematical equation than writing code. Because of this, Mint uses more words than symbols to describe operations.

## Comments
Mint currently only supports line comments. The start of a comment is denoted by the `#` symbol, and the end of the comment is denoted by the end of the line.

```
# My Mint program.
# Prints the inverse of a number.
let inverse be fn with x returning 1 / x;
print inverse of 5; # Inline comments are supported too.
```

## Variables in Mint
All variables in Mint are immutable. Once a variable has been declared, it can under no circumstances be changed in any way. Attempting to reassign an existing variable will raise a `VariableMutation` error and will halt execution.

Because variables are immutable, they must be assigned immediately. Variables are created using `let` and `be`.
```
let x be 10;
let y be x * 2;
```

## Functions in Mint
> This API is likely to change.

### Parameters
A function must have **at least** one parameter, but will accept an arbitrary number of parameters separated by commas.
```
let example be fn with x # Valid.
let example be fn with x, y, z # Valid.
let example be fn with x y z # Invalid, commas are required.
```

### Function body and return value
A function must have **one and only one** expression in its body. This expression is also the return value of the function.

Functions are created using `let`, `with` and `returning`
```
let inverse be fn with x returning 1 / x;
let identity be fn with x returning x;
```

### Calling functions
Functions are called using the `of` keyword.
```
let negation be fn with x returning -x;
print negation of 5;
# prints -5.
```

### Higher order functions
Mint allows functions to be used as parameters, as well as allowing functions to be returned from other functions.
```
let multiplier be fn with x returning fn with y returning x * y;
let double be multiplier of 2;
print double of 10;
# prints 20.
```
```
let applyTwice be fn with x, y returning x of x of y;
let inverse be fn with x returning 1 / x;
let identity be fn with x returning applyTwice of inverse, x;
print identity of 10;
# prints 10.
```

## Errors in Mint
There are several types of errors which may be thrown by a Mint program. All errors are considered fatal and will halt execution if they are encountered.
+ `NullReference` - Thrown if a variable that has not yet been declared is referenced.
+ `VariableMutation` - Thrown if an existing variable is reassigned.
+ `InvalidCharacter` - Thrown if an unrecognized character is found in the source code.
+ `InvalidSyntax` - Thrown if invalid syntax is encountered while parsing the source code.

There are two other types of errors, `InvalidBinaryOp` and `UnimplementedVisitor`.
These errors indicate that there is a problem with the interpreter itself. If you encounter one of these errors, please consider opening an issue and including the code necessary to reproduce the error.