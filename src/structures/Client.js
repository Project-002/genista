const { EventEmitter } = require('events');
const rest = require('@spectacles/rest');
const { Amqp } = require('@spectacles/brokers');
const { readdirSync } = require('fs');
const { join } = require('path');

class Strelitzia extends EventEmitter {
	constructor(options = {}) {
		super();
		this.rest = rest(options.token);
		this.prefix = null;
		this.eventPath = options.eventPath;
		this.consumer = new Amqp('consumer');
	}

	get prefix() {
		return this._prefix;
	}

	async login(url = 'localhost', events) {
		try {
			await this.consumer.connect(url);
			await this.consumer.subscribe(events);
			// TODO: Needs refactoring into a registry or something
			const files = readdirSync(this.eventPath);
			for (let event of files) {
				event = require(join(this.eventPath, event));
				if (typeof event === 'function') event = new event(this);
				if (event.enabled) this.consumer.on(event.name, event._run.bind(event));
			}
		} catch (error) {
			console.error(error);
		}
	}
}

module.exports = Strelitzia;
