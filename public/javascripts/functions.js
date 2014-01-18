$(document).ready(function(){
	$('.lnkview').hide();
	$('.lnkheader').on('click', function() {
		$('.lnkview').toggle(500);
	});

	$('.linksubmit').hide();
	$('.position').on('click', function() {
		$('.linksubmit').fadeIn(250);
	});
});