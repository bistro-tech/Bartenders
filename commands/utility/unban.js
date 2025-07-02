const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

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

		if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
			return interaction.reply({ content: 'Tu n\'as pas la permission pour unban', flags: MessageFlags.Ephemeral });
		}

		const banList = await interaction.guild.bans.fetch();
		const bannedUser = banList.get(user.id);

		if (!bannedUser) {
			return interaction.reply({ content: `L'utilisateur ${user.tag} n'est pas banni.`, flags: MessageFlags.Ephemeral });
		}

		await interaction.guild.members.unban(user);
		await interaction.reply({ content: `${user.tag} a été débanni`, flags: MessageFlags.Ephemeral });
		console.log('Commande Unban effectué');
	},
};
