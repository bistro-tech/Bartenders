const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const HOST = process.env.HOST;
const API_BASE_URL_CHALLENGE = `${HOST}/challenge`;
const API_BASE_URL_USER = `${HOST}/users`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-challenge')
    .setDescription(
      "Renvoie le contexte et l'input d'un challenge à l'aide de son id"
    )
    .addIntegerOption((option) =>
      option.setName('id').setDescription('Id du challenge').setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    const challengeId = interaction.options.getInteger('id');

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      await ensureUserExists(member.id);

      const memberData = await getUser(member.id);
      if (!memberData) {
        return interaction.editReply({
          content: 'Impossible de récupérer les données utilisateur.',
        });
      }

      await getChallenge(interaction, challengeId);
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

async function getChallenge(interaction, challengeId) {
  const res = await fetch(`${API_BASE_URL_CHALLENGE}/content/${challengeId}`);
  if (!res.ok) {
    return interaction.editReply({
      content: `Aucun challenge trouvé avec l'ID ${challengeId}.`,
    });
  }

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return interaction.editReply({
      content: `⚠️ Aucun contenu trouvé pour le challenge ${challengeId}.`,
    });
  }

  const { contexte, input } = data[0];

  return interaction.editReply({
    content:
      `📌 **Contexte du challenge \`${challengeId}\` :**\n\n` +
      `${contexte}\n\n` +
      `**Lien vers l'input :**\n` +
      `🔗 ${input}`,
  });
}
