const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout un utilisateur pendant une heure')
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('utilisateur a timeout')
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const target = interaction.options.getMember('utilisateur');
    if (member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await target.timeout(3600_000);
      await interaction.reply({
        content: `${target} a été timeout 1h`,
        flags: MessageFlags.Ephemeral,
      });
      console.log('Commande Timeout effectué');
    } else {
      await interaction.reply({
        content: "Tu n'as pas la permission pour timeout",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
