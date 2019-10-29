const path = require('path');
const fs = require('fs');
const csv = require("csvtojson");

const csvFileName = 'zomato';
const csvFilePath = path.join(__dirname, 'csv', `${csvFileName}.csv`);
const jsonFilePath = path.join(__dirname, 'json', `${csvFileName}.json`);

const mappedKeys = {
	"Address": "address",
	"Aggregate rating": "aggregateRating",
	"Average Cost for two": "averageCost",
	"City": "city",
	"Country Code": "countryCode",
	"Cuisines": "cuisines",
	"Currency": "currency",
	// "Has Online delivery": "",
	// "Has Table booking": "",
	// "Is delivering now": "",
	"Latitude": "latitude",
	"Locality": "locality",
	"Locality Verbose": "localityVerbose",
	"Longitude": "longitude",
	"Price range": "priceRange",
	"Rating color": "ratingColor",
	"Rating text": "ratingText",
	"Restaurant ID": "restaurantId",
	"Restaurant Name": "restaurantName",
	// "Switch to order menu": "",
	"Votes": "votes",
}

csv()
.fromFile(csvFilePath)
.then((entries) => {
	// console.log(entries[0]);

	const updatedEntries = entries.map(entry => {
		// let entryWithNewKeys = {};
		return Object.keys(entry).reduce((updatedEntry, key) => {
			if (mappedKeys[key]) {
				updatedEntry[mappedKeys[key]] = entry[key];
			}

			return updatedEntry;
		}, {})
	});

	// console.log(updatedEntries[0]);
	fs.writeFile(jsonFilePath, JSON.stringify(updatedEntries), 'utf8', (err) => {
		if (err) throw err;
		console.log('The file has been saved');
	})
})