export const config = {
    botName: process.env.BOT_NAME || "GHOST SOLITAIRE MD",
    
    // Numéro WhatsApp du compte qui sera connecté au bot (récupéré depuis Render)
    botNumber: process.env.BOT_NUMBER || "",
    
    // Numéro du propriétaire (récupéré depuis Render, avec votre numéro actuel par défaut)
    ownerNumber: process.env.OWNER_NUMBER || "2250709300922",
    
    prefix: process.env.PREFIX || "."
};
