const logsDiv = document.getElementById("logs");
let logs = [];

function addLog(text) {
  logs.push(text);
  logsDiv.textContent = logs.join("\n");
  logsDiv.scrollTop = logsDiv.scrollHeight;
}

document.getElementById("start").addEventListener("click", () => {
  logs = [];                  // Clear previous logs
  logsDiv.textContent = "";   // Clear panel display
  chrome.runtime.sendMessage({ action: "start" });
  document.getElementById("start").disabled = true;
  document.getElementById("stop").disabled = false;
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
  document.getElementById("start").disabled = false;
  document.getElementById("stop").disabled = true;
});

// Copy to clipboard **directly from panel context**
document.getElementById("copy").addEventListener("click", () => {
  if (logs.length === 0) return;

  // Create temporary textarea
  const textArea = document.createElement("textarea");
  textArea.value = logs.join("\n");
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert("Logs copied to clipboard!");
    } else {
      alert("Copy failed. Try manually selecting the text.");
    }
  } catch (err) {
    console.error("Copy command failed", err);
  }

  document.body.removeChild(textArea);
});


// Receive logs from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "newLog") addLog(msg.text);
});
