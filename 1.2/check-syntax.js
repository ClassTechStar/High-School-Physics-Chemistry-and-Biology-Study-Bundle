var c = require('fs').readFileSync('C:/Users/18948/Documents/high-school-science-kit/index.html', 'utf8');
var m = c.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('No inline script found'); process.exit(1); }
var code = m[1];
try {
    new Function(code);
    console.log('Inline script syntax: OK (' + code.split('\n').length + ' lines)');
} catch (e) {
    console.log('SYNTAX ERROR: ' + e.message);
    var lines = code.split('\n');
    for (var i = Math.max(0, e.lineNumber - 3); i < Math.min(lines.length, (e.lineNumber || 0) + 2); i++) {
        console.log('  L' + (i + 1) + ': ' + lines[i].substring(0, 120));
    }
    process.exit(1);
}
