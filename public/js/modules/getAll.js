import {range, timeout} from "./utility.js";
import PromiseStream from "./PromiseStream.js";

const APIURL = "https://musicbrainz.org/ws/2";

function createURL (baseURL, options) {
	const URLOptions = Object.entries(options)
		.map(entry => entry.join("="))
		.join("&");

	return `${baseURL}?${URLOptions}`;
}

export default async function getAll (endpoint, options) {
	const headers = {
		mode: "cors",
		"user-agent": "MaanSnoepert/0.1"
	};

	const {count, batchSize} = await fetch(createURL(`${APIURL}/${endpoint}`, options), headers)
		.then(res => res.json())
		.then(json => ({
			count: json.count,
			batchSize: json[`${endpoint}s`].length}))
		.catch(err => console.error("Failed to retrieve required request count.", err));

	if (count === 0) return new PromiseStream([]);

	const batches = Math.ceil(count / batchSize);
	const msRequestPadding = 1000; //I seem to get throttled even with all the precautions :(

	console.log(`Retrieving ${count} items in ${batches} batches. Will take ~${msRequestPadding * batches / 1000}s.`);

	return {
		count,
		promises: range(batches)
			.map((_, i) => timeout(i * msRequestPadding)
				.then(() => fetch(
					createURL(
						`${APIURL}/${endpoint}`,
						Object.assign({offset: i * batchSize}, options)),
					headers)))
		};
}