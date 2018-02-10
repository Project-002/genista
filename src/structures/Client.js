const { EventEmitter } = require('events');
const rest = require('@spectacles/rest');
const { Amqp } = require('@spectacles/brokers');
const { readdirSync } = require('fs');
const { extname, join } = require('path');
const Dispatcher = require('../structures/Dispatcher');
const Registry = require('../structures/Registry');

class Strelitzia extends EventEmitter {
	constructor(options = {}) {
		super();
		this.rest = rest(options.token);
		this.id = options.id;
		this.prefix = options.prefix || '=';
		this.eventPath = options.eventPath;
		this.consumer = new Amqp('consumer');
		this.dispatcher = new Dispatcher(this);
		this.registry = new Registry(this);
	}

	async login(url = 'localhost', events) {
		try {
			await this.consumer.connect(url);
			await this.consumer.subscribe(events);
			// TODO: Needs refactoring into a registry or something
			const files = readdirSync(this.eventPath);
			for (let event of files) {
				if (extname(event) !== '.js') continue;
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
