const { SlashCommandBuilder, MessageFlags, Message } = require('discord.js');
const path = require('node:path');
const TWO_HOURS = 2 * 60 * 60 * 1000;

const successgifs = [
  'alley-oop-luka-doncic.gif',
  'cool-fun.gif',
  'shreks-meme.gif',
  'sneaky-sneaking.gif',
  'victory-done.gif',
];

const failgifs = [
  'bart.gif',
  'falling-falling-down-stairs.gif',
  'mission-failed-mario.gif',
  'mission-failed.gif',
  'shocked-surprised.gif',
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

    // if (!CheckIfUserCanAnnoy(now, interaction)) return;

    const user = interaction.options.getUser('utilisateur');

    if (!user) {
      return interaction.reply({
        content: 'Utilisateur invalide.',
        ephemeral: true,
      });
    }

    // if (!CheckIfUserCanBeAnnoy(now, interaction, user)) return;

    LastAnnoyed.set(user.id, now);
    LastAnnoy.set(interaction.user.id, now);

    const randomSuccessGif =
      successgifs[Math.floor(Math.random() * successgifs.length)];
    const randomFailGif = failgifs[Math.floor(Math.random() * failgifs.length)];
    const gifPathSuccess = path.join(
      __dirname,
      '../..',
      'assets/success',
      randomSuccessGif
    );
    const gifPathFail = path.join(
      __dirname,
      '../..',
      'assets/fail',
      randomFailGif
    );
    const shouldDelete = Math.floor(Math.random() * 5) !== 0;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (shouldDelete) {
      const DeletedMessage = await interaction.channel.send({
        content: `<@${user.id}>`,
      });
      DeletedMessage.delete().catch(() => {});
      await interaction.followUp({
        files: [gifPathSuccess],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const SentMessage = await interaction.channel.send({
        content: `Hey <@${user.id}>, c'est <@${interaction.user.id}> qui a voulu t'embêter !`,
      });
      await interaction.followUp({
        files: [gifPathFail],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function CheckIfUserCanAnnoy(DateNow, interaction) {
  const lastAnnoyRequest = LastAnnoy.get(interaction.user.id);
  const member = interaction.member;
  if (lastAnnoyRequest && lastAnnoyRequest > DateNow - TWO_HOURS) {
    const timeLeft = TWO_HOURS - (DateNow - lastAnnoyRequest);
    const formatted = formatTime(timeLeft);
    interaction.reply({
      content: `Tu as déjà annoy durant les 2 dernières heures, il te reste ${formatted} avant de pouvoir à nouveau embêter quelqu'un !`,
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

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}
