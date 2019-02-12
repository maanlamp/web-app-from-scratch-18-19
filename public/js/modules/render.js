import {extend, stringDedent, HTMLElementDetach, HTMLElementSetInnerHTML} from "./utility.js";

extend({
	"String": {
		dedent: stringDedent
	},
	"HTMLElement": {
		detach: HTMLElementDetach,
		setInnerHTML: HTMLElementSetInnerHTML
	}
});

function parseTemplateLiteral (string, placeholders) {
	return Array()
		.concat(string)
		.map((chunk, i) => {
			return (placeholders[i] !== undefined)
				? chunk + placeholders[i]
				: chunk
		})
		.join("")
		.dedent()
		.trim();
}

export function html (string, ...placeholders) {
	const raw = parseTemplateLiteral(string, placeholders);

	return document
		.createElement("div")
		.setInnerHTML(raw)
		.firstElementChild
		.detach();
}

export function render (container, rawHTML) {
	container.append(html(rawHTML));
}

/* Proposed template syntax
html`
body
	main
		h1
			"Hoeveel artiesten op de wereld heten "
			form
				input[type=text][autofocus][placeholder=...]
			"?"
		h2#count
		section#artists
	footer
		p.italic[class=a][data-custom-x=3] "idk lol"
`
>
<body>
	<main>
		<h1>Hoeveel artiesten op de wereld heten <form><input type="text" autofocus></form> ?</h1>
		<h2 id="count"></h2>
		<section id="artists"></section>
	</main>
</body>
*/