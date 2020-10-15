const qualList = ["4320", "2160", "1440", "1080", "720", "large", "medium", "480", "360", "240", "144", "auto"];
let maxQuality = qualList[2];
var videoctl;

function init() {
	videoctl = quals.G ? quals.G : quals.B ? quals.B : {};
	setQuality();
	setInterval(()=>{
		let highest = getHighestQuality(videoctl.getAvailableQualityLevels(), maxQuality);
		if (videoctl.getPlaybackQuality() !== highest) {
			setQuality(highest);
		}		
	},5000)
}
function setQuality() {
	let availableQualities = videoctl.getAvailableQualityLevels();
	let quality = getHighestQuality(availableQualities, maxQuality);
	videoctl.setPlaybackQuality(quality);
}
function getHighestQuality(qualityList, max) {
	let qualityIndex = qualList.indexOf(max);
	while (qualityIndex < qualList.length) {
		for (let quality in qualityList) {
			if (qualityList[quality].includes(qualList[qualityIndex])) {
				return qualityList[quality];
			}
		}
		qualityIndex++;
	}
	return "auto";
}
_waitForSelector("button.ytp-button.ytp-settings-button").then(elem => {
	elem.click();
	elem.click();
	_waitForVar("quals").then(init);
});
async function _waitForVar(windowVar) {
	return new Promise((resolve, reject) => {
		let interval = setInterval(function (v) {
			if (window.hasOwnProperty(v)) {
				clearInterval(interval);
				resolve(window[v]);
			}
		}, 50, windowVar);
	});
}
async function _waitForSelector(selector, content) {
	return new Promise((resolve, reject) => {
		let interval = setInterval((s, c) => {
			let elem = document.querySelectorAll(s);
			[...elem].forEach(e => {
				if (c) {
					if (e.innerText === c) {
						clearInterval(interval);
						resolve(e)
						return;
					}
				} else {
					clearInterval(interval);
					resolve(e);
					return;
				}
			});
		}, 50, selector, content);
	});
}