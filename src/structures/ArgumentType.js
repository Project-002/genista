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

/** A type for command arguments */
class ArgumentType {
	/**
	 * @param {Genista} client - The client the argument type is for
	 * @param {string} id - The argument type ID (this is what you specify in {@link ArgumentInfo#type})
	 */
	constructor(client, id) {
		if (!client) throw new Error('A client must be specified.');
		if (typeof id !== 'string') throw new Error('Argument type ID must be a string.');
		if (id !== id.toLowerCase()) throw new Error('Argument type ID must be lowercase.');

		/**
		 * Client that this argument type is for
		 * @name ArgumentType#client
		 * @type {Genista}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * ID of this argument type (this is what you specify in {@link ArgumentInfo#type})
		 * @type {string}
		 */
		this.id = id;
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Validates a value string against the type
	 * @param {string} val - Value to validate
	 * @param {CommandMessage} msg - Message the value was obtained from
	 * @param {Argument} arg - Argument the value was obtained from
	 * @return {boolean|string|Promise<boolean|string>} Whether the value is valid, or an error message
	 * @abstract
	 */
	validate(val, msg, arg) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a validate() method.`);
	}

	// eslint-disable-next-line valid-jsdoc
	/**
	 * Parses the raw value string into a usable value
	 * @param {string} val - Value to parse
	 * @param {CommandMessage} msg - Message the value was obtained from
	 * @param {Argument} arg - Argument the value was obtained from
	 * @return {*|Promise<*>} Usable value
	 * @abstract
	 */
	parse(val, msg, arg) { // eslint-disable-line no-unused-vars
		throw new Error(`${this.constructor.name} doesn't have a parse() method.`);
	}

	/**
	 * Checks whether a value is considered to be empty. This determines whether the default value for an argument
	 * should be used and changes the response to the user under certain circumstances.
	 * @param {string} val - Value to check for emptiness
	 * @param {CommandMessage} msg - Message the value was obtained from
	 * @param {Argument} arg - Argument the value was obtained from
	 * @return {boolean} Whether the value is empty
	 */
	isEmpty(val, msg, arg) { // eslint-disable-line no-unused-vars
		return !val;
	}
}

module.exports = ArgumentType;
