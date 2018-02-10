class Command {
	constructor(client, options = {}) {
		Object.defineProperty(this, 'client', { value: client });

		this.name = options.name;
		this.aliases = options.aliases || [];
		this.description = options.description;
	}

	async run(message) {}
}

module.exports = Command;
