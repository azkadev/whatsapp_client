# Whatsapp client

Lightweight library to make application or bot for whatsapp without selenium


## Docs

Just Read on [wiki](https://github.com/azkadev/whatsapp_client/wiki) or read library native on [Baileys](https://adiwajshing.github.io/Baileys)

## install

```bash
npm install whatsapp_client
```

## Quick-Start

```js
var { Whatsapp } = require("whatsapp_client");
var wa = new Whatsapp();
wa.on("update", async function (update, update_origin) {
    if (typeof update == "object") {
        if (typeof update["message"] == "object") {
            var msg = update["message"];
            var chat_id = msg["chat_id"];
            var text = msg["text"] ?? "";
            var is_outgoing = msg["is_outgoing"];
            if (text) {
                if (RegExp("^/start$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": "Hay saya adalah robot"
                    });
                }
            }
        }
    }
});
```

## Feature
1. Multi device ( without phone active internet)
