let attachedTabId = null;

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

function sendToServer(text) {
  fetch("http://localhost:3000/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      time: Date.now(),
      log: text
    })
  }).catch(err => console.error("Send error", err));
}

function debuggerEvent(source, method, params) {
  if (!attachedTabId || source.tabId !== attachedTabId) return;

  if (method === "Console.messageAdded") {
    const msg = params.message;
    const text = `[${msg.level}] ${msg.text}`;
    sendToServer(text);
    chrome.runtime.sendMessage({ type: "newLog", text });
  }

  if (method === "Runtime.exceptionThrown") {
    const ex = params.exceptionDetails;
    const text = `[exception] ${ex.text}`;
    sendToServer(text);
    chrome.runtime.sendMessage({ type: "newLog", text });
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "start") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) startDebugger(tabs[0].id);
    });
  }
  if (msg.action === "stop") stopDebugger();
});
