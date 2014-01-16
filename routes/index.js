
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var line = mongoose.model ( 'line' );
 var Author = mongoose.model ('Author' );
 var passport = require( 'passport' );

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
  }).save()
  res.render('/');
};

exports.desk = function(req, res){
  Author.findOne({username: req.user.username}, function(err, author, count){
    var usrPoems = author.poems;
    console.log(usrPoems);
    poem.find({_id: { $in: usrPoems } }, function(err, poems, count){
      res.render('desk', {
        user: req.user,
        author: author,
        poems: poems
        });
    })
  })
};

exports.authors = function( req, res ) {
  Author.findOne({username: req.params.usrname}, function(err, author, count) {
    res.render('authorpage', {
      author: author
    })
  })
};

//this is the page for displaying a single poem
exports.poems = function( req, res ) {
  poem.findOne({_id: req.params.id}, function(err, poem, count) {
    //console.log(poem);
    var Lines = poem.content;
    line.find({ _id:{ $in: Lines } }, function(err, lines, count) {
      //console.log(lines);
      res.render('poempage', {
        poem: poem,
        lines: lines
      });
    })
  })
};

exports.create = function ( req, res ) {
	new poem({
		author : req.user.fullName,
    authorUsr : req.user.username,
		title : req.body.poemTitle,
		created : Date.now(),
    tags : req.body.Tags.split(","),
		}).save(function (err, thispoem, count) {
              var lines = req.body.poemtext.split('\r\n');
              console.log(lines);
              for(i=0;i<lines.length;i++) {
                new line({
                  originID: thispoem._id,
                  originTitle: thispoem.title,
                  originUsr: req.user.username,
                  originAuthor: req.user.fullName,
                  originNum: i,
                  content: lines[i]
                  }).save(function (err, thisline, count) {
                    poem.update( {_id: thispoem._id}, {$push: { content: thisline._id }}, function(err,count,raw){return;})
                  });
              };
              req.user.update({$push: {poems: thispoem._id}}, function(err, count, raw) {
                  res.render('desk', {
                  user: req.user,
                  poems: req.user.poems
                  })
              })
            })
	};

exports.savelink = function (req, res) {
  var New = req.body.poemtext.split('\r\n');
  var position = req.body.position;
  var ID = req.body.ID;
  new poem({
    author : req.user.fullName,
    authorUsr : req.user.username,
    title : req.body.poemTitle,
    created : Date.now(),
    tags : req.body.Tags.split(","),
  }).save(function (err, thispoem, count) {
          var i;
          if( position === 'first' ) {
            poem.update( {_id: thispoem._id}, {$push: { content: ID }}, function(err,count,raw){return console.log("pushed first");})
          };
          var lines = req.body.poemtext.split('\r\n');
              for(i=0;i<lines.length;i++) {
                new line({
                  originID: thispoem._id,
                  originTitle: thispoem.title,
                  originUsr: req.user.username,
                  originAuthor: req.user.fullName,
                  content: lines[i]
                }).save(function (err, thisline, count) {
                  poem.update( {_id: thispoem._id}, {$push: { content: thisline._id }}, function(err,count,raw){return;})
                });
              }
            if( position === 'last' && i === lines.length ) {poem.update( {_id: thispoem._id}, {$push: { content: ID }}, function(err,count,raw){return console.log("pushed last")})};
            line.update({_id: ID}, {$push: { links: thispoem._id }}, function(err,count,raw){return;})
            req.user.update({$push: {poems: thispoem._id}}, function(err, count, raw) {
                  res.render('desk', {
                  user: req.user,
                  poems: req.user.poems
                  })
              })
          })
};

exports.logout = function (req,res) {
  req.logout();
  res.redirect('/');
};

exports.linker = function (req,res) {
  var Line = req.body.lineselect-1;
  var Body = req.body.content.split(',');
  var originLine = Body[Line];
  var position = req.body.position;
  line.findOne({_id: originLine}, function(err, line, count) {
    res.render('newlink', {
      link: line,
      position: position
    })
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

//find the three lines with the most links
var topThreeLines = function(){
var lines = line.find(function (err, lines) { return lines; })
  var L = 0;
  var one;
  var two;
  var three;
  for(i=0;i<lines.length;i++) {
    if(lines[i].links.length > L) {
      L = lines[i].links.length;
      two = one;
      three = two;
      one = lines[i]._id; 
    }
  }
  return ({one: one, two: two, three: three});
}
//callbacks can be nested indifiniely such that the res.render method has access to all the variables hoobly!!!
