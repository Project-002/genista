const { readdirSync } = require('fs');
const { extname, join } = require('path');

/**
 * The registry of a {@link Strelitzia} instance
 */
class Registry {
	/**
	 * Creates an instance of Registry.
	 * @param {Strelitzia} client The client
	 * @memberof Registry
	 */
	constructor(client) {
		/**
		 * The client instance
		 * @name Registry#client
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Cached event instances
		 * @type {Map<string, Event>}
		 */
		this.events = new Map();

		/**
		 * Cached command instances
		 * @type {Map<string, Command>}
		 */
		this.commands = new Map();
	}

	/**
	 * Registers an event.
	 * @param {string} event The event path to register
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEvent(event) {
		return this.registerEvents([event]);
	}

	/**
	 * Registers multiple events.
	 * @param {string[]} events The event paths
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEvents(events) {
		if (!Array.isArray(events)) return;
		for (let event of events) {
			if (typeof event === 'function') event = new event(this.client);

			this.events.set(event.name, event);

			if (event.enabled) this.client.consumer.on(event.name, event._run.bind(event));
		}
	}

	/**
	 * Registers event files from the specified path.
	 * @param {string} path The path of the event files
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEventsIn(path) {
		const files = readdirSync(path);
		const events = [];
		for (let event of files) {
			if (extname(event) !== '.js') continue;
			event = require(join(path, event));
			events.push(event);
		}

		return this.registerEvents(events);
	}

	/**
	 * Registers a command.
	 * @param {string} command The command path
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommand(command) {
		return this.registerCommands([command]);
	}

	/**
	 * Registers multiple commands.
	 * @param {string[]} commands The command paths
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommands(commands) {
		if (!Array.isArray(commands)) return;
		const realCommands = [];
		const realSubCommands = [];
		for (let command of commands) {
			if (typeof command === 'function') command = new command(this.client);
			if (command.isSubCommand()) realSubCommands.push(command);
			else realCommands.push(command);
		}

		for (const cmd of realCommands) this.commands.set(cmd.name, cmd);
		for (const cmd of realSubCommands) {
			const parent = this.commands.get(cmd.parent);
			if (!parent) continue;
			parent.subCommands.push(cmd);
		}
	}

	/**
	 * Register command files from the specified path
	 * @param {string} path The path of the command files
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommandsIn(path) {
		const files = readdirSync(path);
		const commands = [];
		for (let command of files) {
			if (extname(command) !== '.js') continue;
			command = require(join(path, command));
			commands.push(command);
		}

		return this.registerCommands(commands);
	}

	/**
	 * Finds a command or subcommand based on a string.
	 * @param {string} search The term to search for
	 * @param {?string} [subSearch=null] If the function should search for subcommands aswell
	 * @returns {?Array<Command|SubCommand>}
	 * @memberof Registry
	 */
	findCommands(search, subSearch = null) { // eslint-disable-line consistent-return
		search = search.toLowerCase();
		for (const command of this.commands.values()) {
			if (command.name === search || (command.aliases && command.aliases.some(alias => alias === search))) {
				if (subSearch && command.subCommands.length) {
					for (const cmd of command.subCommands) {
						// eslint-disable-next-line max-depth
						if (cmd.name === subSearch || (cmd.aliases && cmd.aliases.some(alias => alias === subSearch))) {
							return [cmd];
						}
					}
				}
				return [command];
			}
			continue;
		}
		return [null];
	}
}

module.exports = Registry;
