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

const ArgumentType = require('../structures/ArgumentType');

class StringArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'string');
	}

	validate(val, msg, arg) {
		if (arg.oneOf && !arg.oneOf.includes(val.toLowerCase())) return false;
		if (arg.min !== null && typeof arg.min !== 'undefined' && val.length < arg.min) {
			return `Please keep the ${arg.label} above or exactly ${arg.min} characters.`;
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && val.length > arg.max) {
			return `Please keep the ${arg.label} below or exactly ${arg.max} characters.`;
		}

		return true;
	}

	parse(val) {
		return val;
	}
}

module.exports = StringArgumentType;
