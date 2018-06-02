const Command = require('../../structures/Command');
const idToBinary = require('../../util/idToBinary');

class Leave extends Command {
	constructor(client) {
		super(client, {
			name: 'leave',
			description: 'Leave the music channel.',
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
		const shard = parseInt(idToBinary(message.guild_id).slice(0, -22), 2) % this.client.shards;

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
				content: 'I am not even in a voice channel, what do you think you are doing?'
			});
		}

		await this.client.publisher.publish('discord:VOICE_STATE_UPDATE', {
			shard,
			op: 4,
			d: {
				guild_id: message.guild_id,
				channel_id: null,
				self_mute: false,
				self_deaf: false
			}
		}, { expiration: '60000' });

		return this.client.rest.channels[message.channel_id].messages.post({
			content: 'Sure thing, bye!'
		});
	}
}

module.exports = Leave;
