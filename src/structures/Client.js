const { EventEmitter } = require('events');
const rest = require('@spectacles/rest');
const { Amqp } = require('@spectacles/brokers');
const Dispatcher = require('../structures/Dispatcher');
const Registry = require('../structures/Registry');

/**
 * The Strelitzia client
 * @extends {EventEmitter}
 */
class Strelitzia extends EventEmitter {
	/**
	 * Options passed to Strelitzia when creating a new instance
	 * @typedef {object} StrelitziaOptions
	 * @prop {string} [token] The token
	 * @prop {string} [id] The client ID
	 * @prop {string} [prefix='='] The command prefix
	 */

	/**
	 * Creates an instance of Strelitzia.
	 * @param {StrelitziaOptions} [options={}] The client options
	 * @memberof Strelitzia
	 */
	constructor(options = {}) {
		super();

		/**
		 * A chainable query for the rest
		 * @type {@spectacles/rest.ChainableQuery}
		 */
		this.rest = rest(options.token);

		/**
		 * The client ID
		 * @type {string}
		 */
		this.id = options.id;

		/**
		 * The command prefix
		 * @type {string}
		 * @default '='
		 */
		this.prefix = options.prefix || '=';

		/**
		 * The consumer of this client
		 * @type {Amqp}
		 */
		this.consumer = new Amqp('consumer');

		/**
		 * The dispatcher of this client
		 * @type {Dispatcher}
		 */
		this.dispatcher = new Dispatcher(this);

		/**
		 * The client registry
		 * @type {Registry}
		 */
		this.registry = new Registry(this);
	}

	/**
	 * Connects to the message broker.
	 * @param {string} [url='localhost'] The URL of the message broker
	 * @param {string[]} events Array of events
	 * @memberof Strelitzia
	 */
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
