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

const Message = require('./Message');

/**
 * A dispatcher for events.
 */
class Dispatcher {
	/**
	 * Creates a new instance of a Dispatcher.
	 * @param {Genista} client The client
	 * @memberof Dispatcher
	 */
	constructor(client) {
		/**
		 * The client instance
		 * @name Dispatcher#client
		 * @type {Genista}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		this._awaiting = new Set();
	}

	/**
	 * Handle the message.
	 * @param {Object} message The raw message
	 * @returns {void}
	 * @memberof Dispatcher
	 */
	async handleMessage(message) {
		if (!this.shouldHandleMessage(message)) return;

		const [cmd, args] = this.parseMessage(message);
		if (!cmd && !args) return;
		const cmdMsg = new Message(this.client, message, cmd, args, null);
		if (!cmd && args) {
			this.client.emit('UNKNOWN_COMMAND', cmdMsg);
			return;
		}

		await cmd._run(cmdMsg);
	}

	/**
	 * Determines if a message object should be handled.
	 * @param {Object} message The raw message data
	 * @returns {boolean}
	 * @memberof Dispatcher
	 */
	shouldHandleMessage(message) {
		if (message.author.bot) return false;
		if (this.client.id === message.author.id) return false;
		if (this._awaiting.has(message.author.id + message.channel_id)) return false;
		return true;
	}

	/**
	 * Parses the raw message data.
	 * @param {Object} message The raw message
	 * @returns {Array<Command|SubCommand|boolean, Array<RegExp>|string|boolean>}
	 * @memberof Dispatcher
	 */
	parseMessage(message) {
		for (const command of this.client.registry.commands.values()) {
			if (!command.patterns) continue;
			for (const pattern of command.patterns) {
				const matches = pattern.exec(message.content);
				if (matches) return [command, matches];
			}
		}

		const pattern = new RegExp(
			`^(<@!?${this.client.id}>\\s+(?:${this.client.prefix}\\s*)?|${this.client.prefix}\\s*)([^\\s]+) ?([^\\s]+)?`, 'i'
		);
		const matches = pattern.exec(message.content);
		if (!matches) return [null, null];
		const args = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0) + 1);
		const subArgs = matches[3] ? args.trim().substring(matches[3].length + 1) : null;

		const [cmd] = this.client.registry.findCommands(matches[2], matches[3] ? matches[3] : null);
		if (!cmd) return [null, matches[2]];
		return [cmd, cmd.subCommand ? subArgs : args];
	}
}

module.exports = Dispatcher;
