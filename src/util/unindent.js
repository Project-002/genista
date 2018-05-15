function unindent(str, ...keys) {
	if (Array.isArray(str)) {
		const copy = [];
		for (const i in keys) {
			copy.push(str[i]);
			copy.push(keys[i]);
		}
		str = copy.join('');
	}
	const lines = str.split('\n').filter(l => l);
	const base = lines[0].match(/^\s*/);

	return lines.map(l => l.replace(base, '')).join('\n');
}

module.exports = unindent;
