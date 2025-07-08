const DISBOARD = process.env.DISBOARD_ID;
const CHANNEL_ID = process.env.BUMP_CHANNEL_ID;
const TWO_HOURS = 2 * 60 * 60 * 1000;
const BARTENDER = process.env.BARTENDER_ID;

module.exports = (client) => {
  console.log('Fonctionnalité du bump visible !');
  setInterval(
    async () => {
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 100 });

        const messagesBartender = await channel.messages.fetch({ limit: 1 });
        const lastMessage = messagesBartender.first();

        const lastMessageFromDisboard = messages.find(
          (m) => m.author.id === DISBOARD
        );

        const now = Date.now();

        if (lastMessage.author.id === BARTENDER) return;

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
    10 * 60 * 1000
  );
};
