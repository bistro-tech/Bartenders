const axios = require('axios');

module.exports = (client) => {
  const TWITCH_CLIENT_ID = process.env.TWITCH_ID;
  const TWITCH_CLIENT_SECRET = process.env.TWITCH_TOKEN;
  const TWITCH_STREAMER_NAME = 'Lxckyluck';
  const NOTIFICATION_CHANNEL_ID = process.env.TWITCH_CHANNEL_ID;

  let wasLive = false;
  let twitchAccessToken = null;
  let tokenExpiresAt = 0;

  async function refreshTwitchAccessToken() {
    const response = await axios.post(
      'https://id.twitch.tv/oauth2/token',
      null,
      {
        params: {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          grant_type: 'client_credentials',
        },
      }
    );

    twitchAccessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;
    console.log(
      'Nouveau token Twitch récupéré, expiration dans',
      response.data.expires_in,
      'secondes'
    );
  }

  async function get_valid_twitch_token() {
    if (!twitchAccessToken || Date.now() >= tokenExpiresAt) {
      await refreshTwitchAccessToken();
    }
    return twitchAccessToken;
  }

  async function is_streamer_live(username, client_id, accessToken) {
    const response = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': client_id,
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        user_login: username,
      },
    });
    return response.data.data.length > 0 ? response.data.data[0] : null;
  }

  async function getStreamerProfile(username, client_id, accessToken) {
    const response = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': client_id,
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        login: username,
      },
    });
    return response.data.data.length > 0 ? response.data.data[0] : null;
  }

  client.once('ready', () => {
    console.log('Twitch monitoring actif...');

    setInterval(
      async () => {
        try {
          const token = await get_valid_twitch_token();
          const stream = await is_streamer_live(
            TWITCH_STREAMER_NAME,
            TWITCH_CLIENT_ID,
            token
          );
          const profile = await getStreamerProfile(
            TWITCH_STREAMER_NAME,
            TWITCH_CLIENT_ID,
            token
          );
          const channel = await client.channels.fetch(NOTIFICATION_CHANNEL_ID);

          if (stream && !wasLive) {
            wasLive = true;

            const embed = {
              color: 0x9146ff,
              title: `${profile.display_name} est en live !`,
              url: `https://www.twitch.tv/${TWITCH_STREAMER_NAME}`,
              author: {
                name: profile.display_name,
                icon_url: profile.profile_image_url,
              },
              thumbnail: {
                url: profile.profile_image_url,
              },
              fields: [
                {
                  name: '🏷️ Catégorie',
                  value: stream.game_name || 'Inconnu',
                  inline: true,
                },
                {
                  name: '👥 Viewers',
                  value: stream.viewer_count.toString(),
                  inline: true,
                },
                { name: '📌 Titre', value: stream.title || 'Aucun titre' },
              ],
              timestamp: new Date(),
              footer: {
                text: 'Notification automatique Twitch',
              },
            };
            await channel.send({
              content: `<@&1283415299504341104>`,
              embeds: [embed],
            });
          } else if (!stream && wasLive) {
            wasLive = false;
          }
        } catch (err) {
          console.error('Erreur Twitch :', err.message);
        }
      },
      5 * 60 * 1000
    );
  });
};
