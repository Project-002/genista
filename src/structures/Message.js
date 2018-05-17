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

/**
 * A command message.
 */
class CommandMessage {
	constructor(client, message, command = null, args = null, patterns = null) {
		/**
		 * The client instance
		 * @name Message#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Message that triggered the command
		 * @type {Object}
		 */
		this.message = message;

		/**
		 * Command that the message triggered
		 * @type {Object}
		 */
		this.command = command;

		/**
		 * Arguments for the command
		 * @type {Object}
		 */
		this.args = args;

		/**
		 * Pattern matches
		 * @type {?string[]}
		 */
		this.patterns = patterns;
	}

	parseArgs() {
		return this.constructor.parseArgs(this.args);
	}

	/**
	 * Parses an argument string into an array of arguments.
	 * @static
	 * @param {string|Array<string>} argString The argument string to parse
	 * @param {number} [argCount=0] The number of arguments to extract from the string
	 * @param {boolean} [allowSingleQuote=true] Whether or not single quotes should be allowed
	 * @returns {Array<string>}
	 * @memberof CommandMessage
	 */
	static parseArgs(argString, argCount = 0, allowSingleQuote = true) {
		if (Array.isArray(argString)) [argString] = argString;
		const re = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g;
		const result = [];
		let match = [];
		argCount = argCount || argString.length;
		while (--argCount && (match = re.exec(argString))) result.push(match[2] || match[3]);
		if (match && re.lastIndex < argString.length) {
			const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g;
			result.push(argString.substr(re.lastIndex).replace(re2, '$2'));
		}

		return result;
	}

	// SHORTCUTS

	get id() {
		return this.message.id;
	}

	get guild_id() {
		return this.message.guild_id || null;
	}

	get channel_id() {
		return this.message.channel_id;
	}

	get author() {
		return this.message.author;
	}

	get attachments() {
		return this.message.attachments;
	}

	get content() {
		return this.message.content;
	}

	get timestamp() {
		return this.message.timestamp;
	}
}

module.exports = CommandMessage;
