const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 1235;

const replacementMaps = [
	["var a=new VZ(this.G,this);", "window.quals = a;"],
	["a=new VZ(this.G,this),", ",window.quals=a"],
	["this.B=new JW(this);", "window.quals=this.B;"]
];

app.get("/ytBase", async (req, res) => {
	if (!req.query.url) return res.status(404).send();
	let url = req.query.url;
	if (url.match(/^https:\/\/(www\.|)youtube\.com\/s\/player\/[a-f0-9]+\/(?:[^\/]*\/)*base\.js$/)) {
		try {
			let response = await fetch(url);
			let text = await response.text();
			if (response.status < 400) {
				text = makeReplacements(text, replacementMaps);
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
	for (let subarray of map) {
		if (text.includes(subarray[0])) {
			text = text.replace(subarray[0], subarray.join(""));
		}
	}
	return text;
}

app.listen(PORT);