const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  MessageFlags,
} = require('discord.js');

const ticketCategories = {
  suggestion: {
    name: '💡 Suggestion',
    description: 'Proposer une amélioration pour le serveur',
    color: 0x00ff00,
    emoji: '💡',
  },
  support: {
    name: '🆘 Support',
    description: "Signaler un problème ou demander de l'aide",
    color: 0xff0000,
    emoji: '🆘',
  },
  partnership: {
    name: '🤝 Partenariat',
    description: 'Demande de partenariat avec Bistro Tech',
    color: 0x0099ff,
    emoji: '🤝',
  },
  other: {
    name: '❓ Autre',
    description: 'Autre type de demande',
    color: 0x9932cc,
    emoji: '❓',
  },
};

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const { customId, user, guild } = interaction;

    if (customId.startsWith('ticket_')) {
      const ticketType = customId.replace('ticket_', '');
      await createTicket(interaction, ticketType);
    } else if (customId === 'close_ticket') {
      await closeTicket(interaction);
    } else if (customId === 'confirm_close') {
      await confirmCloseTicket(interaction);
    } else if (customId === 'cancel_close') {
      await cancelCloseTicket(interaction);
    }
  });

  async function createTicket(interaction, ticketType) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    const user = interaction.user;
    const category = ticketCategories[ticketType];

    const existingTicket = guild.channels.cache.find(
      (channel) =>
        channel.name === `${ticketType}-${user.username.toLowerCase()}` &&
        channel.type === ChannelType.GuildText
    );

    if (existingTicket) {
      return await interaction.editReply({
        content: `❌ Vous avez déjà un ticket ouvert de type **${category.name}** : ${existingTicket}`,
      });
    }

    try {
      const ticketCategoryId = process.env.TICKET_CATEGORY_ID;
      const roleChiefId = process.env.ROLE_CHIEF;
      const roleStaffId = process.env.ROLE_STAFF;
      const ticketChannel = await guild.channels.create({
        name: `${ticketType}-${user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: ticketCategoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
          {
            id: roleChiefId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ],
      });
      const welcomeEmbed = new EmbedBuilder()
        .setTitle(`${category.emoji} ${category.name}`)
        .setDescription(
          `Bonjour ${user}, merci d'avoir ouvert un ticket !\n\n` +
            `**Type de demande :** ${category.description}\n\n` +
            `Veuillez décrire votre demande en détail. Un membre de l'équipe vous répondra dès que possible.`
        )
        .setColor(category.color)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({
          text: 'Bistro Tech • Système de tickets',
          iconURL: guild.iconURL(),
        })
        .setTimestamp();

      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Fermer le ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒')
      );

      await ticketChannel.send({
        content: `${user} | <@&${roleChiefId}> & <@&${roleStaffId}>`,
        embeds: [welcomeEmbed],
        components: [closeButton],
      });

      await interaction.editReply({
        content: `✅ Votre ticket a été créé : ${ticketChannel}`,
      });
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors de la création du ticket.',
      });
    }
  }

  async function closeTicket(interaction) {
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔒 Fermeture du ticket')
      .setDescription('Êtes-vous sûr de vouloir fermer ce ticket ?')
      .setColor(0xff0000)
      .setFooter({
        text: 'Cette action est irréversible',
      });
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_close')
        .setLabel('Confirmer')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('✅'),
      new ButtonBuilder()
        .setCustomId('cancel_close')
        .setLabel('Annuler')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('❌')
    );
    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
      flags: MessageFlags.Ephemeral,
    });
  }
  async function confirmCloseTicket(interaction) {
    await interaction.deferReply();
    try {
      const channel = interaction.channel;
      await interaction.editReply({
        content: '🔒 Le ticket sera fermé dans 3 secondes...',
      });
      setTimeout(async () => {
        await channel.delete();
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket:', error);
      await interaction.editReply({
        content: '❌ Une erreur est survenue lors de la fermeture du ticket.',
      });
    }
  }

  async function cancelCloseTicket(interaction) {
    await interaction.reply({
      content: 'Fermeture annulée.',
      embeds: [],
      components: [],
      flags: MessageFlags.Ephemeral,
    });
  }
};
