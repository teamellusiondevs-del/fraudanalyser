
importScripts("blocklist.js");
const BLOCK_PAGE = chrome.runtime.getURL("blocked.html");

async function updateRules() {
  try {
    const old = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: old.map(r=>r.id)});
  } catch(e){}

  // Chrome allows max 5000 dynamic rules, so chunk 5000
  const chunk = ADULT_DOMAINS.slice(0,4900);
  const rules = chunk.map((domain,i)=>({
    id: i+1,
    priority: 1,
    action: { type: "redirect", redirect: { extensionPath: "/blocked.html?site="+encodeURIComponent(domain) } },
    condition: { requestDomains: [domain], resourceTypes: ["main_frame","sub_frame"] }
  }));
  try{
    await chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds: [], addRules: rules});
    console.log("Blocked "+rules.length+" domains");
  } catch(e){ console.error(e); }
}

chrome.runtime.onInstalled.addListener(updateRules);
chrome.runtime.onStartup.addListener(updateRules);
// OTP System
let currentOTP = null;
let otpExpiry = null;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
}

async function sendOTPToParents() {
  currentOTP = generateOTP();
  otpExpiry = Date.now() + 5*60*1000; // 5 min valid
  
  const parentEmail = (await chrome.storage.local.get(["parentEmail"])).parentEmail;
  const parentChatId = (await chrome.storage.local.get(["parentChatId"])).parentChatId;

  // 1. Email pe OTP (EmailJS se free)
  // emailjs.com pe account banao, service connect karo
  await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      service_id: "YOUR_SERVICE_ID",
      template_id: "YOUR_TEMPLATE_ID",
      user_id: "YOUR_PUBLIC_KEY",
      template_params: {
        to_email: parentEmail,
        otp: currentOTP,
        site: "Extension Deactivate Attempt",
        time: new Date().toLocaleString()
      }
    })
  });

  // 2. Telegram pe OTP (instant beep)
  await fetch(`https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage?chat_id=${parentChatId}&text=🚨 OTP: ${currentOTP} - Bacche ne ShieldGuard band karne ki koshish ki hai. 5 min me expire.`);

  return currentOTP;
}

// Jab bhi koi blocked site ko bypass karne ki koshish kare
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "REQUEST_DEACTIVATE") {
    sendOTPToParents().then(() => {
      sendResponse({needOTP: true});
    });
    return true;
  }
  if (msg.type === "VERIFY_OTP") {
    if (msg.otp === currentOTP && Date.now() < otpExpiry) {
      sendResponse({success: true});
      currentOTP = null; // ek baar use ke baad khatam
    } else {
      sendResponse({success: false, error: "Galat ya Expire OTP"});
    }
  }
});
// keyword fallback + custom list
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url || changeInfo.status !== 'loading') return;
  const url = tab.url.toLowerCase();
  if(url.includes("blocked.html") || url.startsWith("chrome://")) return;

  chrome.storage.local.get(["disabled","customList"], (res)=>{
    if(res.disabled) return;
    const custom = res.customList || [];
    const all = [...ADULT_DOMAINS, ...custom];
    let isAdult = all.some(d => url.includes(d.toLowerCase()));
    if(!isAdult){
      isAdult = ADULT_KEYWORDS.some(k => url.includes(k));
    }
    if(isAdult){
      chrome.tabs.update(tabId, {url: BLOCK_PAGE+"?site="+encodeURIComponent(tab.url)});
    }
  });
});
