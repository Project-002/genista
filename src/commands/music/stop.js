const Command = require('../../structures/Command');

class Stop extends Command {
	constructor(client) {
		super(client, {
			name: 'stop',
			description: 'Stop the music.',
			group: 'music',
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

		if (!selfVoiceChannel || !selfVoiceChannel.channel_id) {
			return this.client.rest.channels[message.channel_id].messages.post({
				content: 'There\'s nothing for me to stop, baka.'
			});
		}

		await this.client.publisher.publish('lavalink:STOP', { guild: message.guild_id }, { expiration: '60000' });

		return this.client.rest.channels[message.channel_id].messages.post({
			content: `Roger that, if anyone wants to complain: **${message.author.username}#${message.author.discriminator}**.`
		});
	}
}

module.exports = Stop;
