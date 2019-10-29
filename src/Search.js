import mydb from './indexedDb';

function Search(searchTerm, callback) {
	return mydb.then(dbLib => {
		return dbLib.search(searchTerm);
	})
	.then(({items, next}) => {
		console.log(items, next);
		// const { items = [], next = null} = response;

		console.log('items: ', items);
		return {
			items: items || [],
			next: {
				exists: next ? true : false,
				cursor: next,
				exhausted: next ? false : true
			}
		}
	})
	.then(result => {
		if (callback) callback(null, result);
		return result;
	})
	.catch(error => {
		console.error('error: ', error);
		if (callback) callback(error, null);
		return [];
	})
}

export default Search;