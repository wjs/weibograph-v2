$(function() {
	/*--------- graph width and height -----------*/	
	$(window).resize(function () {
		$('#graph').css('width', (window.innerWidth-5)+'px');
		$('#graph').css('height', (window.innerHeight-5)+'px');
		if (CURRENT_UID) {
			changeGraphAjax(CURRENT_UID);
		}
	});

	/*---------- start search  ------------*/
	$('#search-input').focus(function (event) {
		$(this).animate({width:'300px'});
	});
	$('#search-input').blur(function (event) {
		$(this).animate({width:'150px'});
	});
	$('#search-input').click(function (event) {
		$(this).select();
	});
	$('#search-input').on('search', function (event) {
		var search_nick = $.trim($(this).val());
		if (search_nick == '')
			return;
		var search_uid = '';
		var dataList = $("#search-result");
		var options = $("#search-result").children();
		for (var i = 0; i < options.length; i++) {
			if (search_nick == options[i].value) {
				search_uid = $(options[i]).attr('id').replace('uid_', '');
			}
		}
		if (search_uid != '') {
			$('#loading-div').show();
			changeGraphAjax(search_uid);
		} 
	});
	$('#search-input').on('input', function (event) {
		var val = $(this).val();
		if(val === '') return;
		$.get('/search', {keyword:val}, function(data) {
			var dataList = $("#search-result");
			dataList.empty();
			json = eval("("+data+")");
			for (var i = 0; i < json.length; i++) {
				var opt = $('<option id="uid_' + json[i]['uid'] + '"></option>').attr('value', json[i]['nick']);
				dataList.append(opt);		
			}
		},"json");
	});
});
