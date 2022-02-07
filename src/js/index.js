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

    reply_markup(data_keyboard) {
        try {
            var keyboards = [];
            if (typeof data_keyboard == "object") {
                if (typeof data_keyboard["inline_keyboard"] == "object") {
                    var inline_keyboard = data_keyboard["inline_keyboard"];
                    for (var i = 0; i < inline_keyboard.length; i++) {
                        var loop_data = inline_keyboard[i];
                        if (typeof loop_data == "object") {
                            var keyboard_index = (i == 0) ? 1 : (i + 1);
                            if (loop_data.length == 1) {
                                var json_data = {
                                    "index": keyboard_index
                                };

                                if (typeof loop_data[0]["text"] != "string") {
                                    throw {
                                        "status_code": 400,
                                        "status_bool": false,
                                        "message": "parameters text keyboard harus string"
                                    };
                                }
                                if (!loop_data[0]["text"]) {
                                    throw {
                                        "status_code": 400,
                                        "status_bool": false,
                                        "message": "tolong isi textnya juga dong"
                                    };
                                }
                                var json_data_keyboard = {};
                                json_data_keyboard["displayText"] = String(loop_data[0]["text"]);
                                if (loop_data[0]["url"]) {
                                    json_data_keyboard["url"] = String(loop_data[0]["url"]);
                                    json_data["urlButton"] = json_data_keyboard;
                                } else if (loop_data[0]["callback_data"]) {
                                    json_data_keyboard["id"] = 'id-like-buttons-message';
                                    json_data["quickReplyButton"] = json_data_keyboard;
                                } else if (loop_data[0]["phone_number"]) {
                                    json_data_keyboard["phoneNumber"] = String(loop_data[0]["phone_number"]);
                                    json_data["callButton"] = json_data_keyboard;
                                }
                                keyboards.push(json_data);
                            } else if (loop_data.length > 1) {
                                for (var ii = 0; ii < loop_data.length; ii++) {
                                    var loop_dataa = loop_data[ii];
                                    if (typeof loop_dataa == "object") {
                                        var json_data = {
                                            "index": keyboard_index
                                        };

                                        if (typeof loop_dataa["text"] != "string") {
                                            throw {
                                                "status_code": 400,
                                                "status_bool": false,
                                                "message": "parameters text keyboard harus string"
                                            };
                                        }
                                        if (!loop_dataa["text"]) {
                                            throw {
                                                "status_code": 400,
                                                "status_bool": false,
                                                "message": "tolong isi textnya juga dong"
                                            };
                                        }
                                        var json_data_keyboard = {};
                                        json_data_keyboard["displayText"] = String(loop_dataa["text"]);
                                        if (loop_dataa["url"]) {
                                            json_data_keyboard["url"] = String(loop_dataa["url"]);
                                            json_data["urlButton"] = json_data_keyboard;
                                        } else if (loop_dataa["callback_data"]) {
                                            json_data_keyboard["id"] = 'id-like-buttons-message';
                                            json_data["quickReplyButton"] = json_data_keyboard;
                                        } else if (loop_dataa["phone_number"]) {
                                            json_data_keyboard["phoneNumber"] = String(loop_dataa["phone_number"]);
                                            json_data["callButton"] = json_data_keyboard;
                                        }
                                        keyboards.push(json_data);
                                    }
                                }
                            }
                        }
                    }
                    return keyboards;
                }
                return undefined;
            } else {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }
    }

    async request(method, parameters = {}) {
        if (typeof method == "string") {
            if (typeof parameters != "object") {
                parameters = {};
            }
            if (RegExp("^(sendMessage|sendPhoto|sendVideo|sendAudio|sendContact|sendLocation)$", "i").exec(method)) {
                if (typeof parameters["chat_id"] != "string") {
                    throw {
                        "message": "parameters chat_id harus string!"
                    };
                }
                if (!parameters["chat_id"]) {
                    throw {
                        "message": "parameters chat_id harus isi!"
                    };
                }
                if (typeof parameters["reply_markup"] == "object") {
                    parameters["templateButtons"] = this.reply_markup(parameters["reply_markup"]);
                    delete parameters["reply_markup"];
                }
                if (RegExp("^sendMessage$", "i").exec(method)) {
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

                if (RegExp("^sendPhoto$", "i").exec(method)) {
                    if (typeof parameters["photo"] != "string") {
                        throw {
                            "message": "Tolong parameters photo harus string"
                        };
                    }
                    if (!parameters["photo"]) {
                        throw {
                            "message": "parameters photo harus isi"
                        };
                    }
                    parameters["image"] = {
                        "url": parameters["photo"]
                    };
                    delete parameters["photo"];
                    return await this.wa.sendMessage(parameters["chat_id"], {
                        ...parameters
                    });
                }

                if (RegExp("^sendVideo$", "i").exec(method)) {
                    if (typeof parameters["video"] != "string") {
                        throw {
                            "message": "params is bad"
                        };
                    }
                    if (!parameters["video"]) {
                        throw {
                            "message": "params is bad"
                        };
                    }
                    parameters["video"] = parameters["video"];
                    delete parameters["video"];
                    return await this.wa.sendMessage(parameters["chat_id"], {
                        ...parameters
                    });
                }

                if (RegExp("^sendAudio$", "i").exec(method)) {
                    if (typeof parameters["audio"] != "string") {
                        throw {
                            "message": "params is bad"
                        };
                    }
                    if (!parameters["audio"]) {
                        throw {
                            "message": "params is bad"
                        };
                    }
                    parameters["audio"] = {
                        "url": parameters["audio"],
                        "mimetype": "audio/mp3"
                    };
                    delete parameters["audio"];
                    return await this.wa.sendMessage(parameters["chat_id"], {
                        ...parameters
                    });
                }

                if (RegExp("^sendContact$", "i").exec(method)) {
                    parameters["contact"] = {
                        "displayName": parameters["name"],
                        "contacts": parameters["contacts"] 
                    };
                    return await this.wa.sendMessage(parameters["chat_id"], {
                        ...parameters
                    });
                }
                if (RegExp("^sendLocation$", "i").exec(method)) {
                    parameters["location"] = {
                        "degreesLatitude": parameters["latitude"],
                        "degreesLongitude": parameters["longitude"] 
                    };
                    return await this.wa.sendMessage(parameters["chat_id"], {
                        ...parameters
                    });
                }

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
                        if (typeof message["locationMessage"] == "object" && message["locationMessage"]) {
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