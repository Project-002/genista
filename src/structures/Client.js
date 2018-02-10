const { EventEmitter } = require('events');
const rest = require('@spectacles/rest');
const { Amqp } = require('@spectacles/brokers');
const Dispatcher = require('../structures/Dispatcher');
const Registry = require('../structures/Registry');

class Strelitzia extends EventEmitter {
	constructor(options = {}) {
		super();
		this.rest = rest(options.token);
		this.id = options.id;
		this.prefix = options.prefix || '=';
		this.consumer = new Amqp('consumer');
		this.dispatcher = new Dispatcher(this);
		this.registry = new Registry(this);
	}

	async login(url = 'localhost', events) {
		try {
			await this.consumer.connect(url);
			await this.consumer.subscribe(events);
		} catch (error) {
			this.emit('error', this, error);
		}
	}
}

module.exports = Strelitzia;
