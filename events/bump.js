const DISBOARD = process.env.DisboardId;
const CHANNEL_ID = process.env.channelId;
const TWO_HOURS = 2 * 60 * 60 * 1000;

module.exports = (client) => {
  console.log('Fonctionnalité du bump visible !');
  setInterval(
    async () => {
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 100 });
        const lastMessageFromDisboard = messages.find(
          (m) => m.author.id === DISBOARD
        );
        const now = Date.now();

        if (now - lastMessageFromDisboard.createdTimestamp > TWO_HOURS) {
          await channel.send(
            `<@&1272223052176031806>, un petit bump ça vous dit ? Merci pour l'aide précieuse que vous apportez au serveur !`
          );
          console.log('Message de bump envoyé !');
        }
      } catch (error) {
        console.error('Erreur dans le check du message Disboard:', error);
      }
    },
    30 * 60 * 1000
  );
};
