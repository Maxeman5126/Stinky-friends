'use strict';

const Prim = "#9f80ff", Seco = "#bf80ff", Tert = "#df80ff", Gry = "#999999", Wht = "#ffffff", Org = "#ffbf80", Red = "#ff8080"

module.exports = function stinkyFriends(mod) {
	const MSG = new TeraMessage(mod);
	let stinky = false;
	
	mod.command.add("stinky", {
		$none() {
			mod.settings.enabled = !mod.settings.enabled;
            mod.command.message(`Stinky Friends ${mod.settings.enabled?'en':'dis'}abled.`);
		},
		message(msg) {
			if (!msg) return mod.command.message(`${id} invalid command usage consult readme for an example.`);
			
			mod.command.message(`Changing Stinky Friends Whisper from ${mod.settings.msg} to ${msg}`);
			mod.settings.msg = msg;
		}
	});
	
	mod.hook('S_LOGIN', 'raw', event => {
        if(mod.settings.enabled) {
			stinky = true;
		};
    });
	mod.hook('S_UPDATE_FRIEND_INFO', 1, event => {
        if (!mod.settings.enabled || !stinky) {
            return;
        } else {
			stinky = false;
            for (let friend of event.friends) {
                MSG.whisper(friend.name,mod.settings.msg);
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