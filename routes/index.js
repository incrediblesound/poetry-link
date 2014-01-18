
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
  }).save(function (err, user) {
    if (err) {
      res.redirect('index');
    } else {
      req.login(user, function (err) {
        if (err) {
          console.log(err)
        }
        res.redirect('desk');
      })
    };
  })
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

//this is the page that displays the info of a particular author
exports.authors = function( req, res ) {
  Author.findOne({username: req.params.usrname}, function(err, author, count) {
    var usrPoems = author.poems;
    poem.find({_id: { $in: usrPoems } }, function(err, poems, count) {
      res.render('authorpage', {
        author: author,
        poems: poems
      })
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
                  res.redirect('desk');
              })
            })
	};

exports.savelink = function (req, res) { //this saves a new poem written with a line from another poem
  var lines = req.body.poemtext.split('\r\n'); //make array out of user written (new) poem
  var position = req.body.position; //save the position of the user borrowed line
  var ID = req.body.ID; //save the _id of the user borrowed line
  new poem({
    author : req.user.fullName,       //create a new poem with no content
    authorUsr : req.user.username,
    title : req.body.poemTitle,
    created : Date.now(),
    tags : req.body.Tags.split(","),
  }).save(function (err, thispoem, count) {
          var i;
          if( position === 'first' ) { //if the borrowed line goes at the beginning of the new poem, push it first
            poem.update( {_id: thispoem._id}, {$push: { content: ID }}, 
              function(err,count,raw){return console.log("pushed first");}) 
          };
              for(i=0;i<lines.length;i++) { //for each new line, save a line and push it into poem.content
                new line({
                  originID: thispoem._id,
                  originTitle: thispoem.title,
                  originUsr: req.user.username,
                  originAuthor: req.user.fullName,
                  content: lines[i]
                }).save(function (err, thisline, count) {
                  poem.update( {_id: thispoem._id}, {$push: { content: thisline._id }},
                    function(err,count,raw){return;})
                });
              }
            if(position === 'last') { poem.update( {_id: thispoem._id}, {$push: { content: ID }}, //!!!this pushes the borrowed line, which should go at the end of the content array, to the BEGINNING of the content array...???
              function(err,count,raw){return console.log("pushed last")})};
            
            line.update({_id: ID}, {$push: { links: thispoem._id }}, //push the _id of the newly saved poem onto the "links" property of the borrowed line
              function(err,count,raw){return;})
            
            req.user.update({$push: {poems: thispoem._id}}, //update user document with _id of new poem 
              function(err, count, raw) {
                  res.redirect('desk'); // go home bitch!!!
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
