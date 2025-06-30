const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unban un utilisateur')
        		.addUserOption(option =>
			option.setName('utilisateur')
				.setDescription('utilisateur à unban')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('utilisateur');
		if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
			await interaction.guild.members.unban(user);
			await interaction.reply({ content: `${user.tag} a été débanni`, flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'Tu n\'as pas la permission pour unban', flags: MessageFlags.Ephemeral });
		}
	},
};
