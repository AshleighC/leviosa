chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tab_status == 'current') {
    sendResponse({
      active: sender.tab.active,
      title: sender.tab.title,
      url: sender.tab.url
    });
  }
  else if (request.connection == 'lost') {
    chrome.browserAction.setBadgeText({text: "OFF"});
    sendResponse({ connection: 'lost' });
  }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.action == "Avada Kedavra") {
    queryInfo = {currentWindow: true, active : true};
    chrome.tabs.query(queryInfo, function(result) {
      var i;
      for (i=0; i < result.length; i += 1) {
        chrome.experimental.processes.getProcessIdForTab(result[i].id, function(processId) {
          chrome.experimental.processes.terminate(processId);
        });
      }
    });
  }
});
