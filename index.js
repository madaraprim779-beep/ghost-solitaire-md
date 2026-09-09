import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";

import { config } from "./config.js";
import { generalCommand } from "./commands/general.js";
import { menuCommand } from "./commands/menu.js";
import {
  antiCallCommand,
  getAntiCall
} from "./commands/antcall.js";

async function startBot() {
  console.log("👻 GHOST SOLITAIRE MD");
  console.log("🚀 Démarrage...");

  const { state, saveCreds } =
    await useMultiFileAuthState("./auth_info");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    browser: ["GHOST SOLITAIRE MD", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // Connexion WhatsApp
  sock.ev.on(
    "connection.update",
    ({ connection, lastDisconnect, qr }) => {

      if (qr) {
        console.log("\n📱 SCANNE LE QR CODE :\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ GHOST SOLITAIRE MD CONNECTÉ !");
        console.log(`👑 Owner : ${config.ownerNumber}`);
      }

      if (connection === "close") {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        if (statusCode !== DisconnectReason.loggedOut) {
          console.log("🔄 Reconnexion...");
          startBot();
        } else {
          console.log("❌ Session déconnectée.");
        }
      }
    }
  );

  // Réception des messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const message = messages[0];

      if (!message?.message) return;
      if (message.key.fromMe) return;

      const jid = message.key.remoteJid;

      const text =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        "";

      if (!text.startsWith(config.prefix)) return;

      const parts = text
        .slice(config.prefix.length)
        .trim()
        .split(/\s+/);

      const command = parts.shift()?.toLowerCase();
      const args = parts;

      console.log(`📩 .${command}`);

      // Commandes générales
      const handledGeneral =
        await generalCommand(sock, jid, command);

      if (handledGeneral) return;

      // Menu
      if (command === "menu" || command === "allmenu") {
        await menuCommand(sock, jid);
        return;
      }

      // Anti-call
      if (command === "antcall") {
        await antiCallCommand(sock, jid, args);
        return;
      }

    } catch (error) {
      console.error("❌ Erreur commande :", error);
    }
  });

  // Gestion des appels
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      const jid = call.from;

      if (!getAntiCall(jid)) continue;

      try {
        if (call.status === "offer") {
          await sock.rejectCall(
            call.id,
            call.from
          );

          await sock.sendMessage(jid, {
            text:
              "📵 *GHOST SOLITAIRE MD*\n\n" +
              "🛡️ Anti-call activé.\n" +
              "❌ Appel refusé automatiquement."
          });

          console.log(
            `📵 Appel bloqué : ${jid}`
          );
        }
      } catch (error) {
        console.error(
          "❌ Erreur anti-call :",
          error
        );
      }
    }
  });
}

startBot().catch((error) => {
  console.error(
    "❌ Erreur de démarrage :",
    error
  );
});
