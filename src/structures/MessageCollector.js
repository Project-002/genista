/**
 * Copyright 2015 - 2018 Amish Shah
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Collector = require('./Collector');

/**
 * @typedef {CollectorOptions} MessageCollectorOptions
 * @property {number} max The maximum amount of messages to collect
 * @property {number} maxProcessed The maximum amount of messages to process
 */

/**
 * Collects messages on a channel.
 * @extends {Collector}
 */
class MessageCollector extends Collector {
	/**
	 * @param {Strelitzia} client The client
	 * @param {string} channel The channel id
	 * @param {Function} filter The filter to be applied to this collector
	 * @param {MessageCollectorOptions} options The options to be applied to this collector
	 * @emits MessageCollector#message
	 */
	constructor(client, channel, filter, options = {}) {
		super(client, filter, options);

		/**
		 * The channel id
		 * @type {string}
		 */
		this.channel = channel;

		/**
		 * Total number of messages that were received in the channel during message collection
		 * @type {number}
		 */
		this.received = 0;

		this.client.consumer.setMaxListeners(this.client.consumer.getMaxListeners() + 1);
		this.client.consumer.on('discord:MESSAGE_CREATE', this.handleCollect);

		this.once('end', () => {
			this.client.consumer.removeListener('discord:MESSAGE_CREATE', this.handleCollect);
			this.client.consumer.setMaxListeners(this.client.consumer.getMaxListeners() - 1);
		});
	}

	/**
	 * Handles a message for possible collection.
	 * @param {Message} message The message that could be collected
	 * @returns {?Snowflake}
	 * @private
	 */
	collect(message) {
		/**
		 * Emitted whenever a message is collected.
		 * @event MessageCollector#collect
		 * @param {Object} message The message that was collected
		 */
		if (message.channel_id !== this.channel) return null;
		this.received++;
		return message.id;
	}

	/**
	 * Handles a message for possible disposal.
	 * @param {Message} message The message that could be disposed of
	 * @returns {?Snowflake}
	 */
	dispose(message) {
		/**
		 * Emitted whenever a message is disposed of.
		 * @event MessageCollector#dispose
		 * @param {Object} message The message that was disposed of
		 */
		return message.channel_id === this.channel ? message.id : null;
	}

	/**
	 * Checks after un/collection to see if the collector is done.
	 * @returns {?string}
	 * @private
	 */
	endReason() {
		if (this.options.max && this.collected.size >= this.options.max) return 'limit';
		if (this.options.maxProcessed && this.received === this.options.maxProcessed) return 'processedLimit';
		return null;
	}
}

module.exports = MessageCollector;
