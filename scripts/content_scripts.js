;(function(){
	var cache_dict = {}
	
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse){
			var url = request['url']
			if (url.indexOf('nuke') != -1){
				var pid = request['others']['pid']
				setTimeout(
					function(){
						var nuke_re = /\{.*\}/
						var nuke_content = $('iframe').contents().find('script').html()
						var nuke_text = nuke_content.match(nuke_re)[0]
						process_nuke(pid, nuke_text)
					}, 300
				)
			}
			else{
				process_num()
			}
		}
	)
	
	
	function process_num(){
		var data = $('.c2 script').text()
		var scripts_re = /commonui.postArg.proc\( (\d+)\,(?:[\s\S]+?\,){9}(\d+)\,(?:[\s\S]+?\,){4}\'(.*?)\'/g
		var result
		while (result = scripts_re.exec(data)){			
			var index = result[1]
			var uid = result[2]
			var num_list = result[3].split(',')
			var agree = parseInt(num_list[1] || 0)
			var disagree = parseInt(num_list[2] || 0)
			cache_dict[uid] = [index, agree, disagree]
			set_num(index, create_agree_map(agree, disagree))
			//console.log(index, agree, disagree, uid)
		}
		//console.log(cache_dict, 'cache_dict')
	}
	
	
	function create_agree_map(agree, disagree){
		return {'支持': agree, '反对': disagree}
	}
		
	
	
	function set_num(index, agree_map){
		for (var is_agree in agree_map){
			if (!agree_map.hasOwnProperty(is_agree)){
				continue
			}
			var num = agree_map[is_agree]
			var subject_a = $('#postcontentandsubject'+ index + ' a[title="' + is_agree + '"]')
			var subject_a_next = subject_a.next()[0]
			if (subject_a_next && subject_a_next.tagName == 'SPAN'){
				subject_a_next.textContent = num
			}
			else{
				subject_a.after('<span class=" white" title="">' + num + '</span>')
			}
		}
	}
	
	
	function process_nuke(uid, nuke_text){
		var agree_map
		//console.log(uid, nuke_text)
		var num_list = cache_dict[parseInt(uid)]
		var index = num_list[0]
		var agree_num = num_list[1]
		var disagree_num = num_list[2]
		var nuke_json = JSON.parse(nuke_text)['data']
		//console.log(nuke_json)
		var is_cancel = nuke_json['0'].indexOf('取消') != -1 ? -1 : 1
		var is_agree = nuke_json['0'].indexOf('支持') != -1 
		var plus_num = nuke_json['1']
		if (plus_num == 2){
			agree_map = create_agree_map(num_list[1] += 1, num_list[2] -= 1)
		}
		else if (plus_num == -2){
			agree_map = create_agree_map(num_list[1] -= 1, num_list[2] += 1)
		}
		else{
			agree_map = create_agree_map(num_list[1] += is_cancel * is_agree, num_list[2] += is_cancel * !is_agree)
		}
		//console.log(agree_map)
		set_num(index, agree_map)
	}
	
	
	process_num()
	

})(this)

















