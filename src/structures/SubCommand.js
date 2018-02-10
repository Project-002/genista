class SubCommand {
	constructor(client, options = {}) {
		Object.defineProperty(this, 'client', { value: client });

		this.name = options.name;
		this.aliases = options.aliases || [];
		this.description = options.description;
		this.subCommand = true;
		this.parent = options.parent;
	}

	isSubCommand() {
		return true;
	}

	async run(message) {}
}

module.exports = SubCommand;
