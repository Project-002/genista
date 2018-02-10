class Registry {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });

		this.commands = new Map();
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

	registerCommandsIn() {}
}

module.exports = Registry;
