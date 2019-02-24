import getAll from "./modules/getAll.js";
import { html, render } from "./modules/render.js";
import { extend, arrayDeduplicate, HTMLElementSetInnerText } from "./modules/utility.js";

import PromiseStream from "./modules/PromiseStream.js";
window.html = html;
window.PromiseStream = PromiseStream;

extend({
	"Array": {
		deduplicate: arrayDeduplicate
	},
	"HTMLElement": {
		setInnerText: HTMLElementSetInnerText
	}
});

void function scaleInputOnInput () {
	const input = document.querySelector("input");
	function scale () {
		input.style.setProperty("--contentWidth", `${Math.max(1, input.value.length)}ch`);
	}
	scale();
	input.addEventListener("input", scale);
}();

function clearArtists () {
	Array.from(
		document
			.querySelector("#artists")
			.querySelectorAll("*"),
		child => child.remove());
}

function classifyNoun (count, single, plural) {
	return (count === 1) ? single : plural;
}

async function renderArtists (event) {
	event.preventDefault();
	const input = document.querySelector("input");
	if (input.value === "") return;

	const count = document.querySelector("#count");
	const svgLoader = document.querySelector("svg");
	const artists = document.querySelector("#artists")
	const options = {
		fmt: "json",
		query: input.value
	};

	count.setInnerText("");
	clearArtists();
	svgLoader.classList.add("show");

	const {count: resultCount, promises} = await getAll("artist", options);
	const stream = new PromiseStream(promises);
	stream
		.foreach(response => response.json())
		.foreach(json => json["artists"])
		.foreach(artists => artists.map(artist => artist.name))
		.foreach(names => names
			.forEach(name => artists
				.insertAdjacentHTML("beforeend", `
					<div class="list-item">
						${name}
					</div>`)))
		.then(() => svgLoader.classList.remove("show"));

	count.setInnerText(`Dat ${classifyNoun(resultCount, "is", "zijn")} er ${resultCount}!`);
}

document
	.querySelector("form")
	.addEventListener("submit", renderArtists);

// .then(responses => responses
// 	.mapAsync(res => res.json())
// 	.then(jsons => jsons
// 		.map(json => json[`${endpoint}s`])
// 		.flat()))