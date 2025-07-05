const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban un utilisateur')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
    .addUserOption((option) =>
      option
        .setName('utilisateur')
        .setDescription('utilisateur a ban')
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const target = interaction.options.getMember('utilisateur');
    if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      await interaction.guild.members.ban(target);
      await interaction.reply({
        content: `${target} a été banni`,
        flags: MessageFlags.Ephemeral,
      });
      console.log('Commande Ban effectué');
    } else {
      await interaction.reply({
        content: "Tu n'as pas la permission pour ban",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
