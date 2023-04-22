#! /usr/bin/env node;

const fs = require('fs')
const dataFile = 'src/jarData.json';

class Jar {
	constructor() {
		this.tipsArray = [];
		this.jarTags = new Set();
		this.printedIndex;
		this.load();
	}

	load() {
		try {
			const file = fs.readFileSync(dataFile);
			const jarData = JSON.parse(file);

			if (jarData.tipsArray && jarData.tipsArray.length > 0) {
				jarData.tipsArray.forEach(tip => {
					const newTip = new Tip(tip.name, tip.description, tip.tags, tip.links);
					this.tipsArray.push(newTip);
				});
			}

			if (jarData.jarTags && jarData.jarTags.length > 0) {
				jarData.jarTags.forEach(tag => {
					this.jarTags.add(tag);
				});
			}
		} catch (err) {
			if (fs.readFileSync(dataFile).length === 0) {
			} else {
				console.error(`Error loading jarData.json: ${err.message}`);
			}
		}
	}

	save() {
		const jString = JSON.stringify({
			tipsArray: this.tipsArray.map(tip => this.tipToJSON(tip)),
			jarTags: [...this.jarTags],
		});
		fs.writeFileSync(dataFile, jString, { flag: "w" });
		//this.load();
	}

	tipToJSON(tip) {
		return {
			name: tip.name,
			description: tip.description,
			tags: [...tip.tags],
			links: [...tip.links],
		};
	}

	addTip(newTip) {
		this.tipsArray.push(newTip);

		newTip.tags.forEach(tag => {
			if (!this.jarTags.has(tag) && tag.replace(/\s/g, '') !== '') {
				this.jarTags.add(tag);
			}
		});
		this.save();
	}

	deleteTip(tipToDelete) {
		// const tipToDelete = this.tipsArray.find(tip => (tip.index === printedIndex))
		const indexToDelete = this.tipsArray.indexOf(tipToDelete);
		this.tipsArray.splice(indexToDelete, 1);
	}

	overWriteTip(tip, name, description, tags, links) {
		tip.setName(name);
		tip.setDescription(description);
		tip.setTags(tags);
		tip.setLinks(links);
		this.save();
	}

	getTipsBySearch(query) {
		const matchingTips = [];
		let tipsToSearch = this.tipsArray;
		query = query.toLowerCase();

		for (const tip of tipsToSearch) {
			if ((tip.name.toLowerCase().includes(query))
				|| (tip.description.toLowerCase().includes(query))
				|| (tip.tags.has(query))
				|| (typeof tip.links === 'string' && tip.links.toLowerCase().includes(query))) {
				matchingTips.push(tip);
			}
		}
		return matchingTips;
	}

	getTipsByTags(tags) {
		const matchingTips = [];

		for (const tip of this.tipsArray) {
			for (const tag of tags) {
				if (tip.tags.has(tag)) {
					matchingTips.push(tip);
				}
			}
		}
		return matchingTips;
	}

	getRandomTip() {
		const randomIndex = Math.floor(Math.random() * this.tipsArray.length);
		return this.tipsArray[randomIndex];
	}

}//class Jar



class Tip {
	constructor(name, description = '', tags = [], links = []) {
		this.name = name;
		this.description = description;
		this.tags = new Set(tags);
		this.links = new Set(links);
	}

	setName(newName) {
		this.name = newName;
	}

	setDescription(newDescription) {
		this.description = newDescription;
	}

	setLinks(newLinks) {
		newLinks.forEach(link => {
			if (!this.links.has(link)) {
				this.links.add(link);
			}
		});
	}

	setTags(newTags) {
		newTags.forEach(tag => {
			if (!this.tags.has(tag)) {
				this.tags.add(tag);
			}
		});
	}

}//class Tip


module.exports = { Tip, Jar };
