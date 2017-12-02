const { classes: Cc, interfaces: Ci, utils: Cu } = Components;
Cu.import('resource://gre/modules/Services.jsm');

var button,menu;

function loadIntoWindow(window) {
	menu = window.NativeWindow.menu.add({
		name:"Restart",
		callback:function(){
			restart(window);
		}
	});
}

function restart(window){
	const app = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	app.notifyObservers(null, "quit-application-requested", "restart");
	
	const abortQuit = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
	if (abortQuit.data) return;
	app.notifyObservers(null, "quit-application-granted", null);
	
	Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup)
		.quit(Ci.nsIAppStartup.eRestart | Ci.nsIAppStartup.eAttemptQuit);
}

function unloadFromWindow(window) {
  if (!window) return;
  window.NativeWindow.menu.remove(menu);
}

var windowListener = {
  onOpenWindow: function(aWindow) {
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN) return;
  Services.wm.removeListener(windowListener);
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
