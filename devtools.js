chrome.devtools.panels.create(
  "Console Copy",
  "",             // icon (optional)
  "panel.html",   // HTML for the panel
  function(panel) {
    console.log("Console Copy panel created.");
  }
);
