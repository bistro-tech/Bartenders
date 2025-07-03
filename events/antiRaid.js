// const messageMap = new Map();
// const logChannelId = process.env.LogChannelId;

// module.exports = (client) => {
//   console.log('AntiRaid Actif !');
//   client.on('messageCreate', async (message) => {
//     if (message.author.bot || !message.guild) return;

//     const now = Date.now();
//     const userId = message.author.id;
//     const userData = messageMap.get(userId) || {
//       count: 0,
//       lastMessage: now,
//       messages: [],
//       isTimeout: false,
//     };

//     userData.messages = userData.messages.filter(
//       (m) => now - m.createdTimestamp < 3000
//     );
//     userData.messages.push(message);

//     if (userData.messages.length >= 5 && !userData.isTimeout) {
//       userData.isTimeout = true;
//       try {
//         const botMember = await message.guild.members.fetch(client.user.id);
//         const authorMember = message.member;
//         const logChannel = message.guild.channels.cache.get(logChannelId);

//         if (
//           authorMember.roles.highest.position >=
//           botMember.roles.highest.position
//         ) {
//           const warnMsg = await message.channel.send(
//             `${message.author}, arrête de spam, on te voit assez comme ça !`
//           );
//           setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

//           if (logChannel) {
//             logChannel.send(
//               `${authorMember.user.tag} a spam dans ${message.channel} mais il est trop fort pour moi !`
//             );
//           }
//         } else {
//           await authorMember.timeout(
//             10 * 60 * 1000,
//             'Spam détecté (anti-raid)'
//           );

//           const toDelete = userData.messages.map((m) => m.id);
//           await message.channel.bulkDelete(toDelete, true).catch(() => {});
//           try {
//             await authorMember.send(
//               `Tu as été timeout pendant 10 minutes pour spam dans **${message.guild.name}**.`
//             );
//           } catch (dmError) {
//             console.log(
//               `Impossible d'envoyer le DM à ${authorMember.user.tag}`
//             );
//           }
//           const notif = await message.channel.send(
//             `${message.author}, tu as été timeout pour spam.`
//           );
//           setTimeout(() => notif.delete().catch(() => {}), 5000);

//           if (logChannel) {
//             logChannel.send(
//               `Timeout appliqué à ${authorMember.user.tag} pour spam dans ${message.channel}.`
//             );
//           }

//           console.log(
//             `[ANTIRAID] Timeout de ${authorMember.user.tag} et suppression de ses messages`
//           );
//         }
//         userData.count = 0;
//         userData.messages = [];
//         userData.isTimeout = false;
//       } catch (err) {
//         console.error('Erreur anti-raid:', err);
//         userData.isTimeout = false;
//       }
//     } else {
//       userData.count = userData.messages.length;
//     }

//     userData.lastMessage = now;
//     messageMap.set(userId, userData);
//   });
// };
