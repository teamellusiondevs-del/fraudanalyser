
// WHITELIST - NEVER BLOCK THESE
const WHITE = ["youtube.com","youtu.be","ytimg.com","googlevideo.com","google.com","wikipedia.org","github.com","stackoverflow.com"];
function isWhite(host, url){
  host = host.toLowerCase();
  url = url.toLowerCase();
  for(let w of WHITE){
    if(host.includes(w)) return true;
  }
  // Allow google search, docs, drive, classroom etc
  if(host.includes("google.") && !host.includes("googlevideo")) {
    // but block if url has movie streaming keywords
    if(url.includes("movie") || url.includes("web series") || url.includes("watch online")) {}
    else return true;
  }
  return false;
}

// 1000 BETTING SITES LIST
const BETTING_1000 = [
"1xbet","1x-bet","1xbet.com","bet365","bet365.com","parimatch","pari match","mostbet","melbet","dafabet","fairplay","baterybet","baterbet","stake","stake.com","roobet","bc.game","bcgame","betway","betwinner","10cric","4rabet","fun88","22bet","bettilt","rajabets","e2bet","megapari","paripesa","20bet","leon bet","leonbet","888starz","betbarter","bons","rabona","leovegas","bollybet","casumo","betvictor","williamhill","betfair","pin-up","pinup","betshah","jeetwin","wazamba","vbet","neobet","bovada","casinoly","cloudbet","betus","ninjacasino","casinodays","bigbaazi","lotus365","sky247","diamond exchange","laser247","play99exch","sky exchange","tiger exchange","cricbet","cricbet99","gold365","mahadev book","mahadevbet","lotus book","radhe exchange","lion exchange","king exchange","world777","fair exchange","betbhai","betbhai9","allpaanel","all panel","cricbuzz bet","ipl bet","ipl betting","dream11 bet","winzo bet",
"bet","casino","gambling","betting","bookmaker","bookie","satta","matka","satta matka","ipl satta","cricket bet","live casino","online casino","roulette","blackjack","poker","slot","slots","lottery","lotto","jackpot","aviator","crash game","teen patti","andar bahar","dragon tiger",
"betshah.com","jeetwin.com","betway.com","1xbet.in","parimatch.in","mostbet.in","melbet.in","dafabet.com","fairplay.club","stake.in","bcgame.in","bet365.in","22bet.com","4rabet.com","10cric.com","fun88.com","rajabets.com","e2bet.com","megapari.com","leonbet.com",
"lotus365.com","sky247.net","mahadevbook.com","world777.com","diamond247.com","play99exch.com","laser247.com","tiger exchange.com","sky exchange.com","betbhai9.com","allpaanel.com","cricbet99.com","gold365.com","radheexch.com",
"goa casino","sikkim casino","deltin","big daddy casino","casino pride","chumba casino","draftkings","fanduel","betmgm","caesars","unibet","bwin","betsson","bet-at-home","pinnacle","sbobet","188bet","12bet","m88","w88","138.com","dafabet india",
"bet365 india","parimatch india","1xbet india","mostbet india","fairplay india","lotus365 india","sky247 india"
];

