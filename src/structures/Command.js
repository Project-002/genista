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
 * A command that can be ran.
 */
class Command {
	/**
	 * Options that are passed when creating a new command
	 * @typedef {object} CommandOptions
	 * @prop {string} [name] The command name
	 * @prop {Array<string>} [aliases=[]] The command aliases
	 * @prop {string} [description] The command description
	 */

	/**
	 * Creates an instance of Command.
	 * @param {Strelitzia} client The client
	 * @param {CommandOptions} [options={}] The command options
	 * @memberof Command
	 */
	constructor(client, options = {}) {
		/**
		 * The client instance
		 * @name Command#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The command name
		 * @type {string}
		 */
		this.name = options.name;

		/**
		 * The command aliases
		 * @type {Array<string>}
		 * @default []
		 */
		this.aliases = options.aliases || [];

		/**
		 * The group id
		 * @type {string}
		 */
		this.groupId = options.group;

		/**
		 * The group
		 * @type {Group}
		 */
		this.group = null;

		/**
		 * The command description
		 * @type {?string}
		 */
		this.description = options.description;

		/**
		 * Options for throttling
		 * @type {Object}
		 */
		this.throttling = options.throttling || null;

		/**
		 * Whether default handling is enabled
		 * @type {boolean}
		 */
		this.defaultHandling = 'defaultHandling' in options ? options.defaultHandling : true;

		/**
		 * The regular expression triggers
		 * @type {Array<RegExp>}
		 */
		this.patterns = options.patterns || null;

		/**
		 * Current throttling, mapped by user id
		 * @private
		 * @type {Map<string, Object>}
		 */
		this._throttles = new Map();

		/**
		 * Array of subcommands, if any
		 * @type {Array<SubCommand>}
		 * @default []
		 */
		this.subCommands = [];
	}

	/**
	 * Preparations before running the command.
	 * @param {Object} message The raw message data
	 * @param {string} args The parsed arguments
	 * @returns {*}
	 * @memberof Command
	 */
	_run(message, args) {
		const throttle = this._throttle(message.author.id);
		if (throttle && throttle.usages + 1 > this.throttling.usages) return undefined;
		if (throttle) throttle.usages++;

		const realArgs = this._parseArgs(args);
		return this.run(message, realArgs);
	}

	/**
	 * Runs the actual command.
	 * @param {Object} message The raw message data
	 * @param {string} args The parsed arguments
	 * @abstract
	 * @memberof Command
	 */
	async run(message, args) {} // eslint-disable-line no-unused-vars

	/**
	 * Throttling bois
	 * @private
	 * @param {string} user ID of the user
	 * @return {?Object}
	 */
	_throttle(user) {
		if (!this.throttling) return null;

		let throttle = this._throttles.get(user);
		if (!throttle) {
			throttle = {
				start: Date.now(),
				usages: 0,
				timeout: setTimeout(() => {
					this._throttles.delete(user);
				}, this.throttling.duration * 1000)
			};
			this._throttles.set(user, throttle);
		}

		return throttle;
	}

	_parseArgs(argString, argCount = 0, allowSingleQuote = true) {
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
}

module.exports = Command;
