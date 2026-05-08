// ==========================================
// CARD SATHI — Indian Credit Card Guide
// ==========================================

let selectedCategory = "all";
let selectedTier = "all";

function formatCurrency(amount) {
    if (amount >= 100000) return "₹" + (amount / 100000).toFixed(1) + "L";
    if (amount >= 1000) return "₹" + (amount / 1000).toFixed(0) + "K";
    return "₹" + amount;
}

function formatCurrencyFull(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function getTierLabel(tier) {
    const labels = {
        entry: "Entry Level",
        mid: "Mid Range",
        premium: "Premium",
        super: "Super Premium",
        hni: "HNI"
    };
    return labels[tier] || tier;
}

function getTierClass(tier) {
    return "tier-" + tier;
}

function getSalaryTier(salary) {
    if (salary >= 500000) return "hni";
    if (salary >= 200000) return "super";
    if (salary >= 75000) return "premium";
    if (salary >= 40000) return "mid";
    return "entry";
}

function getProfileText(salary) {
    const annualIncome = salary * 12;
    const annualLakhs = (annualIncome / 100000).toFixed(1);
    const tier = getSalaryTier(salary);
    const tierName = getTierLabel(tier);

    const recommendations = {
        entry: "You qualify for Entry Level cards. Focus on lifetime-free cards with cashback — SBI Cashback, Amazon Pay ICICI, and Scapia are your best bets. Build credit history for 6-12 months to unlock mid-range cards.",
        mid: "You qualify for Mid-Range cards with good rewards. Cards like HDFC Swiggy BLCK, Axis ACE, and BOB Eterna offer excellent value. You can also look at IndusInd Tiger for travel perks.",
        premium: "You qualify for Premium tier cards. HDFC Regalia Gold, ICICI Sapphiro, and SBI Card ELITE offer lounge access, travel rewards, and premium benefits. This is the sweet spot for value.",
        super: "You qualify for Super Premium cards. HDFC Diners Club Black and SC Ultimate offer 3.3%+ reward rates. These cards pay for themselves through lounge access and rewards alone.",
        hni: "You qualify for HNI/Ultra Premium cards. HDFC Infinia, Axis Magnus, and Amex Platinum are available to you. These offer the best reward rates (5-10%+) and unlimited global lounge access."
    };

    return "Based on <strong>" + formatCurrencyFull(salary) + "/month salary</strong> (~₹" + annualLakhs + "L annual), you qualify for <strong>" + tierName + " tier cards</strong>. " + recommendations[tier];
}

function createCardHTML(card, isBestMatch) {
    const feeText = card.annualFee === 0 ? "FREE" : formatCurrencyFull(card.annualFee);
    const joinText = card.joiningFee === 0 ? "FREE" : formatCurrencyFull(card.joiningFee);

    let highlightsHTML = "";
    card.highlights.forEach(function(h) {
        const iconClass = h.type === "good" ? "highlight-good" : h.type === "warn" ? "highlight-warn" : "highlight-info";
        const icon = h.type === "good" ? "✓" : h.type === "warn" ? "!" : "i";
        highlightsHTML += '<div class="highlight"><span class="highlight-icon ' + iconClass + '">' + icon + '</span><span>' + h.text + '</span></div>';
    });

    let tagsHTML = "";
    card.bestFor.forEach(function(tag) {
        tagsHTML += '<span class="tag">' + tag.charAt(0).toUpperCase() + tag.slice(1) + '</span>';
    });

    return '<div class="card" data-tier="' + card.tier + '" data-id="' + card.id + '">' +
        (isBestMatch ? '<div class="best-match-badge">Best Match</div>' : '') +
        '<div class="card-header"><div><div class="card-name">' + card.name + '</div><div class="card-bank">' + card.bank + '</div></div>' +
        '<span class="card-tier ' + getTierClass(card.tier) + '">' + getTierLabel(card.tier) + '</span></div>' +
        '<div class="card-fee"><span><span class="fee-label">Joining:</span> <span class="fee-value">' + joinText + '</span></span>' +
        '<span><span class="fee-label">Annual:</span> <span class="fee-value">' + feeText + '</span></span></div>' +
        '<div style="margin-bottom:12px;padding:10px;background:#f0f9ff;border-radius:8px;font-size:0.88rem">' +
        '<strong style="color:#1a56db">Rewards:</strong> ' + card.rewardRate + '</div>' +
        '<div class="card-highlights">' + highlightsHTML + '</div>' +
        '<div class="card-tags">' + tagsHTML +
        (card.feeWaiver !== "Lifetime Free" && card.feeWaiver !== "No waiver — premium lifestyle card" ? '<span class="tag" style="background:#d1fae5;color:#065f46">Waiver: ' + card.feeWaiver + '</span>' : '') +
        (card.feeWaiver === "Lifetime Free" ? '<span class="tag" style="background:#d1fae5;color:#065f46">Lifetime Free</span>' : '') +
        '</div>' +
        '<details style="margin-bottom:14px;font-size:0.84rem"><summary style="cursor:pointer;font-weight:600;color:#1a56db;margin-bottom:8px">Full Details & How to Apply</summary>' +
        '<div style="padding:12px;background:#f8fafc;border-radius:8px">' +
        '<p style="margin-bottom:8px"><strong>Reward Details:</strong> ' + card.rewardDetails + '</p>' +
        '<p style="margin-bottom:8px"><strong>Lounge:</strong> ' + card.lounge + '</p>' +
        '<p style="margin-bottom:8px"><strong>Fuel Waiver:</strong> ' + card.fuelWaiver + '</p>' +
        '<p style="margin-bottom:8px"><strong>Forex Markup:</strong> ' + card.forexMarkup + '</p>' +
        '<p style="margin-bottom:8px"><strong>Welcome Benefit:</strong> ' + card.welcomeBenefit + '</p>' +
        '<p style="margin-bottom:8px"><strong>Milestones:</strong> ' + card.milestoneBenefits + '</p>' +
        '<p style="margin-bottom:8px"><strong>Eligibility:</strong> ' + card.eligibility + '</p>' +
        '<p style="margin-bottom:8px"><strong>How to Apply:</strong> ' + card.howToApply + '</p>' +
        '<p style="margin-bottom:0;padding:8px;background:#fef3c7;border-radius:6px"><strong>Creator Tip:</strong> ' + card.creatorTip + '</p>' +
        '</div></details>' +
        '<div class="card-footer"><div class="card-salary">Min Salary: <strong>' + formatCurrency(card.minSalary) + '/mo</strong></div>' +
        '<a href="' + card.applyUrl + '" target="_blank" class="apply-btn">Apply Now</a></div></div>';
}

function getMatchingCards(salary, spend, category) {
    return CREDIT_CARDS.filter(function(card) {
        const salaryMatch = salary >= card.minSalary;
        const categoryMatch = category === "all" || card.bestFor.indexOf(category) !== -1;
        return salaryMatch && categoryMatch;
    }).sort(function(a, b) {
        const aSpendMatch = spend >= a.minSpend ? 1 : 0;
        const bSpendMatch = spend >= b.minSpend ? 1 : 0;
        if (aSpendMatch !== bSpendMatch) return bSpendMatch - aSpendMatch;

        const tierOrder = { entry: 1, mid: 2, premium: 3, super: 4, hni: 5 };
        const userTier = getSalaryTier(salary);
        const userTierNum = tierOrder[userTier];
        const aDist = Math.abs(tierOrder[a.tier] - userTierNum);
        const bDist = Math.abs(tierOrder[b.tier] - userTierNum);
        if (aDist !== bDist) return aDist - bDist;

        return b.annualFee - a.annualFee;
    });
}

function updateRecommendations() {
    const salary = parseInt(document.getElementById("salarySlider").value);
    const spend = parseInt(document.getElementById("spendSlider").value);

    document.getElementById("salaryDisplay").textContent = formatCurrencyFull(salary);
    document.getElementById("spendDisplay").textContent = formatCurrencyFull(spend);

    document.getElementById("profileSummary").innerHTML = "<p>" + getProfileText(salary) + "</p>";

    const matches = getMatchingCards(salary, spend, selectedCategory);
    const topMatches = matches.slice(0, 6);

    let html = "";
    topMatches.forEach(function(card, i) {
        html += createCardHTML(card, i === 0);
    });

    if (topMatches.length === 0) {
        html = '<div style="text-align:center;padding:40px;color:#64748b">No cards match your current filters. Try adjusting your salary, spend, or category.</div>';
    }

    document.getElementById("recommendedCards").innerHTML = html;
}

function renderAllCards() {
    let filtered = CREDIT_CARDS;
    if (selectedTier !== "all") {
        filtered = CREDIT_CARDS.filter(function(c) { return c.tier === selectedTier; });
    }

    let html = "";
    filtered.forEach(function(card) {
        html += createCardHTML(card, false);
    });

    document.getElementById("allCards").innerHTML = html;
}

function selectCategory(btn) {
    document.querySelectorAll(".chip").forEach(function(c) { c.classList.remove("active"); });
    btn.classList.add("active");
    selectedCategory = btn.getAttribute("data-category");
    updateRecommendations();
}

function filterTier(btn) {
    document.querySelectorAll(".tier-btn").forEach(function(b) { b.classList.remove("active"); });
    btn.classList.add("active");
    selectedTier = btn.getAttribute("data-tier");
    renderAllCards();
}

function populateCompareDropdowns() {
    var selects = [document.getElementById("compare1"), document.getElementById("compare2"), document.getElementById("compare3")];
    selects.forEach(function(sel) {
        CREDIT_CARDS.forEach(function(card) {
            var opt = document.createElement("option");
            opt.value = card.id;
            opt.textContent = card.name + " (" + card.bank + ")";
            sel.appendChild(opt);
        });
    });
}

function updateComparison() {
    var ids = [
        document.getElementById("compare1").value,
        document.getElementById("compare2").value,
        document.getElementById("compare3").value
    ].filter(function(id) { return id !== ""; });

    if (ids.length === 0) {
        document.getElementById("comparisonTable").innerHTML = '<p style="text-align:center;color:#64748b;padding:20px">Select cards above to compare</p>';
        return;
    }

    var cards = ids.map(function(id) {
        return CREDIT_CARDS.find(function(c) { return c.id === id; });
    }).filter(Boolean);

    var rows = [
        ["Bank", function(c) { return c.bank; }],
        ["Tier", function(c) { return getTierLabel(c.tier); }],
        ["Joining Fee", function(c) { return c.joiningFee === 0 ? "FREE" : formatCurrencyFull(c.joiningFee); }],
        ["Annual Fee", function(c) { return c.annualFee === 0 ? "FREE" : formatCurrencyFull(c.annualFee); }],
        ["Fee Waiver", function(c) { return c.feeWaiver; }],
        ["Min Salary", function(c) { return formatCurrency(c.minSalary) + "/month"; }],
        ["Reward Rate", function(c) { return c.rewardRate; }],
        ["Reward Details", function(c) { return c.rewardDetails; }],
        ["Lounge Access", function(c) { return c.lounge; }],
        ["Fuel Surcharge Waiver", function(c) { return c.fuelWaiver; }],
        ["Forex Markup", function(c) { return c.forexMarkup; }],
        ["Welcome Benefit", function(c) { return c.welcomeBenefit; }],
        ["Milestones", function(c) { return c.milestoneBenefits; }],
        ["Best For", function(c) { return c.bestFor.join(", "); }],
        ["Eligibility", function(c) { return c.eligibility; }],
        ["How to Apply", function(c) { return c.howToApply; }],
        ["Creator Tip", function(c) { return c.creatorTip; }]
    ];

    var html = '<table class="comparison-table"><thead><tr><th>Feature</th>';
    cards.forEach(function(c) {
        html += '<th>' + c.name + '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.forEach(function(row) {
        html += '<tr><td><strong>' + row[0] + '</strong></td>';
        cards.forEach(function(c) {
            html += '<td>' + row[1](c) + '</td>';
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById("comparisonTable").innerHTML = html;
}

function toggleMobileMenu() {
    document.querySelector(".nav-links").classList.toggle("active");
}

// Initialize — only init elements that exist on the current page
document.addEventListener("DOMContentLoaded", function() {
    var salarySlider = document.getElementById("salarySlider");
    var spendSlider = document.getElementById("spendSlider");
    if (salarySlider && spendSlider) {
        salarySlider.addEventListener("input", updateRecommendations);
        spendSlider.addEventListener("input", updateRecommendations);
        updateRecommendations();
    }

    if (document.getElementById("allCards")) {
        renderAllCards();
    }

    if (document.getElementById("compare1")) {
        populateCompareDropdowns();
        updateComparison();
    }
});
