const Event = require('../structures/Event');

class UNKNOWN_COMMAND extends Event {
	constructor(...args) {
		super(...args, { name: 'UNKNOWN_COMMAND', enabled: true, client: true });
	}

	async run(message, args) {
		const [cmd] = this.client.registry.findCommands('weebsh');
		if (cmd) {
			const command = { args };
			const { data } = await this.client.api.post(`/discord/fun/weebsh`, command);
			await this.client.rest.channels[message.channel_id].messages.post(data);
		}
	}
}

module.exports = UNKNOWN_COMMAND;
