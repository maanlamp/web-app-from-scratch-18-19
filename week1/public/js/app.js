import getAll from "./modules/getAll.js";
import {render} from "./modules/render.js";

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

Object.defineProperty(HTMLElement.prototype, "setInnerText", {
	value: function setInnerText (value) {
		this.setInnerText = value;
		return this;
	}
});

function setInnerText (selection, text) {
	((typeof selection === "string")
		? document.querySelector(selection)
		: selection
	).innerText = text;
}

Object.defineProperty(Array.prototype, "deduplicate", {
	value: function deduplicate () {
		return [...new Set(this)];
	}
});

async function renderArtists (event) {
	event.preventDefault();
	const input = document.querySelector("input");
	const options = {
		fmt: "json",
		query: input.value
	};

	if (input.value === "") return;

	setInnerText("#count", "");
	clearArtists();

	// Follow your own advice: use pure functions.
	const names = (await getAll("artist", options))
		.map(artist => artist.name)
		.deduplicate();

	names.forEach(name => render(
		document.querySelector("#artists"),
		`
			<div class="list-item">
				${name}
			</div>
		`));
	setInnerText("#count", `Dat ${classifyNoun(names.length, "is", "zijn")} er ${names.length}!`);
}

document
	.querySelector("form")
	.addEventListener("submit", renderArtists);