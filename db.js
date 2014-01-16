var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var Poem = new Schema({
    author: String,
    authorUsr: String,
    title: String,
    content: Array,
    created: Date,
    tags: Array,
    linkPosition: String
})

var poem = mongoose.model('poem', Poem);

var Line = new Schema({
	origin: String,
	originTitle: String,
	originUsr: String,
	originAuthor: String,
	content: String,
	links: Array
})

var line = mongoose.model('line', Line);

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