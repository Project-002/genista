class Dispatcher {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	async handleMessage(message) {
		if (!this.shouldHandleMessage(message)) return;

		let [cmd, args] = this.parseMessage(message);
		if (!cmd) return;

		await cmd.run(message, args);
	}

	shouldHandleMessage(message) {
		if (message.author.bot) return false;
		if (this.client.id === message.author.id) return false;
		return true;
	}

	parseMessage(message) {
		const pattern = new RegExp(
			`^(<@!?${this.client.id}>\\s+(?:${this.client.prefix}\\s*)?|${this.client.prefix}\\s*)([^\\s]+) ?([^\\s]+)?`, 'i'
		);
		const matches = pattern.exec(message.content);
		const args = message.content.substring(matches[1].length + (matches[2] ? matches[2].length : 0) + 1);
		if (!matches) return [false, false];

		for (const command of this.client.registry.commands.values()) {
			if (command.name === matches[2]) {
				if (command.subCommands.length) {
					for (const cmd of command.subCommands) {
						if (cmd.name === matches[3]) { // eslint-disable-line max-depth
							const subArgs = args.trim().substring(matches[3].length + 1);
							return [cmd, subArgs];
						}
					}
				}
				return [command, args];
			}
			continue;
		}
	}
}

module.exports = Dispatcher;
