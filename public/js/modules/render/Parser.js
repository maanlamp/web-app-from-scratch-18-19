import {AbstractSyntaxTree, TagNode, IdNode, ClassNode, AttributeNode, ContentNode} from "./AbstractSyntaxTree.js";

export default class Parser {
	constructor () {
		this.tokens = null;
		this.index = 0;
	}

	step () {
		this.index += 1;
	}

	nextToken (tokens, index) {
		this.step();
		return this.tokens[this.index];
	}

	walk (tokens, index) { //implement functional approach instead of class state
		let token = this.tokens[this.index];

		if (token.type === "tag") {
			const node = new TagNode(token);
			token = this.nextToken(tokens, index);

			while (["id", "class", "attribute"].includes(token.type)) {
				console.log(`${node.tagname} > ${token.type}`)
				node.attributes.push(this.walk(tokens, index));
				token = this.nextToken(tokens, index);
			}

			//This shit's broke.
			if (token.type === "INDENT") {
				token = this.nextToken(tokens, index);
				while (token.type !== "DEDENT") {
					node.children.push(this.walk(tokens, index));
					token = this.nextToken(tokens, index);
				}
			}

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

		//Parser.handleError(message, token);
		console.error("Preceding token:", this.tokens[this.index - 1]);
		throw new Error(`SyntaxError ${token.type} '${token.lexeme}': at line ${token.line}, column ${token.column}.`);
	}

	parse (tokens, input) {
		console.log(tokens);
		this.tokens = tokens;
		const ast = new AbstractSyntaxTree("Document");

		// debugger;
		while (this.index < this.tokens.length) ast.body.push(this.walk());

		return ast;
	}
}