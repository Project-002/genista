const Command = require('../../structures/Command');
const paginate = require('../../util/paginate');
const axios = require('axios');
const { stripIndents } = require('common-tags');

const music = axios.create({
	baseURL: process.env.LAVALINK_REST,
	headers: { common: { Authorization: process.env.LAVALINK_PASSWORD } }
});

class Queue extends Command {
	constructor(client) {
		super(client, {
			name: 'queue',
			description: 'Check queued up music.',
			group: 'music',
			format: '<page>',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	async run(message, args) {
		switch (args.split(' ')[0]) {
			case 'remove': {
				args = args.split(' ');
				if (!args[1] || isNaN(args[1])) return;
				const tracks = await this.client.cache.redis.lrange(`playlists.${message.guild_id}`, 0, -1);
				args[1] = args[1] >= 1 ? parseInt(args[1], 10) - 1 : tracks.length - (~parseInt(args[1], 10) + 1);
				let data;
				try {
					data = (await music.post('/decodetracks', [tracks[args[1]]])).data;
				} catch (error) {
					return this.client.rest.channels[message.channel_id].messages.post({
						content: 'You know as much as I do that this isn\'t a valid index.'
					});
				}

				await this.client.cache.redis.lrem(`playlists.${message.guild_id}`, 1, tracks[args[1]]);

				return this.client.rest.channels[message.channel_id].messages.post({
					content: `**Successfully removed:** \`${data[0].info.title}\``
				});
			}
			default: {
				if (args) args = isNaN(args) ? 1 : parseInt(args, 10);
				else args = 1;
				const np = await this.client.cache.redis.hgetall(`playlists.${message.guild_id}.np`);
				let tracks = await this.client.cache.redis.lrange(`playlists.${message.guild_id}`, 0, -1);
				if (Object.keys(np).length) tracks = [np.track, ...tracks];

				if ((!np && !tracks) || (!np.length && !tracks.length)) {
					return this.client.rest.channels[message.channel_id].messages.post({
						content: 'Can\'t show you what I don\'t have.'
					});
				}

				const { data } = await music.post('/decodetracks', tracks);

				const totalLength = data.reduce((prev, song) => prev + song.info.length, 0);
				const paginated = paginate(data.slice(1), args);
				let index = 10 * (paginated.page - 1);

				return this.client.rest.channels[message.channel_id].messages.post({
					embed: {
						author: {
							name: `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
							icon_url: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp`
						},
						description: stripIndents`
							**Song queue${paginated.page > 1 ? `, page ${paginated.page}` : ''}**
		
							${paginated.items.length ? paginated.items.map(song => `**${++index}.** [${song.info.title}](${song.info.uri}) (${this.timeString(song.info.length)})`).join('\n') : 'No more songs in queue.'}
		
							**Now playing:** [${data[0].info.title}](${data[0].info.uri}) (${this.timeString(data[0].info.length)})
		
							**Total queue time:** ${this.timeString(totalLength)}
						`,
						footer: paginated.maxPage > 1 ? { text: 'Use darling queue <page> to view a specific page.' } : undefined
					}
				});
			}
		}
	}

	timeString(seconds, forceHours = false, ms = true) {
		if (ms) seconds /= 1000;
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}
}

module.exports = Queue;
