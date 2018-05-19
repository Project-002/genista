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

const { readdirSync, statSync } = require('fs');
const { extname, join } = require('path');
const Collection = require('./Collection');
const Group = require('./Group');

/**
 * The registry of a {@link Genista} instance.
 */
class Registry {
	/**
	 * Creates an instance of Registry.
	 * @param {Genista} client The client
	 * @memberof Registry
	 */
	constructor(client) {
		/**
		 * The client instance
		 * @name Registry#client
		 * @type {Genista}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * Cached event instances
		 * @type {Collection<string, Event>}
		 */
		this.events = new Collection();

		/**
		 * Cached group instances
		 * @type {Collection<string, Group>}
		 */
		this.groups = new Collection();

		/**
		 * Cached command instances
		 * @type {Collection<string, Command>}
		 */
		this.commands = new Collection();

		/**
		 * Cached type instances
		 * @type {Collection<string, Type>}
		 */
		this.types = new Collection();
	}

	/**
	 * Registers an event.
	 * @param {string} event The event
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEvent(event) {
		if (typeof event === 'function') event = new event(this.client);

		this.events.set(event.name, event);

		if (event.enabled && !event.clientOnly) this.client.consumer.on(event.name, event._run.bind(event));
		if (event.enabled && event.clientOnly) this.client.on(event.name, event._run.bind(event));
	}

	/**
	 * Registers multiple events.
	 * @param {Array<string>} events The event
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEvents(events) {
		if (!Array.isArray(events)) return;
		for (const event of events) {
			this.registerEvent(event);
		}
	}

	/**
	 * Registers event files from the specified path.
	 * @param {string} path The path of the event files
	 * @returns {void}
	 * @memberof Registry
	 */
	registerEventsIn(path) {
		const files = readdirSync(path);
		const events = [];
		for (let event of files) {
			if (extname(event) !== '.js') continue;
			event = require(join(path, event));
			events.push(event);
		}

		return this.registerEvents(events);
	}

	/**
	 * Registers a group.
	 * @param {string|Array<string>} group The group
	 * @param {string} name The name
	 * @returns {void}
	 * @memberof Registry
	 */
	registerGroup(group, name) {
		if (typeof group === 'string') {
			group = new Group(this.client, group, name);
		} else if (typeof group === 'function') {
			group = new group(this.client);
		} else if (typeof group === 'object' && !(group instanceof Group)) {
			group = new Group(this.client, group.id, group.name);
		}

		const existing = this.groups.get(group.id);
		if (existing) {
			existing.name = group.name;
		} else {
			this.groups.set(group.id, group);
		}
	}

	/**
	 * Registers multiple groups.
	 * @param {Array<Array<string>>} groups The groups
	 * @returns {void}
	 * @memberof Registry
	 */
	registerGroups(groups) {
		if (!Array.isArray(groups)) return;
		for (const group of groups) {
			if (Array.isArray(group)) this.registerGroup(...group);
			else this.registerGroup(group);
		}
	}

	/**
	 * Registers a command.
	 * @param {string} command The command
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommand(command) {
		if (typeof command === 'function') command = new command(this.client);
		const group = this.groups.find(grp => grp.id === command.groupId);
		command.group = group;
		group.commands.set(command.name, command);
		if (command.subCommand) {
			const parent = this.commands.get(command.parent);
			if (!parent) return;
			parent.subCommands.push(command);
		} else {
			this.commands.set(command.name, command);
		}
	}

	/**
	 * Registers multiple commands.
	 * @param {Array<string>} commands The commands
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommands(commands) {
		if (!Array.isArray(commands)) return;
		for (const command of commands) {
			this.registerCommand(command);
		}
	}

	/**
	 * Register command files from the specified path
	 * @param {string} path The path of the command files
	 * @returns {void}
	 * @memberof Registry
	 */
	registerCommandsIn(path) {
		const files = readdirSync(path);
		const commands = [];
		for (let command of files) {
			command = join(path, command);
			const stats = statSync(command);
			if (extname(command) === '.js' && !stats.isDirectory()) {
				command = require(command);
				commands.push(command);
			} else if (stats.isDirectory()) {
				this.registerCommandsIn(command);
			}
		}

		return this.registerCommands(commands);
	}

	/**
	 * Registers a type.
	 * @param {string} type The type
	 * @returns {void}
	 * @memberof Registry
	 */
	registerType(type) {
		if (typeof type === 'function') type = new type(this.client);
		this.types.set(type.id, type);
	}

	/**
	 * Registers multiple types.
	 * @param {Array<string>} types The types
	 * @returns {void}
	 * @memberof Registry
	 */
	registerTypes(types) {
		if (!Array.isArray(types)) return;
		for (const type of types) {
			this.registerType(type);
		}
	}

	/**
	 * Register type files from the specified path
	 * @param {string} path The path of the type files
	 * @returns {void}
	 * @memberof Registry
	 */
	registerTypesIn(path) {
		const files = readdirSync(path);
		const types = [];
		for (let type of files) {
			type = join(path, type);
			if (extname(type) !== '.js') continue;
			type = require(type);
			types.push(type);
		}

		return this.registerTypes(types);
	}

	/**
	 * Registers the default argument types to the registry
	 * @return {void}
	 * @memberof Registry
	 */
	registerDefaultTypes() {
		this.registerTypes([
			require('../types/Boolean'),
			require('../types/Float'),
			require('../types/Integer'),
			require('../types/String')
		]);
	}

	/**
	 * Finds a group based on a string.
	 * @param {string} search The term to search for
	 * @returns {Array<Command|null>}
	 * @memberof Registry
	 */
	findGroups(search) {
		if (!search) return this.groups;
		search = search.toLowerCase();
		for (const group of this.groups) {
			if (group.name === search || group.id === search) return [group];
		}

		return [null];
	}

	/**
	 * Finds a command or subcommand based on a string.
	 * @param {string} search The term to search for
	 * @param {string} [subSearch=null] If the function should search for subcommands aswell
	 * @returns {Array<Command|SubCommand|null>}
	 * @memberof Registry
	 */
	findCommands(search, subSearch = null) { // eslint-disable-line consistent-return
		if (!search) return [...this.commands.values()];
		search = search.toLowerCase();
		for (const command of this.commands.values()) {
			if (command.name === search || (command.aliases && command.aliases.some(alias => alias === search))) {
				if (subSearch && command.subCommands.length) {
					for (const cmd of command.subCommands) {
						// eslint-disable-next-line max-depth
						if (cmd.name === subSearch || (cmd.aliases && cmd.aliases.some(alias => alias === subSearch))) {
							return [cmd];
						}
					}
				}
				return [command];
			}
			continue;
		}
		return [null];
	}
}

module.exports = Registry;
