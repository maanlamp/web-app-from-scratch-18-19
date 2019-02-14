import {AbstractSyntaxTree, TagNode, IdNode, ClassNode, AttributeNode, ContentNode} from "./AbstractSyntaxTree.js";

export default class Parser {
	constructor () {
		this.tokens = null;
		this.index = 0;
		this.callcount = 0;
	}

	step (err) {
		this.index += 1;
	}

	peek () {
		return this.tokens[this.index + 1];
	}

	nextTypeIs (expectedTypes) {
		const nextToken = this.peek();
		return [expectedTypes]
			.flat()
			.includes(nextToken.type);
	}

	eat () {
		this.step("eat");
		return this.tokens[this.index];
	}

	gotCalled () {
		this.callcount += 1;
		if (this.callcount > 100) throw new Error("Maximum call stack size exceeded.");
	}

	walk () {
		this.gotCalled();
		let token = this.tokens[this.index];
		console.log("walk", token, this.index);

		if (token.type === "tag") {
			const node = new TagNode(token);

			//add attributes and children.

			this.step();
			return node;
		}

		if (token.type === "id") {
			this.step();
			return new IdNode(token);
		}

		if (token.type === "class") {
			this.step();
			return new ClassNode(token);
		}

		if (token.type === "attribute") {
			this.step();
			return new AttributeNode(token);
		}

		if (token.type === "content") {
			this.step();
			return new ContentNode(token);
		}

		if (token.type === "EOI") throw new Error("End of input reached.");

		//Parser.handleError(message, token);
		console.error("Preceding token:", this.tokens[this.index - 1]);
		throw new Error(`SyntaxError ${token.type} '${token.lexeme}': at line ${token.line}, column ${token.column}.`);
	}

	parse (tokens) {
		this.tokens = tokens;
		const ast = new AbstractSyntaxTree("Document");

		while (this.index < this.tokens.length) ast.body.push(this.walk());

		return ast;
	}
}