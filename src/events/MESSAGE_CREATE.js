const Event = require('../structures/Event');

class MESSAGE_CREATE extends Event {
	constructor(...args) {
		super(...args, { name: 'discord:MESSAGE_CREATE', enabled: true });
	}

	run(message, { ack }) {
		const messageError = err => this.client.emit('error', err);
		this.client.dispatcher.handleMessage(message).catch(messageError);
		ack();
	}
}

module.exports = MESSAGE_CREATE;
