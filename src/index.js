module.exports = {
	Strelitzia: require('./structures/Client'),
	Client: require('./structures/Client'),

	Event: require('./structures/Event'),
	Command: require('./structures/Command'),
	SubCommand: require('./structures/SubCommand'),

	idToBinary: require('./util/idToBinary'),
	paginate: require('./util/paginate'),
	unindent: require('./util/unindent')
};
