'use strict';

const Prim = "#9f80ff", Seco = "#bf80ff", Tert = "#df80ff", Gry = "#999999", Wht = "#ffffff", Org = "#ffbf80", Red = "#ff8080"

module.exports = function stinkyFriends(mod) {
	const MSG = new TeraMessage(mod);
	let characterId = null;
	let stinky = false;
	let debug = false;
	
	mod.command.add("stinky", {
		$none() {
			mod.settings.characters[characterId].enabled = !mod.settings.characters[characterId].enabled;
			mod.command.message(`${mod.settings.characters[characterId].enabled?'en':'dis'}abled for ${mod.settings.characters[characterId].name}.`);
		},
		characters(){
			mod.command.message(`Your confirmed stinky characters`);
			Object.keys(mod.settings.characters).forEach(key => {
				mod.command.message(`${key} : ${mod.settings.characters[key].name}`);
		},
		message(msg) {
			if (!msg) return mod.command.message(`${id} invalid command usage consult readme for an example.`);
			
			mod.command.message(`Changing whisper from ${mod.settings.msg} to ${msg}`);
			mod.settings.msg = msg;
		},
		mode() {
			mod.settings.whitelistMode = !mod.settings.whitelistMode;
            mod.command.message(`Whitelist ${mod.settings.whitelistMode?'en':'dis'}abled.`);
		},
		debug() {
			debug = !debug;
            mod.command.message(`Debug ${debug?'en':'dis'}abled.`);
		},
		list(action, name, msg) {
			if (!msg) msg = "default";
			if (!name) {
				mod.command.message(`Current stinky people and their messages:`);
				Object.keys(mod.settings.whitelist).forEach(key => {
					mod.command.message(`${key} : ${mod.settings.whitelist[key]}`);
				});
			} else {
				if (action === "add") {
					mod.settings.whitelist[name.toLowerCase()] = msg;
					mod.command.message(`${name} is now a stinky friend.`);
				} else if (action === "remove") {
					if (!(name.toLowerCase() in mod.settings.whitelist)) {
						mod.command.message(`${name} was already not stinky.`)
						return;
					}
					delete mod.settings.whitelist[name.toLowerCase()];
					mod.command.message(`${name} is no longer a stinky friend.`);
				}
			}
		}
	});
	mod.hook("S_LOGIN", 14, event => {
		characterId = `${event.playerId}_${event.serverId}`;
		if (mod.settings.characters[characterId] == undefined) {
			mod.settings.characters[characterId] = {
				"name": event.name,
				"enabled": false
			};
		} else if (mod.settings.characters[characterId].name !== event.name){
			mod.settings.characters[characterId].name = event.name;
		}
		if(debug) mod.log('stinky login');
        if(mod.settings.characters[characterId].enabled) {
			stinky = true;
		};
	});
	mod.hook('S_UPDATE_FRIEND_INFO', 1,{ order: -1000 }, event => {
		if(debug) mod.log('stinky update friend info');
        if (!mod.settings.characters[characterId].enabled || !stinky) {
            return;
        } else {
			stinky = false;
            for (let friend of event.friends) {
				if (friend.status == 2) {
					if(debug) mod.log(`offline friend: ${friend.name}`);
				} else if (!(mod.settings.whitelistMode) || friend.name.toLowerCase() in mod.settings.whitelist) {
					let msg;
					if(!(mod.settings.whitelist[friend.name.toLowerCase()]) || mod.settings.whitelist[friend.name.toLowerCase()] === "default") {
						msg = mod.settings.msg;
					} else {
						msg = mod.settings.whitelist[friend.name.toLowerCase()];
					}
					if(debug) mod.log(`stinky friend: ${friend.name}. Message: ${msg}`);
					MSG.whisper(friend.name, msg);
				} else {
					if(debug) mod.log(`non-stinky friend: ${friend.name}`);
				}
            }
        }
    });
	
	this.destructor = () => {
		stinky = false;
		mod.command.remove("stinky");
	};
};


class TeraMessage {
	constructor(mod) {
		this.mod = mod;
	}
	//HTML colors
	clr(text, hexColor) {
		return `<font color="${hexColor}">${text}</font>`;
	}
	RED(text) {
		return `<font color="#FF0000">${text}</font>`;
	}
	BLU(text) {
		return `<font color="#56B4E9">${text}</font>`;
	}
	YEL(text) {
		return `<font color="#E69F00">${text}</font>`;
	}
	TIP(text) {
		return `<font color="#00FFFF">${text}</font>`;
	}
	GRY(text) {
		return `<font color="#A0A0A0">${text}</font>`;
	}
	PIK(text) {
		return `<font color="#FF00DC">${text}</font>`;
	}
	
	//Tera chat channels
	chat(msg) {
		this.mod.command.message(msg);
	}
	party(msg) {
		this.mod.send("S_CHAT", this.mod.majorPatchVersion >= 108 ? 4 : 3, {
			"channel": 21,
			"message": msg
		});
	}
	partyOut(msg) { //Send to party notice chat.
		this.mod.send("C_CHAT", 1, {
			"channel": 21,
			"message": msg
		});
	}
	whisper(target,msg) {
		this.mod.send("C_WHISPER", 1, {
			"target": target,
			"message": msg
		});
	}
	raids(msg) {
		this.mod.send("S_CHAT", this.mod.majorPatchVersion >= 108 ? 4 : 3, {
			"channel": 25,
			"message": msg
		});
	}
	alert(msg, type) {
		this.mod.send("S_DUNGEON_EVENT_MESSAGE", 2, {
			"type": type,
			"chat": false,
			"channel": 0,
			"message": msg
		});
	}
}