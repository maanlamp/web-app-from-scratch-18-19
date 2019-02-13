class AbstractSyntaxTree {
	constructor () {
		this.type = "program";
		this.body = [];
	}
}

class Node {
	constructor (parent = null, children = []) {
		this.parent = parent;
		this.children = children;
	}
}

export default class Parser {
	constructor () {
		this.tokens = null;
		this.index = 0;
	}

	static getLineAndColumn (input, index) {
		let i = 0;
		let line = 1;
		let column = 0;
		while (i++ < index) {
			if (input.charAt(i) === "\n") {
				line++;
				column = 0;
			} else {
				column++;
			}
		}
		return {line, column};
	}

	static getErrorLine (input, index) {
		return input
		.substring(input
			.substring(0, index)
			.lastIndexOf("\n") + 1)
		.replace(/\n[\s\S]*/, "")
		.trim();
	}

	static handleError (message, input, index) {
		const {line, column} = Parser.getLineAndColumn(input, index);
		const errorLine = Parser.getErrorLine(input, index);
		throw new Error(`
			${message} at line ${line}, column ${column}.
			${errorLine}
			${" ".repeat(column)}^
		`.trim().replace(/\t+/g, ""));
	}

	get currentToken () {
		return this.tokens[this.index];
	}

	walk () {
		//
		this.index += 1;
		return this.currentToken;
	}

	parse (tokens, input) {
		this.tokens = tokens;
		console.log(tokens);
		const ast = new AbstractSyntaxTree();

		while (this.index < this.tokens.length) {this.walk()}

		return ast;
	}
}