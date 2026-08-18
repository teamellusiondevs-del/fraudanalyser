
chrome.storage.local.get(["blockedCount"], (res) => {
  document.getElementById("blockedCount").innerText = res.blockedCount || 0;
});

document.getElementById("whitelistBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  const url = new URL(tab.url);
  const host = url.hostname;
  chrome.storage.local.get(["whitelist"], (res) => {
    const list = res.whitelist || [];
    if (!list.includes(host)) {
      list.push(host);
      chrome.storage.local.set({whitelist: list});
      alert(host + " whitelisted! Refresh karo.");
    }
  });
});

document.getElementById("testBtn").addEventListener("click", () => {
  chrome.tabs.create({url: chrome.runtime.getURL("blocked.html?reason=Test Mode&details=Ye test page hai&url=https://example.com")});
});
