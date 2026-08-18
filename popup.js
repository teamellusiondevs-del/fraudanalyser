
chrome.storage.local.get(["cnt"], r=>{ document.getElementById("cnt").innerText = (r.cnt||0)+" Sites Blocked"; });
document.getElementById("yt").onclick = ()=>{ chrome.tabs.create({url:"https://youtube.com"}); };
