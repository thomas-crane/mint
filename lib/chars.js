exports.isSpace = x => /[\s\n\r]/.test(x);
exports.isNum = x => /[0-9]/.test(x);
exports.isVarStart = x => /[A-Za-z]/.test(x);
exports.isVarBody = x => /[A-Za-z0-9]/.test(x);
