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
                    if (update["messages"][0]["message"]) {
                        if (update["messages"][0]["message"]["conversation"]){
                            json_data["text"] = update["messages"][0]["message"]["conversation"];
                        }
                        if (update["messages"][0]["message"]["audioMessage"]){
                            json_data["audio"] = update["messages"][0]["message"]["audioMessage"];
                        }
                        if (update["messages"][0]["message"]["imageMessage"]){
                            json_data["image"] = update["messages"][0]["message"]["imageMessage"];
                        }
                        if (update["messages"][0]["message"]["locationMessage"]){
                            json_data["location"] = update["messages"][0]["message"]["locationMessage"];
                        }
                        if (update["messages"][0]["message"]["contactMessage"]){
                            json_data["contact"] = update["messages"][0]["message"]["contactMessage"];
                        }
                        if (update["messages"][0]["message"]["documentMessage"]){
                            json_data["document"] = update["messages"][0]["message"]["documentMessage"];
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