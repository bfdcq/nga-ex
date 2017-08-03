var cache_dict = {}
chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		var url = details.url
		if (url.indexOf('nuke') != -1){				
			cache_dict['pid'] = details.requestBody.formData.pid[0]			
		}
	}, {urls: ["<all_urls>"]}, ["requestBody"]
)

chrome.webRequest.onCompleted.addListener(
	function(details) {
		var url = details.url
		console.log(url, details)
		chrome.tabs.sendMessage(
			details.tabId, 
			{'url': details.url, 'others': cache_dict}, 
			function(response){
				cache_dict = {}
			}
		)	
	},{urls: ["<all_urls>"]},[]
)
