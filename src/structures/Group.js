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

const Collection = require('./Collection');

class Group {
	constructor(client, id, name, commands = null) {
		/**
		 * The client instance
		 * @name Group#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The group id
		 * @type {string}
		 */
		this.id = id;

		/**
		 * The group name
		 * @type {string}
		 */
		this.name = name || id;

		/**
		 * The groups commands
		 * @type {Collection<string, Command>}
		 */
		this.commands = new Collection();
		if (commands) for (const command of commands) this.commands.set(command.name, command);
	}
}

module.exports = Group;
