const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick un utilisateur')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('utilisateur a kick')
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const target = interaction.options.getMember('utilisateur');
    if (member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      await target.kick();
      await interaction.reply({
        content: `${target} a été kick`,
        flags: MessageFlags.Ephemeral,
      });
      console.log('Commande Kick effectué');
    } else {
      await interaction.reply({
        content: "Tu n'as pas la permission pour kick",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
