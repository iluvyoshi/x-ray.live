/* Learn: plain-English definitions of every term and chart in X-Ray, plus beginner mode.

   GLOSSARY entries: k (id), t (term), cat (section), d (definition), ex (example, optional),
   m (phrases that link here in beginner mode, matched as whole words, longest first),
   how (a "How to read this" key: the entry also shows that chart's three lines), see (related entries).

   Beginner mode underlines the first mention of each term in each card; tapping it opens the entry here,
   with a button back to where you were. Pressing and holding (or
   selecting) any words shows "Look up in Learn"; a search with no match offers "Ask us to add it", saved to
   the term_requests table. Anyone can switch it on or off (sign-up, Learn, Account); it starts on
   for people who chose "New" unless they switch it off. */

const GLOSSARY_CATS = [
  ["start", "Start here"], ["bs", "The balance sheet"], ["cash", "Cash and debt"], ["scores", "Health scores"],
  ["shares", "Shares and dilution"], ["mt", "The $1M Test"], ["people", "Board, insiders and control"],
  ["flags", "Investors and red flags"], ["charts", "Charts in X-Ray"],
];

const GLOSSARY = [
  // ---- Start here
  { k: "share", t: "Share (stock)", cat: "start", d: "A small piece of ownership in a company. Owning shares gives you a slice of the company's value and, usually, a vote at shareholder meetings.", m: ["shareholders", "shareholder"], see: ["shares-out", "mcap"] },
  { k: "ticker", t: "Ticker", cat: "start", d: "The short code a stock trades under, like NVDA for Nvidia or JPM for JPMorgan Chase." },
  { k: "price", t: "Share price", cat: "start", d: "What one share last traded for. X-Ray uses the closing price at the end of each trading day, not live prices.", m: ["share price", "closing price", "end-of-day"], see: ["mcap", "bvps"] },
  { k: "mcap", t: "Market value (market cap)", cat: "start", d: "The share price times the number of shares. It's what the stock market says the whole company is worth today.", ex: "1 billion shares at $50 each is a $50 billion market value.", m: ["market value", "market cap", "market capitalization"], see: ["book", "pb"] },
  { k: "sec", t: "SEC filings", cat: "start", d: "Reports public companies must file with the U.S. Securities and Exchange Commission. Every number in X-Ray comes from them, and each screen links to the filing it used.", m: ["sec filings", "sec filing", "edgar", "filings"], see: ["10k", "proxy"] },
  { k: "10k", t: "10-K and 10-Q", cat: "start", d: "The annual report (10-K) and quarterly report (10-Q). They hold the audited balance sheet, income statement, cash flow statement and notes.", m: ["10-k", "10-q", "annual report", "quarterly report"], see: ["sec", "bs"] },
  { k: "proxy", t: "Proxy statement (DEF 14A)", cat: "start", d: "The document a company sends before its annual meeting. It lists the board, executive pay, who owns the most shares and deals with insiders.", m: ["proxy statement", "proxy"], see: ["board", "pvp", "rp"] },
  { k: "ttm", t: "TTM (trailing twelve months)", cat: "start", d: "The last four quarters added together, so you can see a full year without waiting for the annual report.", m: ["ttm", "trailing twelve months"] },

  // ---- The balance sheet
  { k: "bs", t: "Balance sheet", cat: "bs", d: "A snapshot of what a company owns (assets), what it owes (liabilities) and what's left for shareholders (book value) on one date. Assets always equal liabilities plus book value.", m: ["balance sheet", "balance sheets"], how: "body", see: ["assets", "liab", "book"] },
  { k: "assets", t: "Assets", cat: "bs", d: "Everything the company owns that has value: cash, money customers owe it, inventory, buildings, equipment, and intangibles like patents and goodwill.", m: ["total assets", "assets"], see: ["gw", "hard"] },
  { k: "liab", t: "Liabilities", cat: "bs", d: "Everything the company owes: loans and bonds, bills to suppliers, wages, taxes, leases and other obligations.", m: ["total liabilities", "liabilities"], see: ["debt", "obs"] },
  { k: "book", t: "Book value (shareholders' equity)", cat: "bs", d: "Assets minus liabilities. It's what the accounts say would be left for shareholders if everything were sold at its recorded value and every debt paid.", m: ["book value", "shareholders' equity", "on the books", "the books", "equity"], how: "price", see: ["bvps", "pb", "negbook"] },
  { k: "bvps", t: "Book value per share", cat: "bs", d: "Book value divided by the number of shares. X-Ray draws it as the cyan line next to the share price.", ex: "$10 billion of book value and 500 million shares is $20 of book value per share.", m: ["book value per share", "book / share", "on the books, per share"], see: ["pb"] },
  { k: "pb", t: "Price-to-book (P/B)", cat: "bs", d: "Share price divided by book value per share. 3× means investors pay $3 for every $1 on the books.", m: ["price / book", "price-to-book", "price ÷ book", "p/b"], how: "gap", see: ["book", "bvps"] },
  { k: "negbook", t: "Negative book value", cat: "bs", d: "When a company owes more than its recorded assets. It can come from years of losses, but also from large buybacks or borrowing to pay shareholders, so it's not always a sign of trouble.", m: ["negative book value", "book value is negative", "book value is already negative"], see: ["book", "buyback"] },
  { k: "gw", t: "Goodwill and intangibles", cat: "bs", d: "Assets you can't touch. Goodwill is the extra a company paid above the value of what it bought in an acquisition; intangibles include brands, patents and customer lists.", m: ["goodwill and intangibles", "goodwill", "intangibles"], see: ["hard", "writedown"] },
  { k: "hard", t: "Hard assets (tangible book value)", cat: "bs", d: "Book value with goodwill and intangibles taken out. It shows what's left from things like cash, property and equipment.", m: ["hard assets", "tangible book"], see: ["gw"] },
  { k: "cashinv", t: "Cash and investments", cat: "bs", d: "Cash in the bank plus short-term investments the company could turn into cash quickly.", m: ["cash and investments", "cash per share"], see: ["netdebt"] },

  // ---- Cash and debt
  { k: "debt", t: "Total debt", cat: "cash", d: "Money the company has borrowed and must pay back with interest: bank loans, bonds and similar borrowing.", m: ["total debt", "debt per share", "borrowed money", "borrowing"], see: ["wall", "netdebt", "convert"] },
  { k: "netdebt", t: "Net cash and net debt", cat: "cash", d: "Cash minus debt. Positive is net cash (more cash than debt); negative is net debt.", m: ["net debt", "net cash"], see: ["debt", "cashinv"] },
  { k: "wall", t: "Debt maturities (debt wall)", cat: "cash", d: "When borrowed money is due to be repaid. A big amount due in one year has to be paid from cash or borrowed again, possibly at a higher interest rate.", m: ["debt wall", "maturities", "comes due", "come due"], how: "wall", see: ["debt", "refi"] },
  { k: "refi", t: "Refinancing", cat: "cash", d: "Taking out new debt to pay off old debt that's coming due. Easy when lenders are confident and rates are low; expensive or impossible when they aren't.", m: ["refinance", "refinancing", "borrowed again", "borrow again"] },
  { k: "obs", t: "Off-balance-sheet obligations", cat: "cash", d: "Commitments the company has made that aren't counted as debt on the balance sheet, such as purchase contracts, guarantees and some leases.", m: ["off-balance-sheet", "off the balance sheet", "hidden obligations"], how: "obs", see: ["liab"] },
  { k: "ni", t: "Net income (reported profit)", cat: "cash", d: "Revenue minus all costs, interest and taxes for a period. It follows accounting rules, so it can differ a lot from the cash that actually came in.", m: ["net income", "reported profit", "profit"], see: ["fcf", "ocf"] },
  { k: "ocf", t: "Operating cash flow", cat: "cash", d: "Cash that came in from running the business during a period, after paying suppliers, staff and taxes.", m: ["operating cash flow", "cash from operations"], see: ["fcf"] },
  { k: "fcf", t: "Free cash flow", cat: "cash", d: "Operating cash flow minus capital spending (buildings and equipment). It's the cash left over to repay debt, buy back shares, pay dividends or save.", m: ["free cash flow"], how: "cash", see: ["ni", "ocf", "capex"] },
  { k: "capex", t: "Capital spending (capex)", cat: "cash", d: "Money spent on long-lasting things like factories, data centers, stores and equipment.", m: ["capital spending", "capex", "buildings and equipment"] },
  { k: "sbc", t: "Stock-based compensation", cat: "cash", d: "Paying employees with shares or options instead of cash. It doesn't use cash, but it adds new shares and dilutes existing owners.", m: ["stock-based compensation", "stock-based pay", "stock awards", "stock award"], see: ["dilution", "options"] },

  // ---- Health scores
  { k: "z", t: "Altman Z-Score", cat: "scores", d: "A 1968 formula by Edward Altman that combines five ratios (working capital, retained earnings, operating profit, market value against debt, and sales) into one score of financial stress.", ex: "Below 1.8: distress zone. 1.8 to 3: grey zone. Above 3: safe zone.", m: ["altman z-score", "z-score", "altman"], how: "z", see: ["zones", "f"] },
  { k: "zones", t: "Distress, grey and safe zones", cat: "scores", d: "The three bands of the Z-Score. Companies in the distress zone have historically gone bankrupt more often; it's a warning sign, not a prediction.", m: ["distress zone", "grey zone", "gray zone", "safe zone"], see: ["z"] },
  { k: "f", t: "Piotroski F-Score", cat: "scores", d: "A 0 to 9 score from 2000 by Joseph Piotroski. It gives one point for each of nine tests of profit, cash, debt, share issuance and efficiency improving from one year to the next.", ex: "8 or 9 is strong; 0 to 2 is weak.", m: ["piotroski f-score", "piotroski", "f-score"], see: ["z"] },

  // ---- Shares and dilution
  { k: "shares-out", t: "Shares outstanding", cat: "shares", d: "The total number of shares that exist and are held by investors. When it goes up, each share is a smaller slice of the company.", m: ["shares outstanding", "share count", "shares out"], see: ["dilution", "buyback"] },
  { k: "dilution", t: "Dilution", cat: "shares", d: "When a company issues new shares, each existing share owns a smaller slice of the company. It happens through stock pay, raising money and mergers paid for in stock.", ex: "If a company doubles its shares, your slice is cut in half.", m: ["dilution", "dilutes", "diluted", "new shares"], how: "future", see: ["buyback", "sbc", "options", "warrants"] },
  { k: "buyback", t: "Buyback", cat: "shares", d: "When a company buys its own shares and retires them. Fewer shares means each remaining share owns a bigger slice.", m: ["buybacks", "buyback", "bought back", "buys back"], see: ["dilution"] },
  { k: "split", t: "Stock split", cat: "shares", d: "Turning each share into several cheaper ones, such as 10-for-1. Your slice of the company and the value of your holding don't change.", m: ["stock split", "split"], see: ["rsplit"] },
  { k: "rsplit", t: "Reverse split", cat: "shares", d: "Combining several shares into one more expensive share, such as 1-for-10. Often used to lift a very low share price; your slice doesn't change on the day.", m: ["reverse split", "rev. split"], see: ["split"] },
  { k: "options", t: "Stock options", cat: "shares", d: "The right to buy shares later at a set price. If the share price ends up higher, the holder can buy shares cheaply, and new shares are usually issued for them.", m: ["stock options", "options"], see: ["dilution", "sbc"] },
  { k: "warrants", t: "Warrants", cat: "shares", d: "Like options, but usually given to investors or lenders as part of a financing deal. Using them creates new shares.", m: ["warrants", "warrant"], see: ["dilution"] },
  { k: "convert", t: "Convertible notes", cat: "shares", d: "Debt that the lender can swap for shares instead of being repaid in cash. If converted, new shares are created.", m: ["convertible notes", "convertible bonds", "convertible bond", "convertibles", "convertible"], see: ["debt", "dilution"] },
  { k: "ipo", t: "IPO and direct listing", cat: "shares", d: "The first time a company's shares trade on a public stock exchange. In an IPO it sells new shares; in a direct listing existing holders simply start trading.", m: ["ipo", "direct listing"], see: ["mt"] },
  { k: "merger", t: "Merger paid in stock", cat: "shares", d: "Buying another company with new shares instead of cash. The sellers become shareholders, so the share count jumps.", m: ["paid for in stock", "merger", "acquisition"], see: ["dilution", "gw"] },
  { k: "spin", t: "Spin-off", cat: "shares", d: "When a company splits off part of itself as a new public company and hands its shares to existing shareholders.", m: ["spin-off", "spun off", "spins off"] },
  { k: "div", t: "Dividends", cat: "shares", d: "Cash a company pays out to its shareholders, usually every quarter. Reinvesting means using that cash to buy more shares.", m: ["reinvested dividends", "dividends", "dividend"] },

  // ---- The $1M Test
  { k: "mt", t: "The $1M Test", cat: "mt", d: "What $1,000,000 invested at a starting point, such as the IPO, would be worth today, and how new shares or buybacks changed your slice along the way.", m: ["$1m test"], how: "mt", see: ["dilution", "inflation"] },
  { k: "inflation", t: "Inflation and buying power", cat: "mt", d: "Prices rise over time, so the same dollar buys less. The orange line on the $1M Test shows what $1M had to grow to just to buy the same amount as when you invested.", ex: "$1,000 in 1930 had about the buying power of $20,000 today.", m: ["inflation", "buying power", "today's dollars"], see: ["cpi", "mt"] },
  { k: "cpi", t: "Consumer Price Index (CPI)", cat: "mt", d: "The government's measure of how much everyday prices have risen, published monthly by the U.S. Bureau of Labor Statistics since 1913. X-Ray uses CPI-U, the index for all urban consumers.", m: ["consumer price index", "cpi-u", "cpi"], see: ["inflation"] },
  { k: "log", t: "Log scale", cat: "mt", d: "A chart scale where each step up is the same percentage gain, not the same dollar amount. It keeps long histories readable: going from $1M to $2M looks the same as $100M to $200M.", m: ["log scale"] },
  { k: "multiple", t: "Return multiple (×)", cat: "mt", d: "How many times your money grew. 3× means $1 became $3; 0.5× means it halved." },

  // ---- Board, insiders and control
  { k: "board", t: "Board of directors", cat: "people", d: "The group shareholders elect to oversee the company. It hires and fires the CEO, sets executive pay and approves big decisions.", m: ["board of directors", "board member", "board members", "the board"], see: ["indep", "chair", "lead"] },
  { k: "indep", t: "Independent director", cat: "people", d: "A board member who doesn't work for the company and has no major business ties to it, meant to check management on shareholders' behalf.", m: ["independent director", "independent directors", "outside director"], see: ["board"] },
  { k: "chair", t: "Chair (and CEO as chair)", cat: "people", d: "The chair runs the board. When the CEO is also the chair, the person being overseen leads the overseers, which is common in the U.S. but reduces independent oversight.", m: ["chairman", "chair"], see: ["lead", "ceo"] },
  { k: "lead", t: "Lead independent director", cat: "people", d: "An independent director chosen to lead the other independent directors, usually when the CEO is also the chair.", m: ["lead independent director", "lead director"], see: ["chair"] },
  { k: "ceo", t: "CEO and executives", cat: "people", d: "The chief executive officer runs the company day to day. Executives (such as the CFO, who runs the finances) are the top managers the board appoints.", m: ["ceo", "chief executive", "cfo", "executives", "executive"] },
  { k: "insider", t: "Insiders and Form 4", cat: "people", d: "Directors, top executives and holders of more than 10% of the shares. They must report their trades in company stock on SEC Form 4 within two business days.", m: ["form 4", "insiders", "insider"], how: "ins", see: ["plan"] },
  { k: "plan", t: "Pre-scheduled trading plan (10b5-1)", cat: "people", d: "A plan an insider sets up in advance to sell or buy shares on a schedule. Trades under it were decided months earlier, so they say less about what the insider thinks today.", m: ["10b5-1", "scheduled", "trading plan"] },
  { k: "vote", t: "Voting control and share classes", cat: "people", d: "Some companies have more than one class of shares with different votes per share. A founder can then control the votes while owning a minority of the company.", ex: "Class B shares with 10 votes each against Class A with 1.", m: ["voting control", "votes per share", "class of share", "share classes", "share class", "voting"], how: "vote", see: ["holders"] },
  { k: "holders", t: "Large holders (13D and 13G)", cat: "people", d: "Anyone who owns more than 5% of a company must tell the SEC. A 13G is filed by passive investors such as index funds; a 13D by investors who may try to influence the company.", m: ["13d", "13g", "large holders", "largest holders", "large holder"], see: ["vote", "activist"] },
  { k: "rp", t: "Related-party transactions", cat: "people", d: "Business deals between the company and its own insiders, large holders or their families, such as leases, loans or services. They must be disclosed because insiders sit on both sides.", m: ["related-party", "related party"], how: "rp", see: ["proxy"] },
  { k: "pvp", t: "Pay versus performance", cat: "people", d: "A table in the proxy statement that sets executive pay next to shareholder returns for the same years, so you can see whether pay followed results.", m: ["pay versus performance", "pay vs. performance", "executive pay"], how: "pvp", see: ["tsr", "cap"] },
  { k: "tsr", t: "Total shareholder return (TSR)", cat: "people", d: "How much a $100 investment in the stock grew over a period, counting both the price change and reinvested dividends.", m: ["total shareholder return", "shareholder returns", "shareholder return", "tsr"], see: ["pvp"] },
  { k: "cap", t: "Compensation actually paid", cat: "people", d: "The SEC's measure of executive pay that counts stock awards at their current value, so it rises and falls with the share price. It can differ a lot from the pay figure in the summary table.", m: ["compensation actually paid", "actually paid", "reported pay"], see: ["pvp"] },

  // ---- Investors and red flags
  { k: "pe", t: "Private equity", cat: "flags", d: "Firms that buy companies (often with a lot of borrowed money), try to improve them and sell them a few years later. Board members with private-equity ties may bring deal experience, or potential conflicts.", m: ["private equity", "private-equity", "buyout"], see: ["credit", "vc", "board"] },
  { k: "credit", t: "Distressed and private credit", cat: "flags", d: "Investors who lend to companies outside the banking system, or buy the debt of struggling companies, sometimes ending up owning them after a restructuring.", m: ["distressed credit", "private credit", "distressed debt", "distressed"], see: ["pe"] },
  { k: "vc", t: "Venture capital", cat: "flags", d: "Investors who buy stakes in young, fast-growing private companies in exchange for a share of ownership.", m: ["venture capital", "growth equity"], see: ["pe"] },
  { k: "activist", t: "Activist investor", cat: "flags", d: "An investor who buys a stake to push for changes, such as new board members, a sale of the company or bigger buybacks.", m: ["activist investor", "activist"], see: ["holders"] },
  { k: "restate", t: "Restatement", cat: "flags", d: "When a company has to correct financial statements it already published because they contained errors.", m: ["restatements", "restatement", "restated", "restate"], how: "flags", see: ["auditor"] },
  { k: "auditor", t: "Auditor change", cat: "flags", d: "When the independent accounting firm that checks the company's books resigns or is replaced. Sometimes routine, sometimes a sign of disagreement.", m: ["auditor changes", "auditor change", "auditor"] },
  { k: "going", t: "Going-concern warning", cat: "flags", d: "A warning in the filings that the company may not have enough money to keep operating for the next year.", m: ["going-concern", "going concern"] },
  { k: "writedown", t: "Write-down (impairment)", cat: "flags", d: "Cutting the recorded value of an asset, often goodwill from an old acquisition, because it's worth less than the books said. It lowers profit and book value.", m: ["write-downs", "write-down", "impairment", "written down"], see: ["gw"] },
  { k: "late", t: "Late filing", cat: "flags", d: "When a company misses the deadline for its annual or quarterly report. It can point to accounting problems.", m: ["late filing", "filed late"] },
  { k: "bankrupt", t: "Bankruptcy (Chapter 11)", cat: "flags", d: "A court process for a company that can't pay its debts. In Chapter 11 it keeps operating while it restructures; shareholders are paid last and often lose everything.", m: ["chapter 11", "bankruptcy", "bankrupt"], see: ["credit", "zones"] },

  // ---- Charts in X-Ray (each also shows that chart's "How to read this")
  { k: "chart-price", t: "Price vs. books chart", cat: "charts", d: "The main X-Ray chart: the share price (white) against book value per share (cyan) over time.", how: "price", see: ["book", "pb"] },
  { k: "chart-body", t: "Balance sheet body", cat: "charts", d: "The balance sheet drawn as an X-ray of a body: what the company owns, what it owes (red) and what's left (cyan).", how: "body", see: ["bs"] },
  { k: "chart-gap", t: "Price-to-book over time", cat: "charts", d: "How many dollars investors paid for each dollar on the books, quarter by quarter.", how: "gap", see: ["pb"] },
  { k: "chart-wall", t: "Debt wall chart", cat: "charts", d: "Bars showing how much borrowed money comes due each year.", how: "wall", see: ["wall"] },
  { k: "chart-obs", t: "Hidden obligations", cat: "charts", d: "Commitments listed in the notes to the financial statements that aren't counted as debt.", how: "obs", see: ["obs"] },
  { k: "chart-z", t: "Z-Score card", cat: "charts", d: "The company's Altman Z-Score and which zone it falls in.", how: "z", see: ["z", "zones"] },
  { k: "chart-cash", t: "Profit vs. cash chart", cat: "charts", d: "Reported profit next to free cash flow for each year.", how: "cash", see: ["ni", "fcf"] },
  { k: "chart-flags", t: "Red flags timeline", cat: "charts", d: "Events from the filings that often deserve a closer look.", how: "flags", see: ["restate", "going"] },
  { k: "chart-mt", t: "$1M Test", cat: "charts", d: "What $1M became, the slice you'd own now, and the After inflation chart.", how: "mt", see: ["mt", "inflation"] },
  { k: "chart-future", t: "Future dilution", cat: "charts", d: "How much your slice would shrink if every option, award, warrant and convertible became stock.", how: "future", see: ["dilution"] },
  { k: "chart-vote", t: "Voting control", cat: "charts", d: "Who controls the shareholder votes, by class of share.", how: "vote", see: ["vote"] },
  { k: "chart-ins", t: "Insider trades", cat: "charts", d: "Insider purchases and sales over the last 12 months.", how: "ins", see: ["insider"] },
  { k: "chart-pvp", t: "Pay vs. performance chart", cat: "charts", d: "CEO pay next to total shareholder return.", how: "pvp", see: ["pvp", "tsr"] },
  { k: "chart-rp", t: "Deals with insiders", cat: "charts", d: "The proxy statement's section on deals with insiders and large holders.", how: "rp", see: ["rp"] },
  { k: "chart-cmp", t: "Compare", cat: "charts", d: "Your picked companies ranked by one measure.", how: "cmp" },
];
const GLK = Object.fromEntries(GLOSSARY.map(g => [g.k, g]));

