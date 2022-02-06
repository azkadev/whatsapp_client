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
                return callback(update);
            });
        }
    }

}

module.exports =  {
    Whatsapp
};