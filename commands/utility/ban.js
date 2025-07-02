const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban un utilisateur')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers)
        		.addUserOption(option =>
			option.setName('utilisateur')
				.setDescription('utilisateur a ban')
				.setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('utilisateur');
		const member = await interaction.guild.members.fetch(user.id);
		if (member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
			await interaction.guild.members.ban(user);
			await interaction.reply({ content: `${user.username} a été banni`, flags: MessageFlags.Ephemeral });
			console.log('Commande Ban effectué');
		}
		else {
			await interaction.reply({ content: 'Tu n\'as pas la permission pour ban', flags: MessageFlags.Ephemeral });
		}
	},
};
