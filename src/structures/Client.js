const { EventEmitter } = require('events');
const rest = require('@spectacles/rest');
const { Amqp } = require('@spectacles/brokers');
const { default: Cache } = require('@spectacles/cache');
const Redis = require('ioredis');
const axios = require('axios');
const Dispatcher = require('../structures/Dispatcher');
const Registry = require('../structures/Registry');

/**
 * The Genista client.
 * @extends {EventEmitter}
 */
class Genista extends EventEmitter {
	/**
	 * Options passed to Genista when creating a new instance
	 * @typedef {Object} GenistaOptions
	 * @prop {string} [token] The token
	 * @prop {string|Array<string>|Set<string>} [owner] The owners
	 * @prop {string} [id] The client ID
	 * @prop {string} [prefix='='] The command prefix
	 */

	/**
	 * Creates an instance of Genista.
	 * @param {GenistaOptions} [options={}] The client options
	 * @memberof Genista
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
		 * The amount of shards
		 * @type {number}
		 * @default 1
		 */
		this.shards = parseInt(options.shards, 10) || 1;

		/**
		 * The consumer of this client
		 * @type {Amqp}
		 */
		this.consumer = new Amqp('consumer');

		/**
		 * The publisher of this client
		 * @type {Amqp}
		 */
		this.publisher = new Amqp('publisher');

		/**
		 * The rpc of this client
		 * @type {Amqp}
		 */
		this.rpc = new Amqp('rpc', { rpc: true });

		/**
		 * The cache of this client
		 * @type {@spectacles/cache.Client}
		 */
		if (options.cache) {
			this.cache = new Cache({
				port: 6379,
				host: process.env.REDIS,
				db: 0
			});
		}

		/**
		 * The redis of this client
		 * @type {Redis}
		 */
		this.redis = new Redis({
			port: 6379,
			host: process.env.REDIS,
			db: 1
		});

		this.commands = axios.create({ baseURL: `http://${process.env.COMMAND_API}/` });

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

		/**
		 * The clients user object
		 * @type {?string}
		 * @private
		 */
		this._me = null;

		this._owner = options.owner;
	}

	get me() {
		if (!this._me) {
			return (async () => {
				const user = await this.rest.users[this.id].get();
				this._me = user;
				return user;
			})();
		}
		return this._me;
	}

	set me(user) {
		this._me = user;
	}

	async isOwner(user) {
		if (!this._owner) return false;
		user = await this.cache.users.get(user);
		if (!user) throw new RangeError('Unable to resolve user.');
		if (typeof this._owner === 'string') return user.id === this._owner;
		if (this._owner instanceof Array) return this._owner.includes(user.id);
		if (this._owner instanceof Set) return this._owner.has(user.id);
		throw new RangeError('The client\'s "owner" option is an unknown value');
	}

	/**
	 * Connects to the message broker.
	 * @param {string} [url='localhost'] The URL of the message broker
	 * @param {Array<string>} events Array of events
	 * @memberof Genista
	 */
	async login(url = 'localhost', events) {
		try {
			const connection = await this.consumer.connect(url);
			await this.publisher.connect(connection);
			await this.rpc.connect(connection);

			await this.consumer.subscribe(events);
			await this.me;
		} catch (error) {
			this.emit('error', this, error);
		}
	}
}

module.exports = Genista;
