const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const HOST = process.env.HOST;
const API_BASE_URL_USER = `${HOST}/users`;
const API_BASE_URL_CHALLENGE = `${HOST}/challenge`;

const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit-challenge')
    .setDescription('Donner la réponse à un challenge avec son id')
    .addStringOption((option) =>
      option
        .setName('réponse')
        .setDescription('Réponse à soumettre')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option.setName('id').setDescription('Id du challenge').setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.member.id;
    const response = interaction.options.getString('réponse');
    const challenge_id = interaction.options.getInteger('id');
    const cooldownKey = `${userId}-${challenge_id}`;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const now = Date.now();
    if (cooldowns.has(cooldownKey)) {
      const expiration = cooldowns.get(cooldownKey);
      if (now < expiration) {
        const remaining = Math.ceil((expiration - now) / 1000);
        return interaction.editReply({
          content: `Tu dois attendre ${remaining} secondes avant de réessayer.`,
        });
      }
    }
    try {
      const memberData = await getUser(userId);
      if (!memberData) {
        return interaction.editReply({
          content: 'Impossible de récupérer les données de l’utilisateur.',
        });
      }

      await ensureUserExists(userId);

      const challengeAnswer = await getChallengeAnswer(challenge_id);
      if (!challengeAnswer || !challengeAnswer[0]) {
        return interaction.editReply({
          content: 'Challenge introuvable.',
        });
      }

      const correctAnswer = challengeAnswer[0].answer;

      if (
        response.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
      ) {
        await submitChallenge(userId, challenge_id);
        return interaction.editReply({
          content: `Bravo, bonne réponse ! Le challenge a été validé.`,
        });
      } else {
        cooldowns.set(cooldownKey, now + 2 * 60 * 1000);
        return interaction.editReply({
          content: `Mauvaise réponse. Réessaye dans 2 minutes.`,
        });
      }
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content: 'Une erreur est survenue.',
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

async function getChallengeAnswer(challenge_id) {
  const res = await fetch(`${API_BASE_URL_CHALLENGE}/${challenge_id}`);
  if (!res.ok) return null;
  return res.json();
}

async function submitChallenge(discord_id, challenge_id) {
  const nowChall = Date.now();
  const res = await fetch(`${API_BASE_URL_CHALLENGE}/Completed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      discord_id,
      challenge_id,
      date_completed: nowChall,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(
      `Erreur lors de la validation du challenge : ${res.status} - ${text}`
    );
    throw new Error('Erreur lors de la soumission du challenge');
  }
}
