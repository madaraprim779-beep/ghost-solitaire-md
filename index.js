import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import P from "pino";
import qrcode from "qrcode-terminal";
import { config } from "./config.js";

async function startBot() {
  console.log("╭──────────────────────────────╮");
  console.log("│      GHOST SOLITAIRE MD      │");
  console.log("│        Démarrage...          │");
  console.log("╰──────────────────────────────╯");

  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["GHOST SOLITAIRE MD", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("\n📱 SCANNE CE QR CODE AVEC WHATSAPP :\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("\n✅ GHOST SOLITAIRE MD EST CONNECTÉ !");
      console.log(`👑 Owner : ${config.ownerNumber}`);
      console.log(`⚡ Préfixe : ${config.prefix}`);
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut;

      console.log("❌ Connexion fermée.");

      if (shouldReconnect) {
        console.log("🔄 Reconnexion...");
        startBot();
      } else {
        console.log("⚠️ Session déconnectée. Nouvelle authentification nécessaire.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];

    if (!message?.message) return;
    if (message.key.fromMe) return;

    const remoteJ
