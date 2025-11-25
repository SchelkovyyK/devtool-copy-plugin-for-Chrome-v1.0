let attachedTabId = null;

// Logs are now stored in panel.js, not in background
function startDebugger(tabId) {
  attachedTabId = tabId;

  chrome.debugger.attach({ tabId }, "1.3", () => {
    chrome.debugger.sendCommand({ tabId }, "Runtime.enable");
    chrome.debugger.sendCommand({ tabId }, "Console.enable");
  });

  chrome.debugger.onEvent.addListener(debuggerEvent);
}

function stopDebugger() {
  if (attachedTabId !== null) {
    chrome.debugger.detach({ tabId: attachedTabId });
    attachedTabId = null;
  }
}

function debuggerEvent(source, method, params) {
  if (!attachedTabId || source.tabId !== attachedTabId) return;

  if (method === "Console.messageAdded") {
    const msg = params.message;
    const text = `[${msg.level}] ${msg.text}`;
    chrome.runtime.sendMessage({ type: "newLog", text });
  }

  if (method === "Runtime.exceptionThrown") {
    const ex = params.exceptionDetails;
    const text = `[exception] ${ex.text}`;
    chrome.runtime.sendMessage({ type: "newLog", text });
  }
}

// Listen for panel commands
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "start") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) startDebugger(tabs[0].id);
    });
  }
  if (msg.action === "stop") stopDebugger();
});
