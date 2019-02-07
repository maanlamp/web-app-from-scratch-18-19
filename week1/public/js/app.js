const main = document.querySelector("main");
const APIURL = "https://musicbrainz.org/ws/2";

function createURL (baseURL, options) {
	const URLOptions = Object.entries(options)
		.map(entry => entry.join("="))
		.join("&");

	return `${baseURL}?${URLOptions}`;
}

function range(count) {
	return Array.apply(null, Array(count)); // Weird way of getting dense array filled with undefined
}

function timeout (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

Object.defineProperty(Array.prototype, "mapAsync", {
	value: function mapAsync (callback) {
		return Promise.all(this.map(callback));
	}
});

async function getAll (endpoint, options) {
	const headers = {
		mode: "cors",
		"user-agent": "snoopr/0.1" //User-agent is required for more lenient throttling
	};

	const {count, chunkSize} = await fetch(createURL(`${APIURL}/${endpoint}`, options), headers)
		.then(res => res.json())
		.then(json => ({
			count: json.count,
			chunkSize: json[`${endpoint}s`].length}))
		.catch(err => console.error("Failed to retrieve required request count.", err));

	const batches = Math.ceil(count / chunkSize);
	const msRequestPadding = 1000; //I seem to get throttled even with all the precautions :(

	console.log(`Retrieving ${count} items in ${batches} batches. Will take ~${msRequestPadding * batches / 1000}s.`);
	await timeout(50); //Precautionary timeout to not get throttled

	return range(batches)
		.mapAsync((_, i) => timeout(i * msRequestPadding) //API allows ~50 reqs/sec (~=20ms/req) if you comply to their throttling guidelines
			.then(() => fetch(
				createURL(
					`${APIURL}/${endpoint}`,
					Object.assign({offset: i * chunkSize}, options)),
				headers)))
		.then(responses => responses
			.mapAsync(res => res.json())
			.then(jsons => jsons
				.map(json => json[`${endpoint}s`])
				.flat()))
		.catch(console.error);
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
		.filter(artist => artist.name.split(" ")[0].toLowerCase() === input.value.toLowerCase()) //Should filter by ID
		.map(artist => artist.name)
		.filter((name, i, source) => source.indexOf(name) === i); //deduplicate

	results.forEach(name => {
		const div = document.createElement("div");
		div.className = "list-item";
		div.innerText = name;
		section.append(div);
	});

	count.innerText = `Dat ${classifyNoun(results.length)} er ${results.length}!`;
});