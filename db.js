var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var Poem = new Schema({
    author: String,
    authorUsr: String,
    title: String,
    content: Array,
    created: Date,
    tags: Array,
    linkedLines: Array,
    linkID: {type: String, default: null},
    linkPosition: {type: String, default: null}
})

var poem = mongoose.model('poem', Poem);

var LineLink = new Schema({
	originID: String,
	originTitle: String,
	originAuthor: String,
	originNum: Number,
	content: String,
	guestAuthor: String,
	guestTitle: String,
	guestID: String
})

var lineLink = mongoose.model('lineLink', LineLink);

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