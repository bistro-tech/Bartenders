const { SlashCommandBuilder } = require('discord.js');

require('dotenv').config();
const Chief = process.env.ROLE_CHIEF;
const BotId = process.env.BARTENDER_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Pour créer un message de giveaway')
    .addStringOption((option) =>
      option
        .setName('récompense')
        .setDescription('Récompense à gagner')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('durée')
        .setDescription('Durée du giveaway en **secondes**')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('Texte supplémentaire à afficher dans le giveaway')
        .setRequired(false)
    ),
  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.some((role) => role.id === Chief)) {
      return interaction.reply({
        content: "Tu n'as pas la permission d'utiliser cette commande.",
        ephemeral: true,
      });
    }

    const reward = interaction.options.getString('récompense');
    const duration = interaction.options.getInteger('durée') * 1000;
    const description = interaction.options.getString('description');

    const endTimestamp = Math.floor((Date.now() + duration) / 1000);
    const giveawayContent = `**GIVEAWAY**\n${description ?? ''}\nRécompense : **${reward}**\nRéagis avec 🎉 pour participer !\nFin dans <t:${endTimestamp}:R>`;

    const giveawayMessage = await interaction.reply({
      content: giveawayContent,
      fetchReply: true,
    });

    await giveawayMessage.react('🎉');

    setTimeout(async () => {
      try {
        const fetchedMsg = await giveawayMessage.fetch();
        const reaction = fetchedMsg.reactions.cache.get('🎉');

        if (!reaction)
          return interaction.followUp('Aucune participation détectée.');

        const users = await reaction.users.fetch();
        const participants = users.filter((u) => !u.bot && u.id !== BotId);

        if (participants.size === 0) {
          return interaction.channel.send('Pas de participants au giveaway.');
        }

        const winner = participants.random();

        interaction.channel.send(
          `Le giveaway est terminé ! Félicitations à <@${winner.id}> qui remporte **${reward}** !`
        );

        giveawayMessage.delete().catch(() => {});
      } catch (err) {
        console.error('Erreur lors du tirage du giveaway :', err);
        interaction.followUp(
          'Une erreur est survenue lors du tirage du giveaway.'
        );
      }
    }, duration);
  },
};
