
// Extra protection inside page - detect fake payment forms
(function() {
  const PAYMENT_SCAM_TEXTS = [
    "enter upi pin to receive", "pay Rs 1 to get reward", "kyc will expire",
    "account will be blocked", "verify to get cashback", "pay to receive payment"
  ];

  function scanPage() {
    const bodyText = document.body.innerText.toLowerCase();
    for (const scamText of PAYMENT_SCAM_TEXTS) {
      if (bodyText.includes(scamText)) {
        // Show warning banner
        if (!document.getElementById("fraud-blocker-banner")) {
          const banner = document.createElement("div");
          banner.id = "fraud-blocker-banner";
          banner.style = "position:fixed;top:0;left:0;right:0;background:#FF3B30;color:white;padding:15px;z-index:9999999;font-family:sans-serif;font-size:16px;text-align:center;font-weight:bold;";
          banner.innerHTML = `⚠️ FRAUD BLOCKER WARNING: Is page pe scam text mila - "${scamText}". Koi bhi payment mat karo! [Extension ne detect kiya] <button id='fraud-close' style='margin-left:15px;padding:5px 10px'>Close</button>`;
          document.documentElement.prepend(banner);
          document.getElementById("fraud-close").onclick = () => banner.remove();
        }
        break;
      }
    }

    // Detect if form asks for UPI PIN on non-official domain
    const inputs = document.querySelectorAll("input[type='password']");
    if (inputs.length > 0 && bodyText.includes("upi")) {
      const host = location.hostname;
      const official = ["paytm.com", "phonepe.com", "google.com", "bhimupi.org.in", "onlinesbi.com", "amazon.in", "flipkart.com"];
      const isOfficial = official.some(d => host.includes(d));
      if (!isOfficial && !document.getElementById("fraud-blocker-banner")) {
        const banner = document.createElement("div");
        banner.id = "fraud-blocker-banner";
        banner.style = "position:fixed;top:0;left:0;right:0;background:#FF3B30;color:white;padding:15px;z-index:9999999;font-family:sans-serif;font-size:16px;text-align:center;font-weight:bold;";
        banner.innerHTML = `⚠️ FAKE UPI PIN FORM DETECTED on ${host} ! Kabhi bhi UPI PIN paise lene ke liye nahi dala jata! Ye 100% scam hai.`;
        document.documentElement.prepend(banner);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scanPage);
  } else {
    scanPage();
  }
  setTimeout(scanPage, 2000);
})();
