class Command {
	constructor(client, options = {}) {
		Object.defineProperty(this, 'client', { value: client });

		this.name = options.name;
		this.aliases = options.aliases || [];
		this.description = options.description;

		this.subCommands = [];
	}

	isSubCommand() {
		return false;
	}

	async run(message, args) {} // eslint-disable-line no-unused-vars
}

module.exports = Command;
