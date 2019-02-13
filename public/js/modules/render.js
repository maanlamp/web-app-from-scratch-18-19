import Lexer from "./render/Lexer.js";
import Parser from "./render/Parser.js";
import Compiler from "./render/Compiler.js";

function parseTemplateLiteral (string, placeholders) {
	return Array()
		.concat(string)
		.map((chunk, i) => {
			return (placeholders[i] !== undefined)
				? chunk + placeholders[i]
				: chunk
		})
		.join("")
		.trim();
}

const lexer = new Lexer();
lexer
	.ignore("whitespace", /[\r\f\v]+/)
	.rule("newline", /\n/)
	.rule("tab", new RegExp(`\\t| {${lexer.tabsize}}`))
	.rule("space", / /)
	.rule("tag", /\w+/)
	.rule("content", /"[^"]*"/)
	.rule("class", /\.\w+/)
	.rule("id", /#\w+/)
	.rule("attribute", /\[\w+(?:=.+?)?\]/);

const parser = new Parser();
const compiler = new Compiler();

export function html (string, ...placeholders) {
	const raw = parseTemplateLiteral(string, placeholders);
	console.log(raw);
	const tokens = lexer.lex(raw);
	const ast = parser.parse(tokens, raw);
	const html = compiler.compile(ast, raw);

	return html;
}

export function render (el, html) {
	el.innerHTML = html;
}

console.log(html`
main
	h1
		"Hoeveel artiesten op de wereld heten "
		form
			input[type=text][autofocus]
		"?"
	h2#count
	section#artists
`);