export async function generalCommand(sock, jid, command) {
  switch (command) {

    case "ping":
      await sock.sendMessage(jid, {
        text: "🏓 PONG !\n⚡ GHOST SOLITAIRE MD est actif."
      });
      break;

    case "alive":
      await sock.sendMessage(jid, {
        text:
          "╭━━〔 👻 GHOST SOLITAIRE MD 〕━━╮\n" +
          "┃\n" +
          "┃ ✅ BOT EN LIGNE\n" +
          "┃ ⚡ Système opérationnel\n" +
          "┃\n" +
          "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
      });
      break;

    case "owner":
      await sock.sendMessage(jid, {
        text:
          "👑 OWNER\n\n" +
          "GHOST SOLITAIRE MD\n" +
          "📱 +225 07 09 30 09 22"
      });
      break;

    case "botinfo":
      await sock.sendMessage(jid, {
        text:
          "🤖 GHOST SOLITAIRE MD\n\n" +
          "Version : 1.0.0\n" +
          "Préfixe : .\n" +
          "Plateforme : WhatsApp\n" +
          "Hébergement : Render"
      });
      break;

    default:
      return false;
  }

  return true;
}