const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const path = require('node:path');
require('dotenv').config();
const HOST = process.env.HOST;
const TWO_HOURS = 2 * 60 * 60 * 1000;
const API_BASE_URL = `${HOST}/users`;

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
    const annoyer = interaction.user;
    const annoyed = interaction.options.getUser('utilisateur');

    if (!annoyer || !annoyed) {
      return interaction.reply({
        content: 'Utilisateur invalide.',
        ephemeral: true,
      });
    }

    await ensureUserExists(annoyed.id);

    const [annoyerData, annoyedData] = await Promise.all([
      getUser(annoyer.id),
      getUser(annoyed.id),
    ]);

    if (!canAnnoy(now, annoyerData.last_annoy, interaction)) return;
    if (!canBeAnnoyed(now, annoyedData.last_annoyed, interaction)) return;

    await Promise.all([
      updateUserLastAnnoy(annoyer.id, now),
      updateUserLastAnnoyed(annoyed.id, now),
    ]);

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
        content: `<@${annoyed.id}>`,
      });
      DeletedMessage.delete().catch(() => {});
      await interaction.followUp({
        files: [gifPathSuccess],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.channel.send({
        content: `Hey <@${annoyed.id}>, c'est <@${annoyer.id}> qui a voulu t'embêter !`,
      });
      await interaction.followUp({
        files: [gifPathFail],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

async function getUser(discordId) {
  const res = await fetch(`${API_BASE_URL}/${discordId}`);
  if (!res.ok) return null;
  return res.json();
}

async function ensureUserExists(discordId) {
  let user = await getUser(discordId);

  if (!user) {
    const createRes = await fetch(`${API_BASE_URL}/CreateUser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discord_id: discordId }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error(
        `Erreur lors de la création de l'utilisateur ${discordId} : ${createRes.status} - ${errorText}`
      );
      throw new Error(`Échec de la création de l'utilisateur ${discordId}`);
    }

    user = await createRes.json();
  }

  return user;
}

async function updateUserLastAnnoy(discordId, timestamp) {
  await fetch(`${API_BASE_URL}/LastAnnoy/${discordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ last_annoy: timestamp }),
  });
}

async function updateUserLastAnnoyed(discordId, timestamp) {
  await fetch(`${API_BASE_URL}/LastAnnoyed/${discordId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ last_annoyed: timestamp }),
  });
}

function canAnnoy(now, lastAnnoyTimestamp, interaction) {
  if (lastAnnoyTimestamp && now - lastAnnoyTimestamp < TWO_HOURS) {
    const timeLeft = TWO_HOURS - (now - lastAnnoyTimestamp);
    const formatted = formatTime(timeLeft);
    interaction.reply({
      content: `Tu as déjà annoy durant les 2 dernières heures, il te reste ${formatted} avant de pouvoir à nouveau embêter quelqu'un !`,
      ephemeral: true,
    });
    const member = interaction.member;
    if (member && member.timeout) {
      member.timeout(60_000).catch(console.error);
    }
    return false;
  }
  return true;
}

function canBeAnnoyed(now, lastAnnoyedTimestamp, interaction) {
  if (lastAnnoyedTimestamp && now - lastAnnoyedTimestamp < TWO_HOURS) {
    interaction.reply({
      content: 'Cet utilisateur a déjà été embêté récemment.',
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
