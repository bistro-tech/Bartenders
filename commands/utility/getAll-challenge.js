const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const HOST = process.env.HOST;
const API_BASE_URL_CHALLENGE = `${HOST}/challenge`;
const API_BASE_URL_USER = `${HOST}/users`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getall-challenge')
    .setDescription('Obtiens la liste des challenges non résolu'),
  async execute(interaction) {
    const member = interaction.member;
    const memberData = await getUser(member.id);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      await ensureUserExists(member.id);

      if (!memberData) {
        return interaction.editReply({
          content: 'Impossible de récupérer les données des utilisateurs.',
        });
      }

      await getChallenge(interaction, member.id);
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'Une erreur est survenue lors de la commande.',
      });
    }
  },
};

async function getUser(discordId) {
  const res = await fetch(`${API_BASE_URL_USER}/${discordId}`);
  if (!res.ok) return null;
  return res.json();
}

async function ensureUserExists(discordId) {
  let user = await getUser(discordId);

  if (!user) {
    const createRes = await fetch(`${API_BASE_URL_USER}/CreateUser`, {
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

async function getChallenge(interaction, discord_id) {
  const res = await fetch(`${API_BASE_URL_CHALLENGE}/available/${discord_id}`);
  if (!res.ok) {
    return interaction.editReply({
      content: `Bravo, tu as terminé tous les challenges ! D'autres arrivent très bientôt, reste à l'affût. 🎉`,
    });
  }

  const data = await res.json();

  const formatted = data
    .map((challenge, index) => {
      return (
        `**${index + 1}. ${challenge.challenge_name}**\n` +
        `> ID : ${challenge.challenge_id}\n` +
        `> 💠 Difficulté : ${challenge.difficulty}\n` +
        `> 🧠 Catégorie : ${challenge.category}\n` +
        `> 🏅 Points : ${challenge.point_obtainable}`
      );
    })
    .join('\n\n');

  return interaction.editReply({
    content: `📋 **Liste des challenges disponibles :**\n\n${formatted}`,
  });
}
