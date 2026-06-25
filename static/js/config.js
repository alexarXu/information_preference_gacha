// Runtime config (loaded before utils.js / task.js in exp.html).
var config = {};

// True on localhost / 127.0.0.1 — used to enable fast local dev shortcuts in task.js.
var isLocalDevHost = (function () {
  var host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
})();
