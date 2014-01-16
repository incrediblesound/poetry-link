$(document).ready(function(){
	$('.lnkview').hide();
	$('.lnkheader').on('click', function(){
		$('.lnkview').toggle(500);
	})
})