/* ---------- beginner mode setting ---------- */
const BEGIN = {
  get() { const v = store.get("beginner", null); return v === null ? (ACCT.get() || {}).exp === "New" : !!v; },
  set(v) { store.set("beginner", !!v); markTerms(); },
};

/* During sign-up the experience answer isn't saved yet: "New" means on unless they've switched it. */
function obBegin() { const v = store.get("beginner", null); return v === null ? OB.exp === "New" : !!v; }

/* ---------- the Learn screen ---------- */
function viewLearn() {
  const back = S.ret ? `<button class="iconbtn" data-learnback="1"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M11 4L6 9l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(S.ret.label)}</button>` : "<span></span>";
  const on = BEGIN.get();
  $("#app").innerHTML = `<div class="learnview">
    <div class="bar">${back}<span></span></div>
    <h1 class="obh" style="margin:4px 0 0">Learn</h1>
    <p class="note" style="margin:0">What every term and chart in X-Ray means, in plain English.</p>
    <div class="card begincard"><div><b>Beginner mode</b><span>Underlines terms on every screen. Tap one to see what it means here. Not underlined? Press and hold any word to look it up.</span></div>
      <button class="tog${on ? " on" : ""}" data-begin="1" role="switch" aria-checked="${on}" aria-label="Beginner mode"><i></i></button></div>
    <input class="gsearch" id="gsearch" type="search" placeholder="Search terms" aria-label="Search terms" autocomplete="off">
    <div class="gcats">${GLOSSARY_CATS.map(([k, l]) => `<button data-gcat="${k}">${l}</button>`).join("")}</div>
    <div class="card gask" id="gnone" hidden><p class="note" style="margin:0">Nothing in Learn matches "<b id="gq"></b>" yet.</p>
      <button class="obghost" id="gaskbtn" data-askterm="1">Ask us to add it</button><p class="note" id="gaskdone" hidden style="margin:0"></p></div>
    ${GLOSSARY_CATS.map(([ck, cl]) => `<section class="gsec" id="gsec-${ck}"><h2>${cl}</h2>
      ${GLOSSARY.filter(g => g.cat === ck).map(gEntry).join("")}</section>`).join("")}
    <div class="card gask"><p class="note" style="margin:0">Something missing, wrong or confusing in X-Ray? Tell us.</p>${feedbackButton()}</div>
    ${footer()}</div>`;
  const s = $("#gsearch");
  s.oninput = () => {
    const q = s.value.trim().toLowerCase(); let any = false;
    document.querySelectorAll(".gentry").forEach(el => { const g = GLK[el.dataset.k]; const hit = !q || (g.t + " " + g.d + " " + (g.m || []).join(" ")).toLowerCase().includes(q); el.hidden = !hit; if (hit) any = true; if (q && hit) el.open = true; });
    document.querySelectorAll(".gsec").forEach(sec => { sec.hidden = ![...sec.querySelectorAll(".gentry")].some(e => !e.hidden); });
    $("#gnone").hidden = any || !q;
    $("#gq").textContent = s.value.trim();
    const asked = (store.get("askedTerms", []) || []).includes(q);
    $("#gaskbtn").hidden = asked; $("#gaskdone").hidden = !asked;
    if (asked) $("#gaskdone").textContent = "Thanks, you've asked for this one. We'll add it to Learn.";
  };
  if (S.gq) { s.value = S.gq; s.oninput(); S.gq = null; requestAnimationFrame(() => s.scrollIntoView({ block: "start" })); }
  if (S.term && GLK[S.term]) {
    const el = document.getElementById("g-" + S.term);
    if (el) { el.open = true; el.classList.add("flash"); requestAnimationFrame(() => el.scrollIntoView({ block: "center" })); setTimeout(() => el.classList.remove("flash"), 1600); }
  }
}
function gEntry(g) {
  const h = g.how && HOW[g.how];
  return `<details class="gentry" id="g-${g.k}" data-k="${g.k}"><summary><b>${esc(g.t)}</b><span>${g.d}</span></summary>
    ${g.ex ? `<p class="gex"><b>Example</b> ${esc(g.ex)}</p>` : ""}
    ${h ? `<dl><dt>What the chart shows</dt><dd>${h[0]}</dd><dt>How to read it</dt><dd>${h[1]}</dd><dt>What it can't tell you</dt><dd>${h[2]}</dd></dl>` : ""}
    ${(g.see || []).filter(k => GLK[k]).length ? `<div class="gsee"><span>Related</span>${g.see.filter(k => GLK[k]).map(k => `<button data-term="${k}">${esc(GLK[k].t)}</button>`).join("")}</div>` : ""}
  </details>`;
}

/* ---------- jumping to an entry, and back ---------- */
function rememberReturn() {
  if (S.view === "learn") return;
  const c = S.view === "company" ? co(S.t) : null;
  S.ret = { view: S.view, t: S.t, tab: S.tab, y: window.scrollY || 0, label: c ? `Back to ${c.t}` : S.view === "compare" ? "Back to Compare" : "Back" };
}
function openTerm(k) {
  if (!GLK[k]) return;
  rememberReturn();
  document.getElementById("sheet").innerHTML = "";
  S.term = k; S.gq = null; S.view = "learn"; render();
  if (S.ret == null) window.scrollTo?.(0, 0);
}
/* Look up any word or phrase: straight to its entry when one matches, otherwise Learn searched for it. */
function lookUp(raw) {
  const w = String(raw || "").replace(/\s+/g, " ").trim().replace(/^[^\w$]+|[^\w%)]+$/g, "").slice(0, 80);
  if (!w) return;
  const lw = w.toLowerCase(), plain = t => t.toLowerCase().replace(/\s*\(.*?\)/g, "").trim();
  const k = termIndex.get(lw) || (GLOSSARY.find(g => g.t.toLowerCase() === lw || plain(g.t) === lw) || {}).k;
  if (k) return openTerm(k);
  rememberReturn();
  document.getElementById("sheet").innerHTML = "";
  S.term = null; S.gq = w; S.view = "learn"; render();
}
function learnBack() {
  const r = S.ret; S.ret = null; S.term = null;
  if (!r) return go("search");
  Object.assign(S, { view: r.view, t: r.t, tab: r.tab }); render();
  requestAnimationFrame(() => window.scrollTo?.(0, r.y));
}

/* ---------- beginner mode: underline terms ---------- */
const SKIP = "button,a,svg,input,textarea,select,label,summary,h1,.gterm,.co-name,.plate,.num,.big,.mbig,.bar,.tabs,.nav,.src,.learnview,.obwrap,.sheet,.foot,script,style";
let TERM_RE = null;
const termIndex = (() => {
  const map = new Map();
  for (const g of GLOSSARY) for (const p of g.m || []) if (!map.has(p.toLowerCase())) map.set(p.toLowerCase(), g.k);
  return map;
})();
function termRegex() {
  if (TERM_RE) return TERM_RE;
  const phrases = [...termIndex.keys()].sort((a, b) => b.length - a.length).map(p => p.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
  return TERM_RE = new RegExp(`(?<![A-Za-z0-9$])(${phrases.join("|")})(?![A-Za-z0-9])`, "gi");
}
let marking = false, markQueued = false;
function markTerms() {
  const app = document.getElementById("app"); if (!app) return;
  marking = true;
  if (!BEGIN.get() || S.view === "learn" || S.view === "intro" || S.view === "lock") {
    app.querySelectorAll(".gterm").forEach(el => el.replaceWith(document.createTextNode(el.textContent)));
    app.normalize(); marking = false; return;
  }
  // each card (and each "How to read this" box) gets its own first mention, so a term is underlined near where you read it
  const seen = new Map(), scopeOf = el => el.closest(".card,.howto,.mcard") || app;
  const seenIn = sc => seen.get(sc) || seen.set(sc, new Set()).get(sc);
  app.querySelectorAll(".gterm").forEach(el => seenIn(scopeOf(el)).add(el.dataset.term));
  const re = termRegex(), walker = document.createTreeWalker(app, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.nodeValue.trim().length > 2 && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) {
    const text = n.nodeValue, inCard = seenIn(scopeOf(n.parentElement)); re.lastIndex = 0;
    let m, last = 0, frag = null;
    while ((m = re.exec(text))) {
      const k = termIndex.get(m[1].toLowerCase());
      if (!k || inCard.has(k)) continue;
      inCard.add(k); frag = frag || document.createDocumentFragment();
      frag.append(text.slice(last, m.index));
      const b = document.createElement("button");
      b.className = "gterm"; b.dataset.term = k; b.textContent = m[1]; b.setAttribute("aria-label", `${m[1]}: what this means`);
      frag.append(b); last = m.index + m[1].length;
    }
    if (frag) { frag.append(text.slice(last)); n.replaceWith(frag); }
  }
  marking = false;
}
/* Re-mark whenever a screen or tab redraws. */
new MutationObserver(() => {
  if (marking || markQueued) return;
  markQueued = true;
  requestAnimationFrame(() => { markQueued = false; markTerms(); });
}).observe(document.getElementById("app"), { childList: true, subtree: true });

document.addEventListener("click", e => {
  const t = e.target.closest('[data-term],[data-begin],[data-learnback],[data-gcat],[data-nav="learn"]'); if (!t) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (t.dataset.nav === "learn") { S.ret = null; S.term = null; return go("learn"); }
  if (t.dataset.term) return openTerm(t.dataset.term);
  if (t.dataset.learnback) return learnBack();
  if (t.dataset.gcat) return document.getElementById("gsec-" + t.dataset.gcat)?.scrollIntoView({ block: "start" });
  if (t.dataset.begin) {
    const v = !(S.view === "intro" ? obBegin() : BEGIN.get()); BEGIN.set(v);
    t.classList.toggle("on", v); t.setAttribute("aria-checked", v);
    if (S.view !== "learn") toast(v ? "Beginner mode is on. Tap an underlined term to see what it means." : "Beginner mode is off.");
  }
}, true);

/* ---------- "Ask us to add it": terms people looked for and didn't find ---------- */
async function askForTerm(btn) {
  const term = ($("#gsearch").value || "").trim().slice(0, 80); if (!term) return;
  const cfg = window.XRAY_CONFIG || {}, url = (cfg.supabaseUrl || "").replace(/\/$/, ""), key = cfg.supabaseKey || "";
  const screen = S.ret ? (S.ret.t || S.ret.view) : "learn";
  btn.disabled = true; btn.textContent = "Sending…";
  let ok = false;
  try {
    const r = await fetch(`${url}/rest/v1/term_requests`, { method: "POST", headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ term, screen }) });
    ok = r.ok;
  } catch (e) { ok = false; }
  if (!ok) {  // offline or not set up: hand it to the email app instead
    location.href = `mailto:support@x-ray.live?subject=${encodeURIComponent("Please add a term to X-Ray Learn")}&body=${encodeURIComponent(`I looked for "${term}" in Learn and couldn't find it.`)}`;
    btn.disabled = false; btn.textContent = "Ask us to add it"; return;
  }
  store.set("askedTerms", [...(store.get("askedTerms", []) || []), term.toLowerCase()].slice(-200));
  btn.hidden = true; const d = $("#gaskdone"); d.hidden = false; d.textContent = `Thanks. We'll add "${term}" to Learn.`;
}

