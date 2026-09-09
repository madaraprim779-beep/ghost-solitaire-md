import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import P from "pino";
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

  /*
   * PAIRING CODE
   */
  if (!state.creds.registered && config.botNumber) {
    try {
      const phoneNumber = config.botNumber.replace(/\D/g, "");

      console.log("🔐 Génération du Pairing Code...");
      console.log(`📱 Numéro : ${phoneNumber}`);

      const code = await sock.requestPairingCode(phoneNumber);

      console.log("\n╔════════════════════════════╗");
      console.log(`║   CODE : ${code}`);
      console.log("╚════════════════════════════╝\n");

    } catch (error) {
      console.error(
        "❌ Impossible de générer le Pairing Code :",
        error
      );
    }
  }

  sock.ev.on(
    "connection.update",
    ({ connection, lastDisconnect }) => {

      if (connection === "open") {
        console.log("");
        console.log("╔══════════════════════════════╗");
        console.log("║ 👻 GHOST SOLITAIRE MD       ║");
        console.log("║ ✅ WHATSAPP CONNECTÉ         ║");
        console.log("╚══════════════════════════════╝");
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

  /*
   * COMMANDES
   */
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

      console.log(`📩 Commande : .${command}`);

      if (command === "menu" || command === "allmenu") {
        await menuCommand(sock, jid);
        return;
      }

      if (command === "antcall") {
        await antiCallCommand(sock, jid, args);
        return;
      }

      const handled =
        await generalCommand(sock, jid, command);

      if (handled) return;

    } catch (error) {
      console.error("❌ Erreur commande :", error);
    }
  });

  /*
   * ANTI-CALL
   */
  sock.ev.on("call", async (calls) => {
    for (const call of calls) {
      if (!getAntiCall(call.from)) continue;

      try {
        if (call.status === "offer") {
          await sock.rejectCall(
            call.id,
            call.from
          );

          await sock.sendMessage(call.from, {
            text:
              "📵 *GHOST SOLITAIRE MD*\n\n" +
              "🛡️ Anti-call activé.\n" +
              "❌ Appel refusé automatiquement."
          });
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
    "❌ Erreur fatale :",
    error
  );
});