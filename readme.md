# Whatsapp client

Lightweight library to make application or bot for whatsapp without selenium


## Docs

Just Read on [wiki](https://github.com/azkadev/whatsapp_client/wiki) or read library native on [Baileys](https://adiwajshing.github.io/Baileys)

## Quick-Start

```js
var { Whatsapp } = require("whatsapp_client");
var wa = new Whatsapp();
wa.on("update", async function(message){
    var msg = message.messages[0]
    if (!msg.key.fromMe && m.type === 'notify') {
        var chat_id = msg.key.remoteJid;
        return await wa.request("sendMessage", {
            "chat_id": chat_id,
            "text": "hello world"
        });
    }
});
```

## Feature
1. Multi device ( without phone active internet)
