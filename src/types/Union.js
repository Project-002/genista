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

const { ArgumentType } = require('../');

/**
 * A type for command arguments that handles multiple other types
 * @extends {ArgumentType}
 */
class ArgumentUnionType extends ArgumentType {
	constructor(client, id) {
		super(client, id);

		/**
		 * Types to handle, in order of priority
		 * @type {ArgumentType[]}
		 */
		this.types = [];
		const typeIDs = id.split('|');
		for (const typeID of typeIDs) {
			const type = client.registry.types.get(typeID);
			if (!type) throw new Error(`Argument type "${typeID}" is not registered.`);
			this.types.push(type);
		}
	}

	async validate(val, msg, arg) {
		let results = this.types.map(type => (type.isEmpty(val, msg, arg) ? false : type.validate(val, msg, arg)));
		results = await Promise.all(results);
		if (results.some(valid => valid && typeof valid !== 'string')) return true;
		const errors = results.filter(valid => typeof valid === 'string');
		if (errors.length > 0) return errors.join('\n');
		return false;
	}

	async parse(val, msg, arg) {
		let results = this.types.map(type => (type.isEmpty(val, msg, arg) ? false : type.validate(val, msg, arg)));
		results = await Promise.all(results);
		for (let i = 0; i < results.length; i++) {
			if (results[i] && typeof results[i] !== 'string') return this.types[i].parse(val, msg, arg);
		}
		throw new Error(`Couldn't parse value "${val}" with union type ${this.id}.`);
	}

	isEmpty(val, msg, arg) {
		return !this.types.some(type => !type.isEmpty(val, msg, arg));
	}
}

module.exports = ArgumentUnionType;
