
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var pLink = mongoose.model ( 'pLink' );
 var Author = mongoose.model ('Author' );

exports.index = function(req, res){
  poem.find( function(err, poems, count){
	Author.find( function (err, authors, count){
	  res.render('index', { 
  	    title: 'Poetry Link',
        user: req.user,
  	    poems: poems,
  	    authors: authors 
    });
  });
});
}

exports.register = function(req, res) {
  res.render('register', {});
}

exports.postRegister = function(req, res) {
  new Author({
    fullName: req.body.authorName,
    username: req.body.userName,
    password: req.body.password,
    favAuthors: req.body.favorites.split(","),
    joined: Date.now(),
    bio: req.body.bio
  }).save( function( err, Author, count) {
    res.redirect( 'desk' );
  })
}

exports.desk = function(req, res){
  if(!req.user) {
    res.redirect('/login');
  };
	res.render('desk', {
    user: req.user,
		title: 'Writers Desk'
	});
};

exports.authors = function( req, res ) {
  Author.findOne({username: req.params.usrname}, function(err, author, count) {
    res.render('authorpage', {
      author: author
    })
  })
};

exports.poems = function( req, res ) {
  poem.findOne({title: req.params.ttle}, function(err, poem, count) {
    res.render('poempage', {
      poem: poem
    })
  })
};

exports.create = function ( req, res ) {
	new poem({
		author : req.user.fullName,
    authorUsr : req.user.username,
		title : req.body.poemTitle,
		content : req.body.poemtext.split('\r\n'),
		created : Date.now(),
    tags : req.body.Tags.split(","),
		}).save(),
  req.user.update({$push: {poems: req.body.poemTitle}}, function(err, count, raw){
    if(err) return handleError(err);
    res.redirect('/desk');
  })
	}

exports.savelink = function (req, res) {
  var Body = [];
  var line = req.body.line;
  var New = req.body.poemtext.split('\r\n');
  if(req.body.position === 'first') {
    Body.push(line);
    for(i=0;i<New.length;i++){
      Body.push(New[i]);
    }
  } else {
    for(i=0;i<New.length;i++){
      Body.push(New[i]);
    }
    Body.push(line);
  }
  console.log(Body);
  new poem({
    author : req.user.fullName,
    authorUsr : req.user.username,
    title : req.body.poemTitle,
    content : Body,
    created : Date.now(),
    tags : req.body.Tags.split(","),
    }).save(function (err, poem) {
      pLink.update({_id: req.body.ID}, {
        guestID: poem._id 
      }, function (err, count, raw){
        if(err) return res.json(err);
        res.render('desk', {user:req.user, title:'Writers Desk'});
      })
    })
};

exports.logout = function (req,res) {
  req.logout();
  res.redirect('/');
};

exports.linker = function (req,res) {
  var line = req.body.lineselect-1;
  var Body = req.body.content.split(',');
  new pLink({
    hostPoem : req.body.source,
    hostAuthor : req.body.author,
    hostUsr : req.body.username,
    guestpoem : null,
    hostLine : req.body.lineselect,
    position : req.body.position,
    content : Body[line]
  }).save(function (err, link) {
    if(err) {
      res.json(err);
    }
    else {
      res.render('newlink', {
        link: link
      })
    };
  })
};

//search engine functions
exports.search = function ( req, res ) {
  poem.find( function (err, poems){
    var i;
    var k;
    var titles = [];
    var results = [];
    for(i=0;i<poems.length;i++){
      titles.push(poems[i].title);
    }
    var query = req.body.searchQuery.toLowerCase();
    var matches = match(query, titles);
    for(i=0;i<matches.length;i++){
      for(k=0;k<poems.length;k++){
        if(poems[k].title === matches[i]){
          results.push(poems[k]);
        }
      }
    };
  res.render('results', {
    title: 'Poetry Link',
    poems: results
    })
  });
}

var check = function( quer, title ) {
  var x = 0;
  var y = quer.length;
  for( i=0; i<quer.length; i++) {
    if( quer[i] === title[i] ){
      x += 1;
    }
  }
  if( x >= y ) { 
    return true;
  } else {
    return false;
  }
};

var match = function ( string, array ) {
  var i;
  var k;
  var results = [];
  for(i=0;i < array.length; i++) {
    var current = array[i].split(" ");
    if( current.length > 1 ) {       
      for(k=0;k<current.length;k++) {
        if(check( string, current[k].toLowerCase())) {
          results.push( array[i] ); 
          break; 
        }    
      }
    }   
    else {
      if(check( string, array[i].toLowerCase() )) {
        results.push(array[i]);
      }
    }
  }
  return results;
};
//callbacks can be nested indifiniely such that the res.render method has access to all the variables hoobly!!!
