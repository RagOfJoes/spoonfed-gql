const cuid = require('cuid');
// Example
// input = "I'm a little Tea Pot Short & Stout"
// From: https://medium.com/gatemill/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
const genSlug = title => `${slugify(title)}-${cuid.slug()}`;

// This function creates a slugified version of the title
// This benchmark says you should add /y to the end: https://jsperf.com/sluggification/1
const slugify = string => {
	const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
	const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
	const p = new RegExp(a.split('').join('|'), 'g');

	return string
		.toString()
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters in a with b
		.replace(/&/g, '-and-') // Replace & with ‘and’
		.replace(/[^\w-]+/g, '') // Remove all non-word characters such as spaces or tabs
		.replace(/--+/g, '-') // Replace multiple — with single -
		.replace(/^-+/, '') // Trim — from start of text
		.replace(/-+$/, ''); // Trim — from end of text
};

module.exports = genSlug;
