export default class IndentStack {
	constructor () {
		this.stack = [0];
	}

	last () {
		return this.stack[this.stack.length - 1];
	}

	push (values) {
		this.stack.push(values);
	}

	pop () {
		if (this.stack.length === 1) throw new Error("Do not pop the base indent level.");
		return this.stack.pop();
	}

	contains (value) {
		return this.stack.includes(value);
	}

	clear (foreach) {
		while (this.stack.length > 1) {
			foreach(this.pop());
		}
	}
}