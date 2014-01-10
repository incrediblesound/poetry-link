var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var Poem = new Schema({
    author: String,
    title: String,
    content: String,
    created: Date
})

var poem = mongoose.model('poem', Poem);

var poemLink = new Schema({
	hostPoem: String,
	guestPoems: Array,
	hostLine: Number,
	content: String
})

var pLink = mongoose.model('pLink', poemLink);

var Author = new Schema({
	username: String,
	password: String,
	poems: Array
})

var author = mongoose.model('author', Author);

mongoose.connect('mongodb://localhost/poetry');