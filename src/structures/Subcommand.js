const Command = require('./Command');

/**
 * A subcommand that can be ran.
 * @extends {Command}
 */
class SubCommand extends Command {
	/**
	 * Options that are passed when creating a new subcommand
	 * @typedef {object} SubCommandOptions
	 * @prop {string} [name] The subcommand name
	 * @prop {Array<string>} [aliases=[]] The subcommand aliases
	 * @prop {string} [description] The subcommand description
	 * @prop {string} [parent] The subcommand parent
	 */

	/**
	 * Creates an instance of SubCommand.
	 * @param {Strelitzia} client The client
	 * @param {SubCommandOptions} [options={}] The subcommand options
	 * @memberof SubCommand
	 */
	constructor(client, options = {}) {
		super(client, { ...options, subCommands: null });

		/**
		 * Determines if the command is a subcommand or not
		 * @type {boolean}
		 * @default true
		 */
		this.subCommand = true;

		/**
		 * The subcommand's parent
		 * @type {string}
		 */
		this.parent = options.parent;
	}

	/**
	 * Runs the subcommand.
	 * @param {Object} message The raw message data
	 * @param {string} args The parsed arguments
	 * @abstract
	 * @memberof SubCommand
	 */
	async run(message, args) {} // eslint-disable-line no-unused-vars
}

module.exports = SubCommand;
