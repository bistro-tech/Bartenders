const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-challenge')
    .setDescription('Obtiens la liste des challenges non résolu'),
  async execute(interaction) {
    const member = interaction.member;
    // Vérifier si le membre est enregistré dans la bdd avec son id, s'il l'est, renvoyer tout les défis où "data_completed" est false, s'il n'est pas enregistré en recherchant avec l'id alors créer un nouvel utilisateur
  },
};
