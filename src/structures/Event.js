/**
 * An event that will be processed by the {@link Strelitzia} instance
 */
class Event {
	/**
	 * Options that are passed when creating a new event
	 * @typedef {object} EventOptions
	 * @prop {string} [name] The event name
	 * @prop {boolean} [enabled] If the event should be enabled
	 */

	/**
	 * Creates an instance of Event.
	 * @param {Strelitzia} client The client
	 * @param {EventOptions} [options={}] The event options
	 * @memberof Event
	 */
	constructor(client, options = {}) {
		/**
		 * The client instance
		 * @name Event#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The event name
		 * @type {string}
		 */
		this.name = options.name;

		/**
		 * If this event is enabled
		 * @type {boolean}
		 */
		this.enabled = Boolean(options.enabled);
	}

	/**
	 * Runs the event if the event is enabled.
	 * @private
	 * @param {Array<*>} args The raw arguments received
	 * @memberof Event
	 */
	async _run(...args) {
		if (this.enabled) {
			try {
				await this.run(...args);
			} catch (error) {
				/**
				 * Emmited when there was an error
				 * @event Strelitzia#error
				 * @prop {Strelitzia|Event} instance The instance where the error occured
				 * @prop {Array<*>|Error|TypeError|RangeError} errorOrArgs The arguments passed or an error instance
				 * @prop {?(Error|TypeError|RangeError)} error The error received
				 */
				this.client.emit('error', this, args, error);
			}
		}
	}

	/**
	 * Function that takes the event input and processes it.
	 * @param {Array<*>} args The raw arguments received
	 * @abstract
	 * @memberof Event
	 */
	run(...args) {} // eslint-disable-line no-unused-vars
}

module.exports = Event;
