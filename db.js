var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var Poem = new Schema({
    author: String,
    title: String,
    content: Array,
    created: Date
})

var poem = mongoose.model('poem', Poem);

var poemLink = new Schema({
	hostPoem: String,
	guestPoems: Array,
	hostLine: Number,
	content: String,
	tags: Array
})

var pLink = mongoose.model('pLink', poemLink);

var Author = new Schema({
	fullName: String,
	username: { type: String, index: {unique: true} },
	password: String,
	poems: Array,
	favAuthors: Array,
	joined: Date,
	bio: String
});

var Author = mongoose.model('Author', Author);

mongoose.connect('mongodb://localhost/poetry');