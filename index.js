const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Ghost Solitaire MD est en ligne et actif !');
});

app.listen(PORT, () => {
  console.log(`Serveur web démarré sur le port ${PORT}`);
});

async function startGhostSolitaire() {
  const sessionId = process.env.SESSION_ID;

  if (!sessionId) {
    console.error("Erreur : SESSION_ID manquant dans les variables d'environnement !");
    return;
  }

  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: Browsers.macOS('Desktop')
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'open') {
      console.log(`Ghost Solitaire MD connecté avec succès pour le numéro 2250709300922 !`);
    } else if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Connexion perdue, tentative de reconnexion...', shouldReconnect);
      if (shouldReconnect) {
        startGhostSolitaire();
      }
    }
  });

  sock.ev.on('messages.upsert', async (chatUpdate) => {
    const mek = chatUpdate.messages[0];
    if (!mek.message) return;
    // Ajoutez vos commandes ici
  });
}

startGhostSolitaire();
