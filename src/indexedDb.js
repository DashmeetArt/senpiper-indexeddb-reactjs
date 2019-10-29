import restaurantData from './data/json/zomato.json';

class MyDB {
	constructor(name, version, storeName) {
		this.name = name;
		this.version = version;
		this.storeName = storeName;
		this.db = undefined;

		this.connect = this.connect.bind(this);
		this.addItems = this.addItems.bind(this);
	}

	connect(upgradeNeeded) {
		return new Promise(async (resolve, reject) => {
			const request = indexedDB.open(this.name, this.version);
			request.onerror = (event) => {
				console.log('error', event);
			}

			if (upgradeNeeded && typeof upgradeNeeded === 'function') {
				request.onupgradeneeded = (event) => {
					console.log('upgrade');
					upgradeNeeded(event.target.result, () => {
						this.db = event.target.result;
					})
				}
			}

			request.onsuccess = (event) => {
				this.db = event.target.result;
				console.log('success');
				resolve(this);
			}
		})
	}

	_getStoreTransaction(mode) {
		return this.db.transaction(this.storeName, mode)
		.objectStore(this.storeName);
	}

	addItems(items) {
		const store = this._getStoreTransaction('readwrite');
		const colorMapping = {
			'Red': '#E53935',
			'Yellow': '#FDD835',
			'Orange': '#FB8C00',
			'Green': '#7CB342',
			'Dark Green': '#1B5E20',
		}

		items.forEach(item => {
			const {
				restaurantId: id,
				restaurantName: name,
				city,
				locality,
				ratingColor,
				ratingText,
				aggregateRating,
				cuisines
			} = item;

			const newItem = {
				id,
				name,
				address: {
					city,
					street: locality
				},
				rating: {
					color: colorMapping[ratingColor] || '#E1E1E1',
					text: ratingText,
					average: aggregateRating
				},
				cuisines
			}
			store.put(newItem);
		})
	}

	search(term, { next, group, hasNext }, callback) {
		const indexes = ['name', 'meta'];
		return new Promise((resolve, reject) => {
			let i = 0;
			let items = [];
			let limit = 50;
			let reg = new RegExp(`(${term})`, 'gi');

			let store = this._getStoreTransaction('readonly');

			let indexName = (next && next.index && term !== "") ? next.index : 'name';
			let indexNumber = indexes.findIndex(i => i === indexName);

			const storeCursor = next && next.key ?
				store.index(indexName).openCursor(IDBKeyRange.lowerBound(next.key)) :
				store.index(indexName).openCursor();
			
			storeCursor.onsuccess = function(event) {
				let cursor = event.target.result;
				if (cursor && i < limit) {
					if (term === '' || (term !== '' && cursor.key.find(k => k.match(reg)))) {
						i++;
						items.push(cursor.value)
					}
					
					cursor.continue();
				} else {
					const nextIndexName = term !== "" && indexes[indexNumber+1] ? indexes[indexNumber+1] : undefined;
					const hasNext = cursor ? true : (nextIndexName ? true : false);
					const next = {
						key: cursor && cursor.key,
						index: cursor ? indexName : nextIndexName
					}
						
					const response = {
						items,
						cursor: {
							group: indexName,
							hasNext,
							term,
							next
						}
					}

					if (callback) callback(null, response);
					resolve(response);
				}
			}
		})
	}
}

const mydb = (async function() {
	const DB_NAME = 'zomato';
	const DB_VERSION = '1';
	const STORE_NAME = 'restaurants';

	const dbLib = new MyDB(DB_NAME, DB_VERSION, STORE_NAME);
	await dbLib.connect((db, oncomplete) => {
		if (!db.objectStoreNames.contains(dbLib.storeName)) {
			let store = db.createObjectStore(dbLib.storeName, { keyPath: "id" });

			store.createIndex('meta', ['id', 'cuisines', 'address.city', 'address.street'], { unique: false });
			store.createIndex('name', ['id', 'name'], { unique: false });
			store.transaction.oncomplete = async (event) => {
				if (oncomplete && typeof oncomplete === 'function') await oncomplete();
				dbLib.addItems(restaurantData);
			}
		}
	})
	
	window.dbLib = dbLib;	
	return dbLib;
})()

function getRestaurants(term, options, callback) {
	return mydb.then(dbLib => {
		return dbLib.search(term, options);
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

function search(term, callback) {
	getRestaurants(term, {}, callback);
	return;
}

function next({term, next, group, hasNext}, callback) {
	getRestaurants(term, {next, group, hasNext}, callback);
	return;
}

export default {
	search,
	next
};