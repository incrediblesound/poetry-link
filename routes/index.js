
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var pLink = mongoose.model ( 'pLink' );
 var Author = mongoose.model ('Author' );

exports.index = function(req, res){
  poem.find( function(err, poems, count){
	pLink.find( function (err, links, count){
	  res.render('index', { 
  	    title: 'Poetry Link',
        user: req.user,
  	    poems: poems,
  	    links: links 
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
    bio: req.body.bio
  }).save( function( err, Author, count) {
    res.redirect( 'desk' + req.user );
  })
}

exports.desk = function(req, res){
  if(!req.user) {
    res.redirect('/');
  };
	res.render('desk', {
    user: req.user,
		title: 'Writers Desk'
	});
};

exports.create  = function ( req, res ) {
	new poem({
		author : req.user.fullName,
		title : req.body.poemTitle,
		content : req.body.poemtext,
		created : Date.now(),
    tags : req.body.Tags.split(",")
		}).save(),
  req.user.update({$push: {poems: req.body.poemTitle}}, function(err, count, raw){
    if(err) return handleError(err);
    res.redirect('/desk');
  })
	}

exports.logout = function (req,res) {
  req.logout();
  res.redirect('/');
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
  res.render('index', {
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
