const Command = require('../../structures/Command');
const idToBinary = require('../../util/idToBinary');
const axios = require('axios');

const music = axios.create({
	baseURL: process.env.LAVALINK_REST,
	headers: { common: { Authorization: process.env.LAVALINK_PASSWORD } }
});

class Play extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			description: 'Join & Play music.',
			group: 'music',
			format: '<url>',
			throttling: {
				usages: 2,
				duration: 3
			}
		});
	}

	async run(message, args) {
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
			await this.client.publisher.publish('discord:VOICE_STATE_UPDATE', {
				shard,
				op: 4,
				d: {
					guild_id: message.guild_id,
					channel_id: userVoiceChannel.channel_id,
					self_mute: false,
					self_deaf: false
				}
			}, { expiration: '60000' });
		}
		args = args.split(' ').filter(v => v);
		args.forEach((e, i, a) => a[i] = e.replace(/<(.+)>/g, '$1'));
		console.log(args);

		let data;
		try {
			try {
				data = (await music.get(`/loadtracks?identifier=${args[0]}`)).data;
				if (data.loadType === 'NO_MATCHES') throw new Error();
			} catch (error) {
				data = (await music.get(`/loadtracks?identifier=ytsearch:${args.join(' ')}`)).data;
			}
		} catch (error) {
			return this.client.rest.channels[message.channel_id].messages.post({
				content: 'Whatever you did, it did not work.'
			});
		}

		if (data.loadType === 'NO_MATCHES') {
			return this.client.rest.channels[message.channel_id].messages.post({
				content: 'I know you hate to hear that, but even searching the universe I couldn\'t find what you were looking for.'
			});
		}

		await this.client.publisher.publish('lavalink:PLAY', {
			guild: message.guild_id,
			tracks: data.tracks
		}, { expiration: '60000' });

		return this.client.rest.channels[message.channel_id].messages.post({
			content: `**Queued up:** \`${data.tracks[0].info.title}\``
		});
	}
}

module.exports = Play;
