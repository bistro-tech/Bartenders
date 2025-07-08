const {
  SlashCommandBuilder,
  MessageFlags,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('submit-challenge')
    .setDescription('Donner la réponse à un challenge avec son id'),
  async execute(interaction) {
    const member = interaction.member;
    // Vérifier si le membre est enregistré dans la bdd avec son id, s'il l'est, vérifier si la réponse est la même que celle en bdd, si oui stocker le date.now pour dire que l'utilisateur a fini son challenge sinon dire que la réponse n'est pas bonne.
    // Si l'utilisateur n'est pas enregistré
  },
};
