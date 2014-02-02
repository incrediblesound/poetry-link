
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var lineLink = mongoose.model ( 'lineLink' );
 var Author = mongoose.model ('Author' );
 var passport = require( 'passport' );
 var news = mongoose.model( 'news' );

exports.title = function(req, res) {
  res.render('title');
}

exports.about = function(req, res) {
  res.render('about');
}

exports.manage = function(req, res) {
  poem.find({_id: {$in: req.user.poems}}, 
    function (err, poems, count) {
      res.render('manage', {
        author: req.user,
        poems: poems
    });
  })
}

exports.Delete = function(req, res) {
  var checked = req.body.poemselect;
  poem.remove({_id: checked},
    function (err, count, raw) {
      lineLink.remove({guestID: checked},
        function (err, count, raw) {
            var check = inside(checked, req.user.poems);
            Author.update({_id: req.user._id}, {$pull: {poems: check}}).exec(function (err, data) {
            res.redirect('/manage')
          })
        })    
      });
}

exports.stats = function(req, res) {
  poem.find( function (err, poems, count) {
    Author.find( function (err, authors, count2) {
      //console.log(authors)
      var poemStats = mostLinkedPoems( poems );
      var authorStats = mostProductiveAuthor( authors );
      //console.log(poemStats);
      //console.log(authorStats);
      res.render('stats', {
        poemStats: poemStats,
        authorStats: authorStats
      })
    })
  })
}

exports.index = function(req, res) {
  poem.find().sort({created:-1}).limit(15).exec( function (err, poems, count) {
	Author.find().sort({joined:-1}).limit(15).exec( function (err, authors, count) {
    lineLink.remove({guestID: null}, function (err, data) {
      news.remove({newpoemID: null}, function (err, data) {
	      res.render('index', { 
          title: 'Poetry Link',
          user: req.user,
          poems: poems,
          authors: authors 
        })
      })
    })
  })
})
};

exports.register = function(req, res) {
  res.render('register', {});
}

exports.postRegister = function(req, res) {
  new Author({
    fullName: req.body.authorName,
    username: req.body.userName,
    password: req.body.password,
    favAuthors: req.body.favorites.split(", "),
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
  Author.findOne({username: req.user.username}, function (err, author, count) {
    var usrPoems = author.poems;
    poem.find({_id: { $in: usrPoems } }, function (err, poems, count) {
      news.find({originID: { $in: usrPoems}}).sort({datetime:-1}).limit(10).exec(function (err, news, count) {
        res.render('desk', {
          user: req.user,
          author: author,
          poems: poems,
          news: news
        })
      })
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
        favs: author.favAuthors,
        poems: poems
      })
    })
  })
};

