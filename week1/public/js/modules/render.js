Object.defineProperty(String.prototype, "dedent", {
	value: function dedent () {
		const indentation = this
			.substring(this.indexOf("\n") + 1)
			.substring(0, this.search(/\S/) - 1);

		return this.replace(new RegExp(`^${indentation}`, "gm"), "");
	}
});

Object.defineProperty(HTMLElement.prototype, "detach", {
	value: function detach () {
		return (this.remove(),
			this.cloneNode(true));
	}
});

Object.defineProperty(HTMLElement.prototype, "setInnerHTML", {
	value: function setInnerHTML (value) {
		this.innerHTML = value;
		return this;
	}
});

export function html (string, ...placeholders) {
	const raw = Array()
		.concat(string)
		.map((chunk, i) => {
			return (placeholders[i] !== undefined)
				? chunk + placeholders[i]
				: chunk
		})
		.join("")
		.dedent()
		.trim();

	return document
		.createElement("div")
		.setInnerHTML(raw)
		.firstElementChild
		.detach();
}

export function render (container, rawHTML) {
	container.append(html(rawHTML));
}