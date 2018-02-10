class Event {
	constructor(client, options = {}) {
		Object.defineProperty(this, 'client', { value: client });
		this.name = options.name;
		this.type = 'event';
		this.enabled = Boolean(options.enabled);
	}

	async _run(...args) {
		if (this.enabled) {
			try {
				await this.run(...args);
			} catch (error) {
				this.client.emit('error', this, args, error);
			}
		}
	}

	run(...args) {} // eslint-disable-line no-unused-vars
}

module.exports = Event;
