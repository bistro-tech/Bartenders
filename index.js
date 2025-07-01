const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');

require('dotenv').config();
const token = process.env.DISCORD_Token;
const Disboard = process.env.DisboardId;
const channelId = process.env.channelId;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.once(Events.ClientReady, async readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	setInterval(async () => {
		try {
			const channel = await client.channels.fetch(channelId);
			const messages = await channel.messages.fetch({ limit: 100 });
			const lastMessageFromDisboard = messages.find(m => m.author.id === Disboard);
			const twoHours = 2 * 60 * 60 * 1000;
			const now = Date.now();

			if ((now - lastMessageFromDisboard.createdTimestamp) > twoHours) {
				// eslint-disable-next-line quotes
				await channel.send(`<@&1272223052176031806>, un petit bump ça vous dit ? Merci pour l'aide précieuse que vous apportez au serveur !`);
			}
		}
		catch (error) {
			console.error('Erreur dans le check du message Disboard:', error);
		}
	}, 30 * 60 * 1000);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(token);