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

class FloatArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'float');
	}

	validate(val, msg, arg) {
		const float = Number.parseFloat(val);
		if (Number.isNaN(float)) return false;
		if (arg.oneOf && !arg.oneOf.includes(float)) return false;
		if (arg.min !== null && typeof arg.min !== 'undefined' && float < arg.min) {
			return `Please enter a number above or exactly ${arg.min}.`;
		}
		if (arg.max !== null && typeof arg.max !== 'undefined' && float > arg.max) {
			return `Please enter a number below or exactly ${arg.max}.`;
		}

		return true;
	}

	parse(val) {
		return Number.parseFloat(val);
	}
}

module.exports = FloatArgumentType;
