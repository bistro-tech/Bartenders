const axios = require('axios');

module.exports = (client) => {
	const twitchClientId = process.env.TwitchId;
	const twitchClientSecret = process.env.TwitchToken;
	const twitchStreamerName = 'Lxckyluck';
	const notificationChannelId = process.env.TwitchChannelId;

	let wasLive = false;
	let twitchAccessToken = null;
	let tokenExpiresAt = 0;

	async function refreshTwitchAccessToken() {
		const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
			params: {
				client_id: twitchClientId,
				client_secret: twitchClientSecret,
				grant_type: 'client_credentials',
			},
		});

		twitchAccessToken = response.data.access_token;
		tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
		console.log('Nouveau token Twitch récupéré, expiration dans', response.data.expires_in, 'secondes');
	}

	async function getValidTwitchToken() {
		if (!twitchAccessToken || Date.now() >= tokenExpiresAt) {
			await refreshTwitchAccessToken();
		}
		return twitchAccessToken;
	}

	async function isStreamerLive(username, clientId, accessToken) {
		const response = await axios.get('https://api.twitch.tv/helix/streams', {
			headers: {
				'Client-ID': clientId,
				'Authorization': `Bearer ${accessToken}`,
			},
			params: {
				user_login: username,
			},
		});
		return response.data.data.length > 0 ? response.data.data[0] : null;
	}

	async function getStreamerProfile(username, clientId, accessToken) {
		const response = await axios.get('https://api.twitch.tv/helix/users', {
			headers: {
				'Client-ID': clientId,
				'Authorization': `Bearer ${accessToken}`,
			},
			params: {
				login: username,
			},
		});
		return response.data.data.length > 0 ? response.data.data[0] : null;
	}

	client.once('ready', () => {
		console.log('Twitch monitoring actif...');

		setInterval(async () => {
			try {
				const token = await getValidTwitchToken();
				const stream = await isStreamerLive(twitchStreamerName, twitchClientId, token);
				const profile = await getStreamerProfile(twitchStreamerName, twitchClientId, token);
				const channel = await client.channels.fetch(notificationChannelId);

				if (stream && !wasLive) {
					wasLive = true;

					const embed = {
						color: 0x9146FF,
						title: `${profile.display_name} est en live !`,
						url: `https://www.twitch.tv/${twitchStreamerName}`,
						author: {
							name: profile.display_name,
							icon_url: profile.profile_image_url,
						},
						thumbnail: {
							url: profile.profile_image_url,
						},
						fields: [
							{ name: '🏷️ Catégorie', value: stream.game_name || 'Inconnu', inline: true },
							{ name: '👥 Viewers', value: stream.viewer_count.toString(), inline: true },
							{ name: '📌 Titre', value: stream.title || 'Aucun titre' },
						],
						timestamp: new Date(),
						footer: {
							text: 'Notification automatique Twitch',
						},
					};

					// eslint-disable-next-line quotes
					await channel.send({ content: `<@&1283415299504341104>`, embeds: [embed] });
				}
				else if (!stream && wasLive) {
					wasLive = false;
				}
			}
			catch (err) {
				console.error('Erreur Twitch :', err.message);
			}
		}, 5 * 60 * 1000);
	});
};
