const antiCall = new Map();

export function getAntiCall(jid) {
  return antiCall.get(jid) || false;
}

export function setAntiCall(jid, value) {
  antiCall.set(jid, value);
}

export async function antiCallCommand(sock, jid, args) {
  const option = args[0]?.toLowerCase();

  if (option === "on") {
    setAntiCall(jid, true);

    await sock.sendMessage(jid, {
      text:
        "🛡️ *ANTI-CALL ACTIVÉ*\n\n" +
        "📵 Les appels entrants seront bloqués."
    });

    return true;
  }

  if (option === "off") {
    setAntiCall(jid, false);

    await sock.sendMessage(jid, {
      text:
        "🛡️ *ANTI-CALL DÉSACTIVÉ*\n\n" +
        "📞 Les appels sont maintenant autorisés."
    });

    return true;
  }

  if (option === "status") {
    const status = getAntiCall(jid);

    await sock.sendMessage(jid, {
      text:
        `🛡️ ANTI-CALL\n\n` +
        `État : ${status ? "✅ ACTIVÉ" : "❌ DÉSACTIVÉ"}`
    });

    return true;
  }

  await sock.sendMessage(jid, {
    text:
      "📵 Utilisation :\n\n" +
      ".antcall on\n" +
      ".antcall off\n" +
      ".antcall status"
  });

  return true;
}