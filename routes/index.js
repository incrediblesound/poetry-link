
/*
 * GET home page.
 */
 var mongoose = require ( 'mongoose' );
 var poem = mongoose.model ( 'poem' );
 var pLink = mongoose.model ( 'pLink' );
 var author = mongoose.model ('author' );

exports.index = function(req, res){
  poem.find( function(err, poems, count){
	pLink.find( function (err, links, count){
	  res.render('index', { 
  	    title: 'Poetry Link',
  	    poems: poems,
  	    links: links 
    });
  });
});
}

exports.desk = function(req, res){
	res.render('desk',{
		title: 'Writers Desk'
	});
};
exports.create  = function ( req, res ) {
	new poem({
		author : req.body.authorName,
		title : req.body.poemTitle,
		content : req.body.poemtext,
		created : Date.now()
		}).save( function( err, poem, count) {
			res.redirect( '/desk' )
			})
	}
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
    console.log(matches);
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

exports.author = function(req, res){
	
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
      if(check( string, array[i].toLowerCase())) {
        results.push(array[i]);
      }
    }
  }
  return results;
};
//callbacks can be nested indifiniely such that the res.render method has access to all the variables hoobly!!!
