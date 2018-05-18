/**
 * Copyright 2017 - 2018 Schuyler Cebulskie
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const ArgumentUnionType = require('../types/Union');

/** A fancy argument */
class Argument {
	/**
	 * @typedef {Object} ArgumentInfo
	 * @property {string} key - Key for the argument
	 * @property {string} [label=key] - Label for the argument
	 * @property {string} prompt - First prompt for the argument when it wasn't specified
	 * @property {string} [error] - Predefined error message to output for the argument when it isn't valid
	 * @property {string} [type] - Type of the argument (must be the ID of one of the registered argument types
	 * or multiple IDs in order of priority separated by `|` for a union type
	 * @property {number} [max] - If type is `integer` or `float`, this is the maximum value of the number.
	 * If type is `string`, this is the maximum length of the string.
	 * @property {number} [min] - If type is `integer` or `float`, this is the minimum value of the number.
	 * If type is `string`, this is the minimum length of the string.
	 * @property {ArgumentDefault} [default] - Default value for the argument (makes the arg optional - cannot be `null`)
	 * @property {string[]} [oneOf] - An array of values that are allowed to be used
	 * @property {boolean} [infinite=false] - Whether the argument accepts infinite values
	 * @property {Function} [validate] - Validator function for the argument (see {@link ArgumentType#validate})
	 * @property {Function} [parse] - Parser function for the argument (see {@link ArgumentType#parse})
	 * @property {Function} [isEmpty] - Empty checker for the argument (see {@link ArgumentType#isEmpty})
	 * @property {number} [wait=30] - How long to wait for input (in seconds)
	 */

	/**
	 * Either a value or a function that returns a value. The function is passed the CommandMessage and the Argument.
	 * @typedef {*|Function} ArgumentDefault
	 */

	/**
	 * @param {Strelitzia} client - Client the argument is for
	 * @param {ArgumentInfo} options - Information for the command argument
	 */
	constructor(client, options) {
		/**
		 * The client instance
		 * @name Command#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Key for the argument
		 * @type {string}
		 */
		this.key = options.key;

		/**
		 * Label for the argument
		 * @type {string}
		 */
		this.label = options.label;

		/**
		 * Question prompt for the argument
		 * @type {string}
		 */
		this.prompt = options.prompt;

		/**
		 * Error message for when a value is invalid
		 * @type {?string}
		 */
		this.error = options.error || null;

		/**
		 * Type of the argument
		 * @type {?ArgumentType}
		 */
		this.type = this.constructor.determineType(client, options.type);

		/**
		 * If type is `integer` or `float`, this is the maximum value of the number.
		 * If type is `string`, this is the maximum length of the string.
		 * @type {?number}
		 */
		this.max = typeof options.max === 'undefined' ? null : options.max;

		/**
		 * If type is `integer` or `float`, this is the minimum value of the number.
		 * If type is `string`, this is the minimum length of the string.
		 * @type {?number}
		 */
		this.min = typeof options.min === 'undefined' ? null : options.min;

		/**
		 * The default value for the argument
		 * @type {?ArgumentDefault}
		 */
		this.default = typeof options.default === 'undefined' ? null : options.default;

		/**
		 * Values the user can choose from
		 * If type is `string`, this will be case-insensitive
		 * If type is `channel`, `member`, `role`, or `user`, this will be the IDs.
		 * @type {?string[]}
		 */
		this.oneOf = typeof options.oneOf === 'undefined' ? null : options.oneOf;

		/**
		 * Validator function for validating a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#validate}
		 */
		this.validator = options.validate || null;

		/**
		 * Parser function for parsing a value for the argument
		 * @type {?Function}
		 * @see {@link ArgumentType#parse}
		 */
		this.parser = options.parse || null;

		/**
		 * Function to check whether a raw value is considered empty
		 * @type {?Function}
		 * @see {@link ArgumentType#isEmpty}
		 */
		this.emptyChecker = options.isEmpty || null;
	}

	/**
	 * Result object from obtaining a single {@link Argument}'s value(s)
	 * @typedef {Object} ArgumentResult
	 * @property {?*|?Array<*>} value - Final value(s) for the argument
	 * @property {?string} cancelled - One of:
	 * - `user` (user cancelled)
	 * - `time` (wait time exceeded)
	 * - `promptLimit` (prompt limit exceeded)
	 * @property {Message[]} prompts - All messages that were sent to prompt the user
	 * @property {Message[]} answers - All of the user's messages that answered a prompt
	 */

	/**
	 * Prompts the user and obtains the value for the argument
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @param {string} [val] - Pre-provided value for the argument
	 * @param {number} [promptLimit=Infinity] - Maximum number of times to prompt for the argument
	 * @return {Promise<ArgumentResult>}
	 */
	async obtain(msg, val) {
		let empty = this.isEmpty(val, msg);
		if (empty && this.default !== null) {
			return {
				value: typeof this.default === 'function' ? await this.default(msg, this) : this.default,
				cancelled: null
			};
		}

		let prompts = 0;
		let valid = empty ? false : await this.validate(val, msg);

		while (!valid || typeof valid === 'string') {
			if (prompts >= 1) {
				await this.client.rest.channels[msg.channel_id].messages.post({ content: empty ? this.prompt : valid ? valid : '.' });

				return {
					value: null,
					cancelled: 'limit'
				};
			}

			empty = this.isEmpty(val, msg);
			valid = await this.validate(val, msg);
			prompts++;
		}

		return {
			value: await this.parse(val, msg),
			cancelled: null
		};
	}

	/**
	 * Checks if a value is valid for the argument
	 * @param {string} val - Value to check
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @return {boolean|string|Promise<boolean|string>}
	 */
	validate(val, msg) {
		const valid = this.validator ? this.validator(val, msg, this) : this.type.validate(val, msg, this);
		if (!valid || typeof valid === 'string') return this.error || valid;
		if (valid instanceof Promise) return valid.then(vld => (!vld || typeof vld === 'string' ? this.error || vld : vld));
		return valid;
	}

	/**
	 * Parses a value string into a proper value for the argument
	 * @param {string} val - Value to parse
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @return {*|Promise<*>}
	 */
	parse(val, msg) {
		if (this.parser) return this.parser(val, msg, this);
		return this.type.parse(val, msg, this);
	}

	/**
	 * Checks whether a value for the argument is considered to be empty
	 * @param {string} val - Value to check for emptiness
	 * @param {CommandMessage} msg - Message that triggered the command
	 * @return {boolean}
	 */
	isEmpty(val, msg) {
		if (this.emptyChecker) return this.emptyChecker(val, msg, this);
		if (this.type) return this.type.isEmpty(val, msg, this);
		return !val;
	}

	/**
	 * Gets the argument type to use from an ID
	 * @param {CommandoClient} client - Client to use the registry of
	 * @param {string} id - ID of the type to use
	 * @returns {?ArgumentType}
	 * @private
	 */
	static determineType(client, id) {
		if (!id) return null;
		if (!id.includes('|')) return client.registry.types.get(id);

		let type = client.registry.types.get(id);
		if (type) return type;
		type = new ArgumentUnionType(client, id);
		client.registry.registerType(type);
		return type;
	}
}

module.exports = Argument;
