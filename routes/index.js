
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var lineLink = mongoose.model ( 'lineLink' );
 var Author = mongoose.model ('Author' );
 var passport = require( 'passport' );

exports.title = function(req, res) {
  res.render('title');
}

exports.index = function(req, res) {
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
  if(req.user === undefined) {
    res.redirect('/register');
  } else {
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
}
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
  poem.findOne({_id: req.params.id}, 
    function(err, poem, count) {
      lineLink.findOne({ _id:poem.linkID }, 
        function(err, linkOne, count) {
            lineLink.find({originID: poem._id}, function(err, links, count) {
              console.log(links);
              res.render('poempage', {
                poem: poem,
                link: linkOne,
                links: links
              })
            })
      })
  })
}



exports.create = function ( req, res ) {
  var lines = req.body.poemtext.split('\r\n');
  console.log(lines);
	new poem({
		author : req.user.fullName,
    authorUsr : req.user.username,
		title : req.body.poemTitle,
    content : lines,
		created : Date.now(),
    tags : req.body.Tags.split(","),
		}).save(function (err, thispoem, count) {
        req.user.update({$push: {poems: thispoem._id}}, 
          function(err, count, raw) {
          res.redirect('desk');
          }
        )
      })
	};

exports.savelink = function (req, res) { //this saves a new poem written with a line from another poem
  var lines = req.body.poemtext.split('\r\n'); //make array out of user written (new) poem
  var position = req.body.position; //save the position of the user borrowed line
  var ID = req.body.ID
  new poem({
    author : req.user.fullName,       
    authorUsr : req.user.username,
    title : req.body.poemTitle,
    content : lines,
    created : Date.now(),
    tags : req.body.Tags.split(","),
    linkID : ID,
    linkPosition : position
  }).save(function (err, thispoem, count) {
      lineLink.update({_id: thispoem.linkID}, {guestID: thispoem._id, guestAuthor: thispoem.author, guestTitle: thispoem.title },
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
  if(req.user === undefined) {
    res.redirect('/register');
  } else {
  var Line = req.body.lineselect-1;
  var Body = req.body.content.split(',');
  var title = req.body.title;
  var author = req.body.author;
  var lineContent = Body[Line];
  var position = req.body.position;
  var originID = req.body.ID
  poem.update({_id: originID}, {$push: {linkedLines: Line }});
  new lineLink({
    originID: originID,
    originTitle: title,
    originAuthor: author,
    originNum: Line,
    content: lineContent
  }).save(function(err, linelink, count) {
    res.render('newlink', {
      linelink: linelink,
      position: position
    })
  })
}
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
