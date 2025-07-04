const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const TWO_HOURS = 2 * 60 * 60 * 1000;

const gifs = [
  'alley-oop-luka-doncic.gif',
  'cool-fun.gif',
  'shreks-meme.gif',
  'sneaky-sneaking.gif',
  'victory-done.gif',
];

// Map of annoyed user
const LastAnnoyed = new Map();

// Map of users that use the annoy command
const LastAnnoy = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annoy')
    .setDescription("Ping un utilisateur avec un gif pour l'embêter")
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('Utilisateur à embêter')
        .setRequired(true)
    ),

  async execute(interaction) {
    const now = Date.now();

    if (!CheckIfUserCanAnnoy(now, interaction)) return;

    const user = interaction.options.getUser('utilisateur');

    if (!user) {
      return interaction.reply({
        content: 'Utilisateur invalide.',
        ephemeral: true,
      });
    }

    if (!CheckIfUserCanBeAnnoy(now, interaction, user)) return;

    LastAnnoyed.set(user.id, now);
    LastAnnoy.set(interaction.user.id, now);

    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    const gifPath = path.join(__dirname, '../..', 'assets', randomGif);
    const shouldDelete = Math.floor(Math.random() * 5) !== 0;

    const sentMessage = await interaction.channel.send({
      content: `<@${interaction.user.id}> a annoy <@${user.id}>`,
    });

    if (shouldDelete) {
      sentMessage.delete().catch(() => {});
    }

    await interaction.reply({
      files: [gifPath],
      ephemeral: true,
    });
  },
};

function CheckIfUserCanAnnoy(DateNow, interaction) {
  const lastAnnoyRequest = LastAnnoy.get(interaction.user.id);
  const member = interaction.member;
  if (lastAnnoyRequest && lastAnnoyRequest > DateNow - TWO_HOURS) {
    interaction.reply({
      content: 'Tu as déjà annoy durant les 2 dernières heures',
      ephemeral: true,
    });
    if (member && member.timeout) {
      member.timeout(60_000).catch(console.error);
    }
    return false;
  }
  return true;
}

function CheckIfUserCanBeAnnoy(DateNow, interaction, user) {
  const lastPing = LastAnnoyed.get(user.id);

  if (lastPing && lastPing > DateNow - TWO_HOURS) {
    interaction.reply({
      content: 'Utilisateur déjà annoy',
      ephemeral: true,
    });
    return false;
  }
  return true;
}
