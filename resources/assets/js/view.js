module.exports = function(file) {
    return fs.readFileSync(viewDir + '/' + file + '.html', 'utf8');
}
