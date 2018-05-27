require('dotenv').config();
const Genista = require('./structures/Client');
const { join } = require('path');

process.on('unhandledRejection', console.error);

const client = new Genista({
	token: process.env.DISCORD_TOKEN,
	owner: '81440962496172032',
	prefix: 'darling',
	id: '411778853153800202',
	cache: true
});

client.registry.registerEventsIn(join(__dirname, 'events'));

client.on('error', console.error);

client.login(process.env.RABBITMQ, ['discord:MESSAGE_CREATE', 'discord:GUILD_CREATE', 'lavalink:END']);

// Only for debugging purposes
global.genista = client;
