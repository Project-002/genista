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
		const subArgs = matches[3] ? args.trim().substring(matches[3].length + 1) : undefined;
		if (!matches) return [false, false];

		const [cmd] = this.client.registry.findCommands(matches[2], matches[3] ? matches[3] : undefined);
		return [cmd, cmd.isSubCommand() ? subArgs : args];
	}
}

module.exports = Dispatcher;
