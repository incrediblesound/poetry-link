var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var Poem = new Schema({
    author: String,
    authorUsr: String,
    title: String,
    content: Array,
    created: Date,
    tags: Array
})

var poem = mongoose.model('poem', Poem);

var poemLink = new Schema({
	hostPoem: String,
	hostAuthor: String,
	hostUsr: String,
	guestPoem: String,
	guestID: String,
	hostLine: Number,
	position: String,
	content: String
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