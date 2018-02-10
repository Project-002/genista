class Dispatcher {
	constructor(client) {
		Object.defineProperty(this, 'client', { value: client });
	}

	async handleMessage(message) {
		if (!this.shouldHandleMessage(message)) return;

		let cmd = this.parseMessage(message);
		if (!cmd) return;

		try {
			await cmd.run(message);
		} catch (error) {
			console.error(error);
		}
	}

	shouldHandleMessage(message) {
		if (message.author.bot) return false;
		if (this.client.id === message.author.id) return false;
		return true;
	}

	parseMessage(message) {
		const pattern = new RegExp(
			`^(<@!?${this.client.id}>\\s+(?:${this.client.prefix}\\s*)?|${this.client.prefix}\\s*)([^\\s]+)`, 'i'
		);
		const matches = pattern.exec(message.content);
		if (!matches) return false;

		for (const command of this.client.registry.commands.values()) {
			if (command.name === matches[2]) return command;
			continue;
		}
	}
}

module.exports = Dispatcher;
