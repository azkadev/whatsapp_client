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
                    var data = {
                        "chat_id": chat_id,
                        "text": `Hay perkenalkan saya adalah bot`,
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "GITHUB",
                                        "url": "https://github.com/azkadev"
                                    }
                                ],
                                [
                                    {
                                        "text": "callback",
                                        "callback_data": "https://github.com/azkadev"
                                    },
                                    {
                                        "text": "callback",
                                        "callback_data": "https://github.com/azkadev"
                                    }
                                ]
                            ]
                        }
                    };
                    return await wa.request("sendMessage", data);
                }
                
                if (RegExp("^/photo$", "i").exec(text)) {
                    var data = {
                        "chat_id": chat_id,
                        "photo": `https://user-images.githubusercontent.com/38845275/128774296-40a55843-1893-44e6-936e-5e71c7cf72de.png`,
                        "caption": "ini pesan photo"
                    };
                    return await wa.request("sendPhoto", data);
                }

                if (RegExp("^/jsondumpraw$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": JSON.stringify(update_origin, null, 2)
                    });
                }

                if (RegExp("^/jsondump$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": JSON.stringify(update, null, 2)
                    });
                }

                if (RegExp("^/ping$", "i").exec(text)) {
                    var time = (Date.now() / 1000) - msg.date;
                    var data = {
                        "chat_id": chat_id,
                        "text": `Pong ${time.toFixed(3)}`
                    };
                    return await wa.request("sendMessage", data);
                }
            }
            if (!is_outgoing) {
                var data = {
                    "chat_id": chat_id,
                    "text": `Hay perkenalkan saya adalah bot\nTolong gunakan perintah /start ya!`,
                };
                return await wa.request("sendMessage", data);
            }
        }
    }
});
```

## Demo

https://user-images.githubusercontent.com/82513502/152686817-79a6cf18-796e-4eee-b39c-3d5c8b65101a.mp4

## Feature
1. Multi device ( without phone active internet)


## tutor

https://youtu.be/XEDuynClElM
