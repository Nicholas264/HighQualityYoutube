const express = require("express");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const app = express();
const Script = mongoose.model("Script", { url: String, script: String });
const PORT = 1235;

const replacementMaps = [
	["var a=new VZ(this.G,this);", "window.quals = a;"],
	["a=new VZ(this.G,this),", ",window.quals=a"],
	["this.B=new JW(this);", "window.quals=this.B;"]
];

const db = mongoose.connect("mongodb://localhost:27017/ytcache", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

app.get("/ytBase", async (req, res) => {
	if (!req.query.url) return res.status(404).send();
	let url = req.query.url;
	if (url.match(/^https:\/\/(www\.|)youtube\.com\/s\/player\/[a-f0-9]+\/(?:[^\/]*\/)*base\.js$/)) {
		let query = await Script.find({ url: url });
		if (query[0]) {
			res.type("text/javascript");
			res.send(query[0].script);
			return;
		}
		try {
			let response = await fetch(url);
			let text = await response.text();
			if (response.status < 400) {
				text = makeReplacements(text, replacementMaps);
				(new Script({
					url: url,
					script: text
				})).save();
				res.type("text/javascript");
				res.send(text);
				return;
			} else {
				throw "not a valid url";
			}
		} catch (e) {
			res.status(404);
			res.send();
		}
	}
});
function makeReplacements(text, map) {
	let changed = false;
	for (let subarray of map) {
		if (text.includes(subarray[0])) {
			text = text.replace(subarray[0], subarray.join(""));
			changed = true;
		}
	}
	if (!changed) {
		// targets the value of g.k that has the prototype function of setPlaybackQuality
		let target = text.match(/(?<=g\.k=)(?:(?!g\.k=).)*(?=g\.k\.setPlaybackQuality=function\(a\))/s);
		if (target) {
			let player = target[0].slice(0,2);
			let regex = new RegExp(`(?<=;)([^;]*)=new ${player}[^;]*;`, "s");
			let replacement = regex.exec(text);
			if (replacement) {
				text = text.replace(replacement[0], `${replacement[0]}window.quals=${replacement[1]};`);
			}
		}
	}
	return text;
}

app.listen(PORT);