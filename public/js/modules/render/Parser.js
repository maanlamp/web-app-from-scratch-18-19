import {AbstractSyntaxTree, TagNode, IdNode, ClassNode, AttributeNode, ContentNode, ExpressionNode} from "./AbstractSyntaxTree.js";

export default class Parser {
	constructor () {
		this.reset();
	}

	reset () {
		this.tokens = null;
		this.index = 0;
		this.callcount = 0;
	}

	gotCalled () {
		if (this.callcount > 100) throw new Error("Maximum call stack size exceeded.");
		this.callcount += 1;
	}

	step (msg) {
		if (msg) console.log(msg);
		this.index += 1;
	}

	currentToken () {
		return this.tokens[this.index];
	}

	eat (msg) {
		console.log(msg, this.currentToken());
		this.step("eat");
		return this.currentToken();
	}

	peek (msg) {
		if (msg) console.log(msg);
		return this.tokens[this.index + 1];
	}

	walk () {
		this.gotCalled();
		const token = this.currentToken();

		if (token.type === "tag") return this.parseExpression(token);

		throw new SyntaxError(`Unexpected token '${token.type}': '${token.lexeme}' at line x, column y.`);
	}
	
	expect (type, cb) {
		const nextToken = this.peek();
		if (type instanceof Array) {
			while (type.includes(nextToken.type)) cb(this.eat("expect " + type));
			return;
		} else {
			if (nextToken.type === type) return void cb(this.eat("expect " + type));
		}

		const msg = (typeof type === "string")
			? type
			: type.slice(0, -1).join(", ") + " or " + type.slice(-1);
		throw new SyntaxError(`Expected ${msg} at line x, column y.`);
	}

	expectOptional (type, cb) {
		const nextToken = this.peek();
		if (type instanceof Array) {
			while (type.includes(nextToken.type)) cb(this.eat("optional " + type));
			return;
		} else {
			if (nextToken.type === type) return void cb(this.eat("optional " + type));
		}
	}

	expectNot (type, cb) {
		const nextToken = this.peek();
		if (type instanceof Array) {
			while (!type.includes(nextToken.type)) cb(this.eat("expect not " + type));
			return;
		} else {
			if (nextToken.type !== type) return void cb(this.eat("expect not " + type));
		}

		throw new SyntaxError(`Unexpected ${nextToken.type} at line x, column y.`);
	}

	parseExpression (token) {
		this.gotCalled();
		const node = new ExpressionNode();
		node.parent = new TagNode(token);

		this.expect("id", token => {
			node.parent.attributes.push(new IdNode(token));
		});

		this.expect(["class", "attribute"], token => {
			switch (token.type) {
				case "class": {node.parent.attributes.push(new ClassNode(token)); break;}
				case "attribute": {node.parent.attributes.push(new AttributeNode(token)); break;}
			}
		});

		//Allow struct: tag... "content" \n...
		this.expectOptional("content", token => {
			node.parent.children.push(new ContentNode(token));
		});

		this.expectOptional("INDENT", () => {
			this.expectNot("DEDENT", token => {
				node.children.push(this.parseExpression(token));
			});
		});

		this.step("end of expression");
		return node;
	}

	parse (tokens) {
		this.tokens = tokens;
		const ast = new AbstractSyntaxTree("Document");

		while (this.index < this.tokens.length) ast.body.push(this.walk());

		this.reset();
		return ast;
	}
}