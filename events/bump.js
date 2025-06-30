// A tester
require('dotenv').config();
const BotChannel = process.env.channelId?.trim();
const cooldown = new Set();

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		if (interaction.commandName === 'bump') {
			if (interaction.channel.id !== BotChannel) return;

			if (cooldown.has(interaction.channel.id)) {
				await interaction.reply({ content: '⏳ Un rappel est déjà en attente pour ce salon.', ephemeral: true });
				return;
			}

			console.log(`Commande /bump détectée dans le bon salon par ${interaction.user.tag}`);
			await interaction.reply({ content: '⏳ Rappel programmé dans 2 heures !', ephemeral: true });

			cooldown.add(interaction.channel.id);

			setTimeout(() => {
				interaction.channel.send('🔔 Il est temps de refaire un `/bump` pour booster le serveur !');
				cooldown.delete(interaction.channel.id);
			}, 1 * 60 * 1000);
		}
	},
};
