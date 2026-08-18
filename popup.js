
chrome.storage.local.get(["customList","disabled","blurEnabled","password"], (res)=>{
  document.getElementById("count").innerText = (5000 + (res.customList?.length||0)) + "+ sites blocked";
  document.getElementById("status").innerText = res.disabled ? "OFF" : "Active ✅";
  document.getElementById("blurToggle").checked = res.blurEnabled !== false;
});
document.getElementById("blurToggle").onchange = (e)=>{
  chrome.storage.local.set({blurEnabled: e.target.checked});
};
document.getElementById("addBtn").onclick = ()=>{
  let site = document.getElementById("customSite").value.trim().toLowerCase().replace(/https?:\/\//,'').split('/')[0];
  if(!site) return;
  chrome.storage.local.get(["customList"], (res)=>{
    let list = res.customList || [];
    if(!list.includes(site)) list.push(site);
    chrome.storage.local.set({customList: list}, ()=> { alert(site+" blocked & will be blurred!"); location.reload(); });
  });
};
document.getElementById("blockBtn").onclick = ()=>{
  let p = document.getElementById("pass").value;
  chrome.storage.local.set({disabled:false, password: p || "1234", blurEnabled: true});
  alert("Full Protection ON - 5000+ sites blocked + blur active");
  location.reload();
};
document.getElementById("unblockBtn").onclick = ()=>{
  let p = document.getElementById("pass").value;
  chrome.storage.local.get(["password"], (res)=>{
    if(res.password && p !== res.password){ alert("Wrong password bhai!"); return; }
    chrome.storage.local.set({disabled:true}, ()=> { alert("Disabled"); location.reload(); });
  });
};
