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

class BooleanArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'boolean');
		this.truthy = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
		this.falsy = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);
	}

	validate(val) {
		const lc = val.toLowerCase();
		return this.truthy.has(lc) || this.falsy.has(lc);
	}

	parse(val) {
		const lc = val.toLowerCase();
		if (this.truthy.has(lc)) return true;
		if (this.falsy.has(lc)) return false;
		throw new RangeError('Unknown boolean value.');
	}
}

module.exports = BooleanArgumentType;
