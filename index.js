"use strict";

const { default: makeWASocket,  DisconnectReason, useSingleFileAuthState } = require('@adiwajshing/baileys')
const pino  = require("pino");




const startclient = () =>
{
   // Arquivo responsavel por guardar os tokens da conexão
    const { state, saveState } = useSingleFileAuthState('./token.json')


    //Criando a instancia.
    const client = makeWASocket (
    {
        logger: pino({ level: `error` }),           
        browser: ['Windows', "Google Chrome", "98"],
        printQRInTerminal: true,                    
        version: [9999, 9999, 9999],                
        emitOwnEvents: true,                        
        auth: state
    })
    

    //Reinicia a conexão se houver algum erro de comunicação com o servidor.
    client.ev.on("connection.update", (update) =>
    {
        const { connection, lastDisconnect } = update

        if (connection == "close") { lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut ? startclient() : console.log('connection closed')  }
    })
  

    //Evento que monitora as msg recebida
    client.ev.on('messages.upsert', async (message) =>
    {
        const msg = message.messages[0] 
        if (!msg.message) return
        if (msg.key && msg.key.remoteJid == 'status@broadcast') return
        if (msg.key.fromMe) return
        if (msg.key.remoteJid.endsWith('@g.us')) return


        await client.sendMessage(msg.key.remoteJid, { text: 'Bem-vinda!!' })


    })
    

    //Salvar credenciais, e keys
    client.ev.on("creds.update", () => saveState());
   
    return client
    
}

startclient()