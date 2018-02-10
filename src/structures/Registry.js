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
		for (let command of commands) {
			if (typeof command === 'function') command = new command(this.client);

			this.commands.set(command.name, command);
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
}

module.exports = Registry;
