export function stringDedent () {
	const indentation = this
		.substring(this.indexOf("\n") + 1)
		.substring(0, this.search(/\S/) - 1);

	return this.replace(new RegExp(`^${indentation}`, "gm"), "");
}

export function HTMLElementDetach () {
	this.remove();
	return this.cloneNode(true);
}

export function HTMLElementSetInnerHTML (value) {
	this.innerHTML = value;
	return this;
}

export function range (count) {
	return [...Array(count).keys()];
}

export function timeout (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function arrayMapAsync (callback) {
	return Promise.all(this.map(callback));
}

function getPrototypeOf (value) {
	return window[value].prototype || window[value];
}

export function extend (options) {
	Object.entries(options)
		.forEach(([object, properties]) => {
			if (window[object] === undefined) throw new Error(`Class '${object}' does not exist.`);

			Object.entries(properties)
				.forEach(([alias, value]) => Object.defineProperty(
					getPrototypeOf(object), alias, {value}));
		});
}

export function arrayLast (length = 1) {
	return this.slice(-length);
}

export function setInnerText (selection, text) {
	((typeof selection === "string")
		? document.querySelector(selection)
		: selection
	).innerText = text;
}

export function HTMLElementSetInnerText (value) {
	this.innerText = value;
	return this;
}

export function arrayDeduplicate () {
	return [...new Set(this)];
}

export function arraySplit (array, separator) {
	const chunks = [];
	const splitHere = Symbol("Split here");
	const arrWithDelimiters = array.map(item => {
		if (typeof separator === "function" && separator(item)) return splitHere;
		if (separator === item) return splitHere;
		return item;
	});
	[splitHere, ...arrWithDelimiters]
		.forEach(item => {
			if (item === splitHere) return chunks.push([]);
			chunks[chunks.length - 1].push(item);
		});

	return chunks;
}