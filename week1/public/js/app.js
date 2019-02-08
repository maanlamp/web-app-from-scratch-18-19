import getAll from "./modules/getAll.js";
import {render} from "./modules/render.js";

const input = document.querySelector("input");
void function scaleInputOnInput () {
	function scale () {
		input.style.setProperty("--contentWidth", `${Math.max(1, input.value.length)}ch`);
	}
	scale();
	input.addEventListener("input", scale);
}();

const section = document.querySelector("#artists");
function clearArtists () {
	Array.from(
		section.querySelectorAll("*"),
		child => child.remove());
}

function classifyNoun (count, single, plural) {
	return (count === 1) ? single : plural;
}

function setInnerText (element, text) {
	element.innerText = text;
}

const form = document.querySelector("form");
const count = document.querySelector("#count");
form.addEventListener("submit", async event => {
	event.preventDefault();
	if (input.value === "") return;
	setInnerText(count, "");
	clearArtists();

	const options = {
		fmt: "json",
		query: input.value
	};
	const names = (await getAll("artist", options))
		.filter(artist => artist.name.split(" ")[0].toLowerCase() === input.value.toLowerCase()) //Should filter by ID
		.map(artist => artist.name)
		.filter((name, i, source) => source.indexOf(name) === i) //deduplicate

	names.forEach(name => render(section, `
		<div class="list-item">
			${name}
		</div>
	`));

	setInnerText(count, `Dat ${classifyNoun(names.length, "is", "zijn")} er ${names.length}!`);
});