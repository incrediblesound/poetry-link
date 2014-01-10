
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

exports.author = function(req, res){
	
}
//callbacks can be nested indifinitely such that the res.render method has access to all the variables hoobly!!!