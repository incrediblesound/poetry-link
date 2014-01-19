$(document).ready(function(){
	$('.linkbud').hide();
	$('.linkinfo').hide();

	$('#linkInfo').on('click', function() {
		$('.linkbud').toggle(500);
	});

	$('.linkbud').on('click', function() {
		$(this).children().toggle(500);
	})

	$('#linksubmit').hide();
	$('.position').on('click', function() {
		$('#linksubmit').fadeIn(250);
	});

	$('.title').attr('href', '/index')
});