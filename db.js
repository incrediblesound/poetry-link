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
	guestID: {type: String, default: null}
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

var News = new Schema({
	originID: String,
	newpoemID: {type: String, default: null},
	origintitle: String,
	newtitle: String,
	originauthor: String,
	newauthor: String,
	datetime: Date
})

var news = mongoose.model('news', News);

mongoose.connect('mongodb://localhost/poetry')
//mongoose.connect('mongodb://nodejitsu:b46129259f46a910f907955e9619f7da@troup.mongohq.com:10065/nodejitsudb6359946045/poetrylink')
