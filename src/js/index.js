var whatsapp_baileys = require("@adiwajshing/baileys");

class Whatsapp {
    constructor(options = {}) {
        if (typeof options != "object") {
            options = {};
        }
        var option_default = {
            "path_database": `${process.cwd()}/account_db.json`,
            "path_account": `${process.cwd()}/account.json`,
            ...options
        };
        var store = whatsapp_baileys.makeInMemoryStore({});
        store.readFromFile(option_default["path_database"]);
        setInterval(function () {
            store.writeToFile(option_default["path_database"]);
        }, 10_000);
        var { state, saveState } = whatsapp_baileys.useSingleFileAuthState(option_default["path_account"]);
        this.wa = whatsapp_baileys.default({
            printQRInTerminal: true,
            auth: state,
            // implement to handle retries
            getMessage: async function (key) {
                return {
                    conversation: "hello"
                }
            }
        });
        store.bind(this.wa.ev);
        this.wa.ev.on('connection.update', async function (update) {
            var { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if ((lastDisconnect.error)?.output?.statusCode !== whatsapp_baileys.DisconnectReason.loggedOut) {
                    new Whatsapp();
                } else {
                    console.log('connection closed');
                }
            }
            console.log('connection update', update);
        });

        this.wa.ev.on('creds.update', saveState);

    }



    async request(method, parameters = {}) {
        if (typeof method == "string") {
            if (typeof parameters != "object") {
                parameters = {};
            }
            if (RegExp("^sendMessage$", "i").exec(method)) {
                if (typeof parameters["chat_id"] != "string") {
                    throw {
                        "message": "params is bad"
                    };
                }
                if (!parameters["chat_id"]) {
                    throw {
                        "message": "params is bad"
                    };
                }
                if (typeof parameters["text"] != "string") {
                    throw {
                        "message": "params is bad"
                    };
                }
                if (!parameters["text"]) {
                    throw {
                        "message": "params is bad"
                    };
                }
                return await this.wa.sendMessage(parameters["chat_id"], {
                    "text": parameters["text"],
                    ...parameters
                });
            }
        } else {
            throw {
                "message": "params is bad"
            };
        }
    }

    async on(type_update, callback) {
        if (type_update == "update") {
            this.wa.ev.on("messages.upsert", async function name(update) {
                if (typeof update == "object") {
                    var json_data = {};
                    json_data["is_outgoing"] = update["messages"][0]["key"]["fromMe"];
                    json_data["chat_id"] = update["messages"][0]["key"]["remoteJid"];
                    json_data["date"] = update["messages"][0]["messageTimestamp"];
                    if (typeof update["messages"][0]["message"] == "object") {
                        var message = update["messages"][0]["message"];
                        if (typeof message["conversation"] == "string" && message["conversation"]) {
                            json_data["text"] = message["conversation"];
                        }
                        if (typeof message["audioMessage"] == "object" && message["audioMessage"]) {
                            json_data["audio"] = message["audioMessage"];
                        }
                        if (typeof message["imageMessage"] == "object" && message["imageMessage"]) {
                            json_data["image"] = message["imageMessage"];
                        }
                        if (typeof message["locationMessage"] == "object" &&  message["locationMessage"]) {
                            json_data["location"] = message["locationMessage"];
                        }
                        if (typeof message["contactMessage"] == "object" && message["contactMessage"]) {
                            json_data["contact"] = message["contactMessage"];
                        }
                        if (typeof message["documentMessage"] == "object" && message["documentMessage"]) {
                            json_data["document"] = message["documentMessage"];
                        }

                        if (typeof message["extendedTextMessage"] == "object" && message["extendedTextMessage"]) {
                            var extendedTextMessage = message["extendedTextMessage"];
                            try {
                                var json_reply_to_message = {};
                                if (typeof extendedTextMessage["contextInfo"] == "object" && extendedTextMessage["contextInfo"]) {
                                    var contextInfo = extendedTextMessage["contextInfo"];
                                    if (typeof contextInfo["quotedMessage"] == "object" && contextInfo["quotedMessage"]) {
                                        var quotedMessage = contextInfo["quotedMessage"];
                                        if (typeof quotedMessage["conversation"] == "string") {
                                            json_reply_to_message["text"] = quotedMessage["conversation"];
                                        }
                                        if (typeof quotedMessage["audioMessage"] == "object" && quotedMessage["audioMessage"]) {
                                            json_reply_to_message["audio"] = quotedMessage["audioMessage"];
                                        }
                                        if (typeof quotedMessage["imageMessage"] == "object" && quotedMessage["imageMessage"]) {
                                            json_reply_to_message["image"] = quotedMessage["imageMessage"];
                                        }
                                        if (typeof quotedMessage["locationMessage"] == "object" && quotedMessage["locationMessage"]) {
                                            json_reply_to_message["location"] = quotedMessage["locationMessage"];
                                        }
                                        if (typeof quotedMessage["contactMessage"] == "object" && quotedMessage["contactMessage"]) {
                                            json_reply_to_message["contact"] = quotedMessage["contactMessage"];
                                        }
                                        if (typeof quotedMessage["documentMessage"] == "object" && quotedMessage["documentMessage"]) {
                                            json_reply_to_message["document"] = quotedMessage["documentMessage"];
                                        }
                                    }

                                }
                                json_data["reply_to_message"] = json_reply_to_message;
                                json_data["text"] = extendedTextMessage["text"];
                            } catch (e) {
                                console.log(e);
                            }
                        }

                    }
                    return callback({ "message": json_data }, update);
                }
            });
        }
    }

}

module.exports = {
    Whatsapp
};