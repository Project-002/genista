/**
 * Copyright 2017 - 2018 Schuyler Cebulskie
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

const Argument = require('./Argument');

/** Obtains, validates, and prompts for argument values */
class ArgumentCollector {
	/**
	 * @param {Strelitzia} client - Client the collector will use
	 * @param {ArgumentInfo[]} args - Arguments for the collector
	 * @param {number} [promptLimit=Infinity] - Maximum number of times to prompt for a single argument
	 */
	constructor(client, args, promptLimit = Infinity) {
		if (promptLimit === null) promptLimit = Infinity;

		/**
		 * The client instance
		 * @name Command#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Arguments the collector handles
		 * @type {Argument[]}
		 */
		this.args = new Array(args.length);

		let hasInfinite = false;
		let hasOptional = false;
		for (let i = 0; i < args.length; i++) this.args[i] = new Argument(this.client, args[i]);

		/**
		 * Maximum number of times to prompt for a single argument
		 * @type {number}
		 */
		this.promptLimit = promptLimit;
	}

	/**
	 * Result object from obtaining argument values from an {@link ArgumentCollector}
	 * @typedef {Object} ArgumentCollectorResult
	 * @property {?Object} values - Final values for the arguments, mapped by their keys
	 * @property {?string} cancelled - One of:
	 * - `user` (user cancelled)
	 * - `time` (wait time exceeded)
	 * - `promptLimit` (prompt limit exceeded)
	 * @property {Message[]} prompts - All messages that were sent to prompt the user
	 * @property {Message[]} answers - All of the user's messages that answered a prompt
	 */

	/**
	 * Obtains values for the arguments, prompting if necessary.
	 * @param {CommandMessage} msg - Message that the collector is being triggered by
	 * @param {Array<*>} [provided=[]] - Values that are already available
	 * @param {number} [promptLimit=this.promptLimit] - Maximum number of times to prompt for a single argument
	 * @return {Promise<ArgumentCollectorResult>}
	 */
	async obtain(msg, provided = [], promptLimit = this.promptLimit) {
		this.client.dispatcher._awaiting.add(msg.author.id + msg.channel_id);
		const values = {};
		const results = [];

		try {
			for (let i = 0; i < this.args.length; i++) {
				const arg = this.args[i];
				const result = await arg.obtain(msg, arg.infinite ? provided.slice(i) : provided[i], promptLimit);
				results.push(result);

				if (result.cancelled) {
					this.client.dispatcher._awaiting.delete(msg.author.id + msg.channel_id);
					return {
						values: null,
						cancelled: result.cancelled,
						prompts: [].concat(...results.map(res => res.prompts)),
						answers: [].concat(...results.map(res => res.answers))
					};
				}

				values[arg.key] = result.value;
			}
		} catch (error) {
			this.client.dispatcher._awaiting.delete(msg.author.id + msg.channel_id);
			throw error;
		}

		this.client.dispatcher._awaiting.delete(msg.author.id + msg.channel_id);
		return {
			values,
			cancelled: null,
			prompts: [].concat(...results.map(res => res.prompts)),
			answers: [].concat(...results.map(res => res.answers))
		};
	}
}

module.exports = ArgumentCollector;
