export default class PromiseStream {
	constructor (array) {
		// if (array.length === 0) throw new Error("Cannot stream 0 promise resolvements.");
		this.promises = array;
	}

	prepend (...values) {
		this.promises.unshift(...values);
		return this;
	}

	append (...values) {
		this.promises.push(...values);
		return this;
	}

	insert (position, ...values) {
		if (values.length === 0) return this.append(position);
		this.promises.splice(index, 0, ...values);
		return this;
	}

	foreach (callback) { //.then everything, not waiting for previous
		this.promises = this.promises
			.map((promise, index, source) => promise
				.then(value => callback(value, index, source)));

		return this;
	}

	foreachOrdered (callback) { //.then everything, waiting for previous, not passing val of prev cb
		//Refactor this horrible mess...
		const temp = [];
		this.promises.reduce((prev, promise, index, source) => {
			const tempPromise = prev.then(async () => await callback(await promise, index, source));
			temp.push(tempPromise);
			return tempPromise;
		}, Promise.resolve());
		this.promises = temp;

		return this;
	}

	then (callback) {
		return Promise.all(this.promises).then(callback);
	}

	catch (callback) {
		this.promises = this.promises
			.map((promise, index, source) => promise
				.catch(async error => await callback(error, index, source)));

		return Promise.all(this.promises);
	}
}