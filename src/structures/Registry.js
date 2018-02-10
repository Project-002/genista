const { readdirSync } = require('fs');
const { extname, join } = require('path');

class Registry {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });

		this.events = new Map();
		this.commands = new Map();
	}

	registerEvent(event) {
		return this.registerEvents([event]);
	}

	registerEvents(events) {
		if (!Array.isArray(events)) return;
		for (let event of events) {
			if (typeof event === 'function') event = new event(this.client);

			this.events.set(event.name, event);

			if (event.enabled) this.client.consumer.on(event.name, event._run.bind(event));
		}
	}

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

	registerCommand(command) {
		return this.registerCommands([command]);
	}

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

	findCommands(search, subSearch = null) {
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
	}
}

module.exports = Registry;
