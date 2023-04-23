#! /usr/bin/env node;

const fs = require('fs')
const dataFile = 'src/jarData.json';

class Jar {
	constructor() {
		this.tipsArray = [];
		this.jarTags = [];
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
					this.jarTags.push(tag);
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
			jarTags: this.jarTags,
		});
		fs.writeFileSync(dataFile, jString, { flag: "w" });
	}

	tipToJSON(tip) {
		return {
			name: tip.name,
			description: tip.description,
			tags: tip.tags,
			links: tip.links,
		};
	}

	addTip(newTip) {
		this.tipsArray.push(newTip);

		newTip.tags.forEach(tag => {
			if (!this.jarTags.includes(tag)) {
				this.jarTags.push(tag);
			}
		});
		this.save();
	}

	deleteTip(tipToDelete) {
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

}//class Jar



class Tip {
	constructor(name, description = '', tags = [], links = []) {
		this.name = name;
		this.description = description;
		this.tags = tags;
		this.links = links;
	}

	setName(newName) {
		this.name = newName;
	}

	setDescription(newDescription) {
		this.description = newDescription;
	}

	setLinks(newLinks) {
		newLinks.forEach(link => {
			if (!this.links.includes(link)) {
				this.links.push(link);
			}
		});
	}

	setTags(newTags) {
		newTags.forEach(tag => {
			if (!this.tags.includes(tag)) {
				this.tags.push(tag);
			}
		});
	}
}



module.exports = { Tip, Jar };
