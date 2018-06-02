const Command = require('../../structures/Command');

class Volume extends Command {
	constructor(client) {
		super(client, {
			name: 'volume',
			description: 'Regulate the volume.',
			group: 'music',
			format: '<volume>',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	async run(message, args) {
		const userVoiceChannel = await this.client.cache.guilds[message.guild_id].voice_states.get(message.author.id);
		const selfVoiceChannel = await this.client.cache.guilds[message.guild_id].voice_states.get(this.client.id);
		args = isNaN(args) ? 100 : parseInt(args, 10);

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

		await this.client.publisher.publish('lavalink:VOLUME', {
			guild: message.guild_id,
			volume: args
		}, { expiration: '60000' });

		return this.client.rest.channels[message.channel_id].messages.post({
			content: `Aaaaalrighty, setting volume to ${args}.`
		});
	}
}

module.exports = Volume;
