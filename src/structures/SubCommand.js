/**
 * A subcommand that can be ran.
 */
class SubCommand {
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
		/**
		 * The client instance
		 * @name SubCommand#client
		 * @type {Strelitzia}
		 * @readonly
		 */
		Object.defineProperty(this, 'client', { value: client });

		/**
		 * The subcommand's name
		 * @type {string}
		 */
		this.name = options.name;

		/**
		 * The subcommand aliases
		 * @type {Array<string>}
		 * @default []
		 */
		this.aliases = options.aliases || [];

		/**
		 * The subcommand's description
		 * @type {?string}
		 */
		this.description = options.description;

		/**
		 * A useless value added by Crawl to denote that subcommands are subcommands
		 * Use {@link SubCommand#isSubCommand} instead
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
	 * Determines if the command is a subcommand or not.
	 * @returns {boolean}
	 * @memberof SubCommand
	 */
	isSubCommand() {
		return true;
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
