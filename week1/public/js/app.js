const main = document.querySelector("main");
const endpoint = "https://musicbrainz.org/ws/2";

Object.defineProperty(String.prototype, "lastChar", {
	value: function lastChar (count = 1) {
		return this.slice(-count);
	},
	configurable: false
});

function createURL (baseURL, options) {
	const URLOptions = Object.entries(options)
		.map(entry => entry.join("="))
		.join("&");

	return `${baseURL}?${URLOptions}`;
}

async function getAll (thing, options) {
	const results = [];
	let maxResults = Infinity;

	while (results.length < maxResults) {
		await fetch(createURL(`${endpoint}/${thing}`, options))
			.then(response => response.json())
			.then(json => {
				maxResults = json.count;
				results.push(...json.artists);
			})
			.catch(err => {throw err});
	}
	
	return results;
}

/* ---------------------- */

const input = document.querySelector("input");
function scaleInput () {
	input.style.width = `${Math.max(1, input.value.length)}ch`;
}
scaleInput();
input.addEventListener("input", scaleInput);

const section = document.querySelector("#artists");
function clearArtists () {
	while (section.lastChild) section.lastChild.remove();
}

function classifyNoun (count) {
	return (count !== 1) ? "zijn" : "is";
}

const form = document.querySelector("form");
const count = document.querySelector("#count");
form.addEventListener("submit", async event => {
	event.preventDefault();

	if (input.value === "") return;

	count.innerText = "";

	const options = {
		fmt: "json",
		query: input.value
	};

	clearArtists();

	const results = (await getAll("artist", options))
		.filter(artist => artist.name.split(" ")[0].toLowerCase() === input.value.toLowerCase())
		.map(artist => artist.name)
		.filter((name, i, source) => source.indexOf(name) === i);

	results.forEach(name => {
		const div = document.createElement("div");
		div.className = "list-item";
		div.innerText = name;
		section.append(div);
	});

	count.innerText = `Dat ${classifyNoun(results.length)} er ${results.length}!`;
});