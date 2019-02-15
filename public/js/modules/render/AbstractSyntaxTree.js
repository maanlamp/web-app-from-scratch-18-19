export class AbstractSyntaxTree {
	constructor (type) {
		this.type = type;
		this.body = [];
	}
}

class Node {
	constructor (type) {
		this.type = type;
	}
}

export class ExpressionNode extends Node {
	constructor () {
		super("expression");
		this.parent = null;
		this.children = [];
	}
}

export class TagNode extends Node {
	constructor (token) {
		super("tag");
		this.tagname = token.lexeme;
		this.attributes = [];
		this.children = [];
	}
}

export class IdNode extends Node {
	constructor (token) {
		super("attribute");
		this.name = "id";
		this.value = token.lexeme.replace(/^#/, "");
	}
}

export class ClassNode extends Node {
	constructor (token) {
		super("attribute");
		this.name = "class";
		this.value = token.lexeme.replace(/^\./, "");
	}
}

export class AttributeNode extends Node {
	constructor (token) {
		super("attribute");
		const value = token.lexeme.replace(/[\[\]]/g, "");
		this.name = value.match(/^\w+/)[0];
		this.value = value.match(/\w+$/)[0];
	}
}

export class ContentNode extends Node {
	constructor (token) {
		super("content");
		this.value = token.lexeme.replace(/^"|"$/g, "");
	}
}