//this is the page for displaying a single poem
exports.poems = function( req, res ) {
  poem.findOne({_id: req.params.id}, 
    function (err, poem, count) {
      lineLink.findOne({ _id:poem.linkID }, 
        function (err, linkOne, count) {
            lineLink.find({originID: poem._id}, function(err, links, count) {
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
	new poem({
		author : req.user.fullName,
    authorUsr : req.user.username,
		title : req.body.poemTitle,
    content : lines,
		created : Date.now(),
    tags : req.body.Tags.split(", "),
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
  var ID = req.body.ID;
  var newsID = req.body.newsID;
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
      lineLink.findOneAndUpdate({_id: thispoem.linkID}, {guestID: thispoem._id, guestAuthor: thispoem.author, guestTitle: thispoem.title },
        function (err, link) {
        news.findOneAndUpdate({_id: newsID}, {newpoemID: thispoem._id, newtitle: thispoem.title, newauthor: thispoem.author},
          function (err, doc) {
            poem.findOneAndUpdate({_id: link.originID}, {$push: {linkedLines: link.originNum}}, 
              function (err, poem) {
                req.user.update({$push: {poems: thispoem._id}}, //update user document with _id of new poem 
                  function(err, count, raw) {
                  res.redirect('desk');
              })
            })
        })
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
  var originID = req.body.ID;
  var Line = req.body.lineselect-1;
  poem.findOne({_id: originID}).exec(function (err, origin) { 
  var poemlength = req.body.num;
  var Body = noGaps(origin.content);
  var lineContent = Body[Line];
  var position = req.body.position;
  new lineLink({
    originID: originID,
    originTitle: origin.title,
    originAuthor: origin.author,
    originNum: Line,
    content: lineContent
  }).save(function(err, linelink, count) {
    new news({
      originID: originID,
      origintitle: origin.title,
      originauthor: origin.author,
      datetime: Date.now()
    }).save(function(err, news, count) {
      res.render('newlink', {
        linelink: linelink,
        news: news,
        position: position
      })
    })
  })
})
}
};

//search engine functions
exports.search = function ( req, res ) {
  poem.find( function (err, poems) {
    var i;
    var k;
    var titles = [];
    var results = [];
    var tagresults = [];
    var query = req.body.searchQuery.split(" ");
    for(i=0;i<query.length;i++) {
      for(k=0;k<poems.length;k++) {
        if(match(query[i].toLowerCase(), poems[k].title) || tagcheck(query[i].toLowerCase(),poems[k])) {
          if(!inArray(poems[k],results)) {
            results.push(poems[k]);
          }
        }        
      }
    }
  res.render('results', {
    title: 'Poetry Link',
    poems: results,
    })
  });
}

var tagcheck = function(query, poem) {
  var t;
  for(t=0;t<poem.tags.length;t++) {
    if(check(query,poem.tags[t].toLowerCase())) {
      return true;
    }
  }
};

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

var match = function ( string, title ) {
  var k;
  var results = [];
  var current = title.split(" ");
    if(current.length > 1 ) {       
      for(k=0; k < current.length; k++) {
        if( check( string, current[k].toLowerCase() ) ) {
          return true;
        }    
      }
    } 
    else if (check( string, current[0].toLowerCase() )) {
        return true;
      } else {
  return false;
  }
}

var change = function(array, a, b) {
  array[a].poem = array[b].poem;
  array[a].score = array[b].score;
  return;
}

var Change = function(array, a, b) {
  array[a].author = array[b].author;
  array[a].score = array[b].score;
  return;
}

//find the three poems with the most links
var mostLinkedPoems = function(poems) {
  var results = [
  {poem: null, score: 0},
  {poem: null, score: 0},
  {poem: null, score: 0}
  ];

  for(i=0;i<poems.length;i++) {
    if(poems[i].linkedLines.length > results[0].score) {
      change(results, 2, 1);
      change(results, 1, 0);
      results[0].poem = poems[i];
      results[0].score = poems[i].linkedLines.length;
    }
    else if (poems[i].linkedLines.length > results[1].score || poems[i].linkedLines.length === results[0].score) {
      change(results, 2, 1);
      results[1].poem = poems[i];
      results[1].score = poems[i].linkedLines.length;
    }
    else if (poems[i].linkedLines.length > results[2].score || poems[i].linkedLines.length === results[1].score) {
      results[2].poem = poems[i];
      results[2].score = poems[i].linkedLines.length;
    }
  } 
  return results;
}

var mostProductiveAuthor = function(authors) {
  var Results = [
  {author: null, score: 0},
  {author: null, score: 0},
  {author: null, score: 0}
  ];
  for(i=0;i<authors.length;i++) {
    if(authors[i].poems.length > Results[0].score) {
      Change(Results, 2, 1);
      Change(Results, 1, 0);
      Results[0].author = authors[i];
      Results[0].score = authors[i].poems.length;
    }
    else if (authors[i].poems.length > Results[1].score || authors[i].poems.length === Results[0].score) {
      Change(Results, 2, 1);
      Results[1].author = authors[i];
      Results[1].score = authors[i].poems.length;
    }
    else if (authors[i].poems.length > Results[2].score || authors[i].poems.length === Results[1].score) {
      Results[2].author = authors[i];
      Results[2].score = authors[i].poems.length;
    }
  } 
  return Results;
}

var inside = function(string, array) {
  for(i=0;i<array.length;i++) {
    if(array[i] == string) {
      return array[i]
    }
  }
}

var inArray = function(object, array) {
  var i;
  for(i=0;i<array.length;i++) {
    if(object === array[i]) {
      return true;
    }
  }
  return false
};

var forEach = function(array, fn) {
  for(i=0;i<array.length;i++) {
    fn(array[i]);
  }
}

var noGaps = function(array) {
  var results = [];
  for(var p = 0;p<array.length;++p) {
    if(array[p] !== "") {
      results.push(array[p]);
    }
  }
  return results;
};