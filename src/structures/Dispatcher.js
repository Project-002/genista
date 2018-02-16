/**
 * A dispatcher for events.
 */
class Dispatcher {
	/**
	 * Creates a new instance of a Dispatcher.
	 * @param {Strelitzia} client The client
	 * @memberof Dispatcher
	 */
	constructor(client) {
		/**
		 * The client instance
		 * @name Dispatcher#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });
	}

	/**
	 * Handle the message.
	 * @param {object} message The raw message
	 * @returns {void}
	 * @memberof Dispatcher
	 */
	async handleMessage(message) {
		if (!this.shouldHandleMessage(message)) return;

		let [cmd, args] = this.parseMessage(message);
		if (!cmd && !args) return;
		if (!cmd && args) {
			this.client.emit('UNKNOWN_COMMAND', message, args);
			return;
		}

		await cmd.run(message, args);
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
		return true;
	}

	/**
	 * Parses the raw message data.
	 * @param {Object} message The raw message
	 * @returns {Array<Command|SubCommand, string>|Array<boolean, string|boolean>} The parsed message
	 * and the arguments
	 * @memberof Dispatcher
	 */
	parseMessage(message) {
		const pattern = new RegExp(
			`^(<@!?${this.client.id}>\\s+(?:${this.client.prefix}\\s*)?|${this.client.prefix}\\s*)([^\\s]+) ?([^\\s]+)?`, 'i'
		);
		const matches = pattern.exec(message.content);
		if (!matches) return [false, false];
		const args = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0) + 1);
		const subArgs = matches[3] ? args.trim().substring(matches[3].length + 1) : null;

		const [cmd] = this.client.registry.findCommands(matches[2], matches[3] ? matches[3] : null);
		if (!cmd) return [false, matches[2]];
		return [cmd, cmd.isSubCommand() ? subArgs : args];
	}
}

module.exports = Dispatcher;
