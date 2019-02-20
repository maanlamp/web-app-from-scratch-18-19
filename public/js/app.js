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
	if (input.value === "") return;

	const count = document.querySelector("#count");
	const svgLoader = document.querySelector("svg");
	const options = {
		fmt: "json",
		query: input.value
	};

	count.setInnerText("");
	clearArtists();
	svgLoader.classList.add("show");

	const HTMLArray = (await getAll("artist", options))
		.map(artist => artist.name)
		// .deduplicate()
		.map(name => `
			<div class="list-item">
				${name}
			</div>`);

	render(document.querySelector("#artists"), HTMLArray.join(""));
	count.setInnerText(`Dat ${classifyNoun(HTMLArray.length, "is", "zijn")} er ${HTMLArray.length}!`);
	svgLoader.classList.remove("show");
}

document
	.querySelector("form")
	.addEventListener("submit", renderArtists);