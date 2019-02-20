import getAll from "./modules/getAll.js";
import { html, render } from "./modules/render.js";
import { extend, arrayDeduplicate, HTMLElementSetInnerText } from "./modules/utility.js";
window.html = html;

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
	const count = document.querySelector("#count");
	const options = {
		fmt: "json",
		query: input.value
	};

	if (input.value === "") return;

	count.setInnerText("");
	clearArtists();

	// Follow your own advice: use pure functions.
	const svg = document.querySelector("svg");
	svg.classList.add("show");

	const names = (await getAll("artist", options))
		.map(artist => artist.name)
		.deduplicate();

	svg.classList.remove("show");

	const html = names
		.map(name => `
			<div class="list-item">
				${name}
			</div>`)
		.join("");

	render(document.querySelector("#artists"), html);

	count.setInnerText(`Dat ${classifyNoun(names.length, "is", "zijn")} er ${names.length}!`);
}

document
	.querySelector("form")
	.addEventListener("submit", renderArtists);