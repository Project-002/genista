const Command = require('../../structures/Command');

class Skip extends Command {
	constructor(client) {
		super(client, {
			name: 'skip',
			description: 'Skip the song.',
			group: 'music',
			format: '<volume>',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	async run(message) {
		const userVoiceChannel = await this.client.cache.guilds[message.guild_id].voice_states.get(message.author.id);
		const selfVoiceChannel = await this.client.cache.guilds[message.guild_id].voice_states.get(this.client.id);

		if (!userVoiceChannel || !userVoiceChannel.channel_id) {
			return this.client.rest.channels[message.channel_id].messages.post({
				content: 'I know, I know, you are eager to do that but make sure you are in a voice channel first.'
			});
		}

		if (userVoiceChannel && userVoiceChannel.channel_id) {
			if (selfVoiceChannel && selfVoiceChannel.channel_id) {
				if (userVoiceChannel.channel_id !== selfVoiceChannel.channel_id) {
					return this.client.rest.channels[message.channel_id].messages.post({
						content: 'Look, don\'t be that guy alright?'
					});
				}
			}
		}

		const np = await this.client.cache.redis.hgetall(`playlists.${message.guild_id}.np`);
		if (!Object.keys(np).length || !np) {
			return this.client.rest.channels[message.channel_id].messages.post({
				content: 'There\'s nothing for me to skip, dumbo.'
			});
		}

		await this.client.publisher.publish('lavalink:SKIP', { guild: message.guild_id }, { expiration: '60000' });

		return this.client.rest.channels[message.channel_id].messages.post({
			content: 'I agree, that song was terrible.'
		});
	}
}

module.exports = Skip;
