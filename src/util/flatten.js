/**
 * Flatten an object. Any properties that are collections will get converted to an array of keys.
 * @param {Object} obj The object to flatten.
 * @param {...Object<string, boolean|string>} [props] Specific properties to include/exclude.
 * @returns {Object}
 */
function flatten(obj, ...props) {
	const isObject = d => typeof d === 'object' && d !== null;
	if (!isObject(obj)) return obj;

	props = Object.assign(...Object.keys(obj).filter(k => !k.startsWith('_')).map(k => ({ [k]: true })), ...props);

	const out = {};

	for (let [prop, newProp] of Object.entries(props)) {
		if (!newProp) continue;
		newProp = newProp === true ? prop : newProp;

		const element = obj[prop];
		const elemIsObj = isObject(element);
		const valueOf = elemIsObj && typeof element.valueOf === 'function' ? element.valueOf() : null;

		// If it's a collection, make the array of keys
		if (element instanceof require('./Collection')) out[newProp] = Array.from(element.keys());
		// If it's an array, flatten each element
		else if (Array.isArray(element)) out[newProp] = element.map(e => this.constructor.flatten(e));
		// If it's an object with a primitive `valueOf`, use that value
		else if (valueOf && !isObject(valueOf)) out[newProp] = valueOf;
		// If it's a primitive
		else if (!elemIsObj) out[newProp] = element;
	}

	return out;
}

module.exports = flatten;
