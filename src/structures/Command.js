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

const ArgumentCollector = require('./ArgumentCollector');
const Message = require('./Message');

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
	 * @param {Genista} client The client
	 * @param {CommandOptions} [options={}] The command options
	 * @memberof Command
	 */
	constructor(client, options = {}) {
		/**
		 * The client instance
		 * @name Command#client
		 * @type {Genista}
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
		this.description = options.description || null;

		/**
		 * The command format
		 * @type {?string}
		 */
		this.format = options.format || null;

		/**
		 * Options for throttling
		 * @type {Object}
		 */
		this.throttling = options.throttling || null;

		this.argsCollector = options.args ? new ArgumentCollector(client, options.args) : null;

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
	 * @returns {*}
	 * @memberof Command
	 */
	async _run(message) {
		if (!await this.client.isOwner(message.author.id)) {
			const throttle = this._throttle(message.author.id);
			if (throttle && throttle.usages + 1 > this.throttling.usages) return undefined;
			if (throttle) throttle.usages++;
		}
		if (this.argsCollector) {
			const provided = Message.parseArgs(message.args.trim(), this.argsCollector.args.length);
			const result = await this.argsCollector.obtain(message, provided);
			if (result.cancelled) return;
			message.args = result.values;
		}

		return this.run(message, message.args ? message.args : message.parseArgs());
	}

	/**
	 * Runs the actual command.
	 * @abstract
	 * @param {Object} message The raw message data
	 * @param {string} args The parsed arguments
	 * @memberof Command
	 */
	async run(message, args) {} // eslint-disable-line no-unused-vars

	/**
	 * Creates a usage sring for the command.
	 * @param {string} [args] A string of arguments
	 * @param {string} [prefix=this.client.prefix] Prefix to use for the command
	 * @param {Object} [user=this.client.me] User to use for the mention command
	 * @returns {string}
	 * @memberof Command
	 */
	usage(args, prefix = this.client.prefix, user = this.client.me) {
		return this.constructor.usage(`${this.name}${args ? ` ${args}` : ''}`, prefix, user);
	}

	/**
	 * Throttling bois.
	 * @private
	 * @param {string} user ID of the user
	 * @return {?Object}
	 * @memberof Command
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

	/**
	 * Creates a usage string for a command.
	 * @static
	 * @param {string} command A command and args
	 * @param {string} [prefix=null] Prefix to use for the command
	 * @param {string} [user=null] User to use for the mention command
	 * @returns {string}
	 * @memberof Command
	 */
	static usage(command, prefix = null, user = null) {
		const cmd = command.replace(/ /g, '\xa0');
		if (!prefix && !user) return `\`${cmd}\``;

		let prefixPart;
		if (prefix) {
			if (prefix.length > 1 && !prefix.endsWith(' ')) prefix += ' ';
			prefix = prefix.replace(/ /g, '\xa0');
			prefixPart = `\`${prefix}${cmd}\``;
		}

		let mentionPart;
		if (user) mentionPart = `\`@${user.username.replace(/ /g, '\xa0')}#${user.discriminator}\xa0${cmd}\``;

		return `${prefixPart || ''}${prefix && user ? ' or ' : ''}${mentionPart || ''}`;
	}
}

module.exports = Command;
