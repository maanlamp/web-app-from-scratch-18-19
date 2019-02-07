Object.defineProperty(String.prototype, "dedent", {
	value: function dedent () {
		const indentation = this
			.substring(this.indexOf("\n") + 1)
			.substring(0, this.search(/\S/) - 1);

		return this.replace(new RegExp(`^${indentation}`, "gm"), "");
	}
});

function html (string, ...placeholders) {
	const chunks = [].concat(string);
	const raw = chunks
		.map((chunk, i) => {
			return (placeholders[i] !== undefined)
				? chunk + placeholders[i]
				: chunk
		})
		.join("")
		.dedent()
		.trim();

	const temp = document.createElement("div");
	temp.innerHTML = raw;
	return (temp.children.length > 1) ? temp.children : temp.lastChild;
}

function render (container, rawHTML) {
	container.append(html(rawHTML));
}