const Event = require('../structures/Event');

class END extends Event {
	constructor(...args) {
		super(...args, { name: 'lavalink:END', enabled: true });
	}

	async run(message, { ack }) {
		await this.client.redis.lpop(`tracklist:${message.guildId}`);
		const song = await this.client.redis.lindex(`tracklist:${message.guildId}`, 0);
		if (song) {
			const data = JSON.parse(song);
			await this.client.publisher.publish('lavalink:PLAY', {
				guild: message.guildId,
				track: data.track
			}, { expiration: '60000' });
		}
		ack();
	}
}

module.exports = END;
