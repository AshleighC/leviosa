chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.tab_status == 'current') {
    sendResponse({
      active: sender.tab.active,
      title: sender.tab.title,
      url: sender.tab.url
    });
  }
  else if (request.connection == 'lost') {
    //chrome.browserAction.setBadgeText({text: "OFF"});
    sendResponse({ connection: 'lost' });
  }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  switch(request.action) {
    case "Avada Kedavra":
      chrome.tabs.query({active: true, currentWindow: true}, function(result) {
        chrome.experimental.processes.getProcessIdForTab(result[0].id, function(processId) {
          chrome.experimental.processes.terminate(processId);
        });
      });
      break;
    case "Protego":
      chrome.windows.create({"url": request.url, "incognito": true});
      break;
    default:
      console.log("Request action not recognized.");
  }
});

var plau = false;

chrome.browserAction.onClicked.addListener(function(tab) {
  plau = !plau;
  chrome.browserAction.setBadgeText({text: (plau ? "ON " : "OFF")});
  //chrome.browserAction.setIcon(); FILL THIS IN WHEN WE HAVE ICONS
  chrome.tabs.query({active: true, currentWindow: true}, function(result) {
    chrome.tabs.sendMessage(result[0].id, {action: "toggle", status: plau});
  });
});

