
// ===== V2 BLUR SYSTEM =====
const BLUR_KEYWORDS = [
"porn","xxx","pornhub","xvideos","xnxx","xhamster","onlyfans","chaturbate","stripchat",
"nude","naked","hentai","boobs","pussy","sex video","adult movie","18+","blue film",
"sexy video","hot bhabhi","desi mms","leaked","erotic","soft porn","brazzers","bangbros"
];

let blurred = false;

function shouldBlur() {
  const txt = (document.title + " " + document.documentElement.innerText.slice(0,5000)).toLowerCase();
  const url = location.href.toLowerCase();
  return BLUR_KEYWORDS.some(k => txt.includes(k) || url.includes(k));
}

function applyBlur(reason="Adult content detected") {
  if(blurred) return;
  blurred = true;

  const style = document.createElement('style');
  style.innerHTML = `
    html { filter: blur(35px) !important; transition: filter 0.3s; }
    #__noporn_overlay__ { 
      position: fixed !important; inset:0 !important; z-index: 2147483647 !important;
      background: rgba(0,0,0,0.85) !important; backdrop-filter: blur(20px) !important;
      display:flex !important; align-items:center !important; justify-content:center !important;
      font-family: Arial !important; filter: none !important;
    }
    #__noporn_box__ {
      background:#1a1a1a !important; padding:30px !important; border-radius:20px !important;
      text-align:center !important; color:white !important; max-width:380px !important;
      border:2px solid #ff3b30 !important; box-shadow:0 0 30px rgba(255,59,48,0.4) !important;
    }
    #__noporn_box__ h2 { color:#ff3b30 !important; margin:10px 0 !important; font-size:22px !important; }
    #__noporn_box__ p { color:#aaa !important; font-size:14px !important; }
    #__noporn_box__ button { 
      margin:10px 5px !important; padding:10px 20px !important; border:none !important; 
      border-radius:8px !important; font-weight:bold !important; cursor:pointer !important;
    }
    .__noporn_blur_img__ { filter: blur(25px) !important; }
  `;
  document.documentElement.appendChild(style);

  // Blur all images/videos that look adult
  document.querySelectorAll('img, video').forEach(el=>{
    const src = (el.src + " " + el.alt + " " + el.className).toLowerCase();
    if(BLUR_KEYWORDS.some(k=>src.includes(k))){
      el.classList.add('__noporn_blur_img__');
    }
  });

  const overlay = document.createElement('div');
  overlay.id = '__noporn_overlay__';
  overlay.innerHTML = `
    <div id="__noporn_box__">
      <div style="font-size:50px">🚫</div>
      <h2>Adult Content Blurred</h2>
      <p>${reason}</p>
      <p style="font-size:11px;word-break:break-all">${location.hostname}</p>
      <button style="background:#ff3b30;color:white" id="__noporn_leave__">Leave Site</button>
      <button style="background:#333;color:white" id="__noporn_show__">Show Anyway (Unsafe)</button>
    </div>
  `;
  document.documentElement.appendChild(overlay);
  document.getElementById('__noporn_leave__').onclick = ()=> location.href='https://www.google.com';
  document.getElementById('__noporn_show__').onclick = ()=>{
    document.documentElement.style.filter='none';
    overlay.remove();
    style.remove();
    document.querySelectorAll('.__noporn_blur_img__').forEach(e=>e.classList.remove('__noporn_blur_img__'));
  };
}

function check() {
  chrome.storage.local.get(["disabled","blurEnabled"], (res)=>{
    if(res.disabled) return;
    if(res.blurEnabled === false) return; // allow disabling blur separately
    if(shouldBlur()){
      applyBlur();
    } else {
      // also blur suspicious images even on normal sites (instagram etc)
      const imgs = document.querySelectorAll('img, video');
      let adultImgCount = 0;
      imgs.forEach(el=>{
        const s = (el.src + (el.alt||"")).toLowerCase();
        if(["porn","xxx","nude","onlyfans","hentai","sex"].some(k=>s.includes(k))) adultImgCount++;
      });
      if(adultImgCount >= 2) applyBlur("Suspicious adult media detected");
    }
  });
}

// Run early and repeatedly
check();
let tries = 0;
const iv = setInterval(()=>{
  check();
  if(++tries > 20) clearInterval(iv);
}, 1000);

new MutationObserver(check).observe(document.documentElement, {childList:true, subtree:true});