/* ---------- press and hold (or select) any words to look them up ---------- */
let pillTimer = null;
function lookPill() {
  let el = document.getElementById("lookpill");
  if (!el) { el = document.createElement("button"); el.id = "lookpill"; el.className = "lookpill"; el.dataset.lookup = "1"; el.hidden = true; document.body.append(el); }
  return el;
}
function placePill() {
  const pill = lookPill(), sel = window.getSelection && window.getSelection();
  const text = sel && sel.rangeCount ? sel.toString().replace(/\s+/g, " ").trim() : "";
  const node = sel && sel.anchorNode, app = document.getElementById("app");
  const inApp = node && app && app.contains(node.nodeType === 1 ? node : node.parentElement);
  if (!text || text.length > 60 || !inApp || ["intro", "lock", "learn"].includes(S.view)) { pill.hidden = true; return; }
  const r = sel.getRangeAt(0).getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) { pill.hidden = true; return; }  // the selected words scrolled off screen
  pill.dataset.text = text;
  pill.textContent = `Look up "${text.length > 28 ? text.slice(0, 27) + "…" : text}" in Learn`;
  pill.hidden = false;
  const w = pill.offsetWidth, h = pill.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  let top = r.bottom + 10; if (top + h > vh - 70) top = Math.max(8, r.top - h - 10);  // below the words, clear of the phone's own copy/share bar
  pill.style.top = top + "px"; pill.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), vw - w - 8) + "px";
}
document.addEventListener("selectionchange", () => { clearTimeout(pillTimer); pillTimer = setTimeout(placePill, 220); });
window.addEventListener("scroll", () => { const p = document.getElementById("lookpill"); if (p && !p.hidden) placePill(); }, { passive: true });
document.addEventListener("click", e => {
  const t = e.target.closest("[data-lookup],[data-askterm]"); if (!t) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (t.dataset.askterm) return askForTerm(t);
  const text = t.dataset.text; t.hidden = true;
  try { window.getSelection().removeAllRanges(); } catch (err) {}
  lookUp(text);
}, true);
