import IndentStack from "./IndentStack.js";
import {arraySplit} from "../utility.js";

class LexicalToken {
	constructor (type, lexeme = "", index = -1) {
		this.type = type;
		this.lexeme = lexeme;
		this.index = index;
	}
}

export default class Lexer {
	constructor (tabsize = 2) {
		this.rules = new Map();
		this.ignorables = new Map();
		this.tabsize = tabsize;
	}

	rule (type, grammar) {
		if (!(grammar instanceof RegExp)) throw new Error(`Cannot register a rule of type '${grammar.constructor.name}'.`);

		this.rules.set(type, grammar);
		return this;
	}

	ignore (type, grammar) {
		if (!(grammar instanceof RegExp)) throw new Error(`Cannot ignore a rule of type '${grammar.constructor.name}'.`);

		this.ignorables.set(type, grammar);
		return this;
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
		.replace(/\n[\s\S]*/, "");
	}

	static handleError (message, input, index) {
		const {line, column} = Lexer.getLineAndColumn(input, index);
		const errorLine = Lexer.getErrorLine(input, index);
		throw new Error(`
			${message} at line ${line}, column ${column}.
			${errorLine}
			${" ".repeat(column)}^
		`.trim().replace(/\t+/g, ""));
	}

	static getLexeme (grammar, input) {
		const match = input.match(grammar);
		if (match === null) return null;
		const {index} = match;
		const [lexeme] = match;
		return (index === 0) ? lexeme : null;
	}

	lex (input) {
		const tokens = [];
		let index = 0;
		while (index < input.length) {
			this.ignorables.forEach(grammar => {
				const ignorable = Lexer.getLexeme(grammar, input.slice(index));
				if (ignorable !== null) index += ignorable.length;
			});

			const lastTokensLength = tokens.length;
			let _continue = false; //Cannot continue in iterable
			this.rules.forEach((grammar, type) => {
				if (_continue) return;
				const lexeme = Lexer.getLexeme(grammar, input.slice(index));
				if (lexeme !== null) {
					tokens.push(new LexicalToken(type, lexeme, index));
					index += lexeme.length;
					_continue = true;
				}
			});
			if (tokens.length === lastTokensLength) Lexer.handleError("Unknown lexeme", input, index);
		}

		return Lexer.validateIndentation(input, tokens);
	}

	static validateIndentation (input, tokens) {
		const indentStack = new IndentStack(0);
		const lines = arraySplit(tokens, token => token.type === "newline")
			.map(line => line.concat(new LexicalToken("newline"))) //Add back a newline, instaead I should make arraySplit allow inclusive splitting
			.map(line => {
				const currIndent = line.reduce((indent, token) => indent + (token.type === "tab"), 0);
				if (currIndent > indentStack.last()) {
					indentStack.push(currIndent);
					line.unshift(new LexicalToken("INDENT"));
				} else if (currIndent < indentStack.last()) {
					if (!indentStack.contains(currIndent)) Lexer.handleError("Inconsistent indent", input, line[0].index);
					while (currIndent < indentStack.last()) {
						indentStack.pop();
						line.unshift(new LexicalToken("DEDENT"));
					}
				}
				return line;
			});
		indentStack.clear(() => lines[lines.length - 1].push(new LexicalToken("DEDENT")));

		return lines
			.flat()
			.filter(token => !["tab", "newline"].includes(token.type));
	}
}