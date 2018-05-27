const Event = require('../structures/Event');

class UNKNOWN_COMMAND extends Event {
	constructor(...args) {
		super(...args, { name: 'UNKNOWN_COMMAND', enabled: true, client: true });
	}

	run(message, args) {
		const [cmd] = this.client.registry.findCommands('weebsh');
		if (cmd) {
			[args] = args.split(' ');
			return cmd._run(message, args);
		}
	}
}

module.exports = UNKNOWN_COMMAND;
