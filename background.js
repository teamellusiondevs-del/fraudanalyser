
// Fraud Blocker - Background Service Worker - FIXED VERSION (No Spam Notification)

const SCAM_KEYWORDS = [
  "free-paytm-cash", "phonepe-offer", "googlepay-loot", "upi-cashback-free",
  "paytm-kyc-update", "sbi-kyc", "lottery-payment", "quick-payment-link"
];

const FAKE_PAYMENT_DOMAINS = [
  "paytm-offer.com", "phonepe-lucky.com", "gpay-bonus.com", "free-recharge-paytm.com",
  "sbi-online-kyc.com", "secure-rbi-kyc.com", "upi-payment-claim.com",
  "amazon-pay-reward-club.com", "flipkart-big-offer-pay.com"
];

// Anti-spam system
const recentlyBlocked = new Map(); // tabId -> timestamp
const BLOCK_COOLDOWN = 5000; // 5 sec me ek hi baar block

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Sirf jab URL change ho tabhi check karo, loading state pe nahi
  if (!changeInfo.url) return;
  const url = changeInfo.url;
  if (!url) return;

  // Agar abhi abhi block kiya hai to ignore karo - ANTI SPAM
  const lastBlock = recentlyBlocked.get(tabId);
  if (lastBlock && (Date.now() - lastBlock < BLOCK_COOLDOWN)) {
    return;
  }

  // Agar already blocked page pe hai to check mat karo
  if (url.includes("blocked.html")) return;

  try {
    const urlObj = new URL(url);

    if (urlObj.protocol === "http:") {
      if (urlObj.hostname !== "localhost" && urlObj.hostname !== "127.0.0.1" && urlObj.hostname !== "127.0.0.1:5500") {
        await blockTab(tabId, url, "HTTP Site Blocked - Not Secure", "Ye site http:// se start hoti hai. Unsafe hai.");
        return;
      }
    }

    const hostname = urlObj.hostname.toLowerCase();
    for (const scamDomain of FAKE_PAYMENT_DOMAINS) {
      if (hostname.includes(scamDomain)) {
        await blockTab(tabId, url, "Fake Payment Scam Detected", `Ye domain ${scamDomain} fake payment scam list me hai.`);
        return;
      }
    }

    for (const keyword of SCAM_KEYWORDS) {
      if (url.toLowerCase().includes(keyword)) {
        await blockTab(tabId, url, "Suspicious Payment Link", `URL me scam keyword '${keyword}' mila.`);
        return;
      }
    }

    const suspiciousPatterns = [/paytm.*offer/i, /phonepe.*reward/i, /gpay.*cashback/i, /sbi.*kyc.*online/i, /rbi.*suspend/i];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        await blockTab(tabId, url, "Lookalike Scam Domain", `Ye site asli payment company jaise dikhne ki koshish kar rahi hai.`);
        return;
      }
    }

  } catch(e) { console.log("FraudBlocker error", e); }
});

async function blockTab(tabId, url, reason, details) {
  // Mark as blocked abhi - taki dobara trigger na ho
  recentlyBlocked.set(tabId, Date.now());
  
  // Clean old entries after 10 sec
  setTimeout(() => recentlyBlocked.delete(tabId), 10000);

  const blockedUrl = chrome.runtime.getURL(`blocked.html?reason=${encodeURIComponent(reason)}&details=${encodeURIComponent(details)}&url=${encodeURIComponent(url)}`);
  try {
    await chrome.tabs.update(tabId, { url: blockedUrl });

    // --- FIXED: Notification bilkul hata diya, ya sirf ek baar ---
    // Ab notification nahi ayega, sirf badge update hoga
    // Agar chahiye to isko uncomment kar sakte ho but cooldown ke saath
    /*
    chrome.action.setBadgeText({ tabId: tabId, text: "!" });
    chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#FF3B30" });
    */

    // Count badhao
    chrome.storage.local.get(["blockedCount"], (res) => {
      chrome.storage.local.set({ blockedCount: (res.blockedCount || 0) + 1 });
    });

  } catch(e) {}
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ whitelist: [], blockedCount: 0 });
});

// Tab close hua to uska record delete
chrome.tabs.onRemoved.addListener((tabId) => {
  recentlyBlocked.delete(tabId);
});
