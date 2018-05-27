const Event = require('../structures/Event');

class GUILD_CREATE extends Event {
	constructor(...args) {
		super(...args, { name: 'discord:GUILD_CREATE', enabled: true });
	}

	run(message, { ack }) {
		console.log(message);
		ack();
	}
}

module.exports = GUILD_CREATE;
