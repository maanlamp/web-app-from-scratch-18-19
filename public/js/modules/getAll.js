import {extend, range, timeout, arrayMapAsync} from "./utility.js";

const APIURL = "https://musicbrainz.org/ws/2";

function createURL (baseURL, options) {
	const URLOptions = Object.entries(options)
		.map(entry => entry.join("="))
		.join("&");

	return `${baseURL}?${URLOptions}`;
}

extend({
	"Array": {
		mapAsync: arrayMapAsync
	}
});

export default async function getAll (endpoint, options) {
	const headers = {
		mode: "cors",
		"user-agent": "snoopr/0.1" //User-agent is required for more lenient throttling
	};

	const {count, batchSize} = await fetch(createURL(`${APIURL}/${endpoint}`, options), headers)
		.then(res => res.json())
		.then(json => ({
			count: json.count,
			batchSize: json[`${endpoint}s`].length}))
		.catch(err => console.error("Failed to retrieve required request count.", err));

	const batches = Math.ceil(count / batchSize);
	const msRequestPadding = 1000; //I seem to get throttled even with all the precautions :(

	console.log(`Retrieving ${count} items in ${batches} batches. Will take ~${msRequestPadding * batches / 1000}s.`);
	await timeout(50); //Precautionary timeout to not get throttled

	return range(batches)
		.mapAsync((_, i) => timeout(i * msRequestPadding) //API allows ~50 reqs/sec (~=20ms/req) if you comply to their throttling guidelines
			.then(() => fetch(
				createURL(
					`${APIURL}/${endpoint}`,
					Object.assign({offset: i * batchSize}, options)),
				headers)))
		.then(responses => responses
			.mapAsync(res => res.json())
			.then(jsons => jsons
				.map(json => json[`${endpoint}s`])
				.flat()))
		.catch(console.error);
}