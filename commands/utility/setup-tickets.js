const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Créer le panel de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🎫 Système de Tickets - Bistro Tech')
      .setDescription(
        "Cliquez sur l'un des boutons ci-dessous pour ouvrir un ticket selon votre besoin :\n\n" +
          '💡 **Suggestion** - Proposer des améliorations pour le serveur\n' +
          "🆘 **Support** - Signaler un problème ou demander de l'aide\n" +
          '🤝 **Partenariat** - Demande de partenariat avec Bistro Tech\n' +
          '❓ **Autre** - Tout autre type de demande'
      )
      .setColor(0x2f3136)
      .setThumbnail(interaction.guild.iconURL())
      .setFooter({
        text: 'Un seul ticket par catégorie autorisé • Bistro Tech',
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_suggestion')
        .setLabel('Suggestion')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💡'),
      new ButtonBuilder()
        .setCustomId('ticket_support')
        .setLabel('Support')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🆘'),
      new ButtonBuilder()
        .setCustomId('ticket_partenariat')
        .setLabel('Partenariat')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🤝'),
      new ButtonBuilder()
        .setCustomId('ticket_autre')
        .setLabel('Autre')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❓')
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