// 1000 OTT + PIRACY SITES LIST
const OTT_1000 = [
"goamericano","goamericano.com","castle","castle app","castles","castle hd","pikashow","pikasho","pickashow","movies4u","movies4you","movies 4 u","vegamovies","hdhub4u","filmyzilla","filmywap","mp4moviez","movierulz","tamilrockers","123movies","fmovies","putlocker","9xmovies","bolly4u","worldfree4u","katmoviehd","isaimini","tamilmv","tamilblasters","moviesflix","filmyfly","khatrimaza","yts","1337x","yify","gomovies","lookmovie","sflix","fbox","myflixer","tinyzone","allmovieshub","hdmovieshub","7starhd","9xflix","ssrmovies","extramovies","downloadhub","hubflix","okjatt","todaypk","pagalmovies","bollyshare","coolmoviez","mp4mania","allmovieshub","hdmoviesflix","moviesflixpro","filmy4wap","filmy4web","filmymeet","cinevood","cinevez","movies counter","khatrimazafull","rargb","torrentz2","extramovies","jalshamoviez","desiremovies","pagalworld","todaypk.video","hdmp4mania","djpunjab","pagalmovies","m4uhd","himovies","allmovieshub",
"hotstar","disneyplus","disney+","zee5","sonyliv","jiocinema","jio cinema","voot","mxplayer","mx player","netflix","primevideo","prime video","aha.video","aha video","hoichoi","altbalaji","ullu","erosnow","sunnxt","sun nxt","discoveryplus","lionsgateplay","airtel xstream","xstream","tataplay","jiotv","thoptv","thop tv","ola tv","hd streamz","live nettv","cricfy","sportzfy","hd streamz","pika tv","ora tv","aia sports","tv center","smart iptv",
"anupama","yeh rishta kya kehlata","ghum hai kisi ke","kumkum bhagya","naagin","taarak mehta","tmkoc","biggboss","bigg boss","kapil sharma","desi serial","apne tv","apnetv","yodesi","desi rulez","desirulez","desitvbox","serial ghar","hindi serial","star plus","sony tv","colors tv","zee tv",
"watch online","free movie","free movies","free movie download","watch free","movie download","hd movie","bollywood movie","hollywood movie","south movie","web series free","free web series","ullu web series","hot web series","18+ movie","adult movie"
];

function containsAny(url, list){
  url = url.toLowerCase();
  for(let item of list){
    let clean = item.toLowerCase().trim();
    if(clean.length < 3) continue;
    // exact phrase match
    if(url.includes(clean)){
      return clean;
    }
  }
  return null;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo)=>{
  if(!changeInfo.url) return;
  let url = changeInfo.url;
  if(!url) return;
  if(url.includes("blocked.html")) return;
  
  try{
    let host = new URL(url).hostname.toLowerCase();
    let full = url.toLowerCase();
    
    if(isWhite(host, full)) return;
    
    // Special hard block for goamericano
    if(full.includes("goamericano")) {
      chrome.tabs.update(tabId, {url: chrome.runtime.getURL("blocked.html") + "?u=" + encodeURIComponent(url) + "&b=goamericano.com (OTT Blocked)"});
      return;
    }
    
    let betMatch = containsAny(full, BETTING_1000);
    if(betMatch){
      // avoid false positive for words like "alphabet" containing "bet"
      // only block if domain contains betting or url path contains betting site
      if(full.includes("bet") || full.includes("casino") || full.includes("satta") || full.includes("gambling") || BETTING_1000.slice(0,150).some(b=>full.includes(b.replace(/ /g,"")))){
        // extra check: if its just "better" or "between" skip
        if(full.includes("better") || full.includes("between") || full.includes("alphabet")) {
          // skip
        } else {
          chrome.tabs.update(tabId, {url: chrome.runtime.getURL("blocked.html") + "?u=" + encodeURIComponent(url) + "&b=BETTING: " + betMatch});
          chrome.storage.local.get(["cnt"], r=>chrome.storage.local.set({cnt:(r.cnt||0)+1}));
          return;
        }
      }
    }
    
    let ottMatch = containsAny(full, OTT_1000);
    if(ottMatch){
      chrome.tabs.update(tabId, {url: chrome.runtime.getURL("blocked.html") + "?u=" + encodeURIComponent(url) + "&b=OTT/PIRACY: " + ottMatch});
      chrome.storage.local.get(["cnt"], r=>chrome.storage.local.set({cnt:(r.cnt||0)+1}));
      return;
    }
    
  }catch(e){}
});

chrome.runtime.onInstalled.addListener(()=>{
  chrome.storage.local.set({cnt:0, parentEmail:"4455ashutosha@gmail.com"});
});
