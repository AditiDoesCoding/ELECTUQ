export const electionData = {
    timelinePhases: [
        { title: "ECI Announcement", date: "Jan 05, 2026", desc: "Model Code of Conduct starts immediately.", bullets: ["SOPs issued", "Transfer of officials frozen"] },
        { title: "Nomination Filing", date: "Jan 15 - Jan 30", desc: "Candidates submit papers.", bullets: ["Form 2A/2B submission", "Affidavits filed"] },
        { title: "Voter Registration", date: "Closing Feb 10", desc: "Final window to register.", bullets: ["Verify name in roll", "Get EPIC card"] },
        { title: "Polling Phases", date: "April - May 2026", desc: "7 phases across India.", bullets: ["Phase 1: April 19", "Phase 7: June 1"] },
        { title: "Counting Day", date: "June 04, 2026", desc: "Results declared.", bullets: ["EVM counting", "VVPAT audit"] }
    ],
    stateRules: {
        "Andhra Pradesh": { phase: 4, votingDate: "May 13, 2026", seats: 25, cm: "N. Chandrababu Naidu", capital: "Amaravati", party: "TDP (NDA)", details: "Focus on state capital development." },
        "Arunachal Pradesh": { phase: 1, votingDate: "April 19, 2026", seats: 2, cm: "Pema Khandu", capital: "Itanagar", party: "BJP", details: "Single phase voting." },
        "Assam": { phase: "1-3", votingDate: "April-May 2026", seats: 14, cm: "Himanta Biswa Sarma", capital: "Dispur", party: "BJP", details: "Voting spread across 3 phases." },
        "Bihar": { phase: "1-7", votingDate: "Multiple Dates", seats: 40, cm: "Nitish Kumar", capital: "Patna", party: "JD(U) - NDA", details: "Major battleground state with 7 phases." },
        "Chhattisgarh": { phase: "1-3", votingDate: "April-May 2026", seats: 11, cm: "Vishnu Deo Sai", capital: "Raipur", party: "BJP", details: "Focus on tribal welfare and mining." },
        "Goa": { phase: 3, votingDate: "May 7, 2026", seats: 2, cm: "Pramod Sawant", capital: "Panaji", party: "BJP", details: "Single phase voting." },
        "Gujarat": { phase: 3, votingDate: "May 7, 2026", seats: 26, cm: "Bhupendra Patel", capital: "Gandhinagar", party: "BJP", details: "Key stronghold of the ruling party." },
        "Haryana": { phase: 6, votingDate: "May 25, 2026", seats: 10, cm: "Nayab Singh Saini", capital: "Chandigarh", party: "BJP", details: "Focus on agricultural policy." },
        "Himachal Pradesh": { phase: 7, votingDate: "June 1, 2026", seats: 4, cm: "Sukhvinder Singh Sukhu", capital: "Shimla", party: "INC", details: "Final phase voting in the hills." },
        "Jharkhand": { phase: "4-7", votingDate: "May-June 2026", seats: 14, cm: "Hemant Soren", capital: "Ranchi", party: "JMM (I.N.D.I.A)", details: "Focus on tribal rights." },
        "Karnataka": { phase: "2-3", votingDate: "April-May 2026", seats: 28, cm: "Siddaramaiah", capital: "Bengaluru", party: "INC", details: "Southern battleground." },
        "Kerala": { phase: 2, votingDate: "April 26, 2026", seats: 20, cm: "Pinarayi Vijayan", capital: "Thiruvananthapuram", party: "CPI(M) - LDF", details: "Unique political landscape." },
        "Madhya Pradesh": { phase: "1-4", votingDate: "April-May 2026", seats: 29, cm: "Mohan Yadav", capital: "Bhopal", party: "BJP", details: "Heartland of Central India." },
        "Maharashtra": { phase: "1-5", votingDate: "Multiple Dates", seats: 48, cm: "Eknath Shinde", capital: "Mumbai", party: "Shiv Sena (Mahayuti)", details: "High-stakes multi-party contest." },
        "Manipur": { phase: "1-2", votingDate: "April 2026", seats: 2, cm: "N. Biren Singh", capital: "Imphal", party: "BJP", details: "Focus on regional peace." },
        "Meghalaya": { phase: 1, votingDate: "April 19, 2026", seats: 2, cm: "Conrad Sangma", capital: "Shillong", party: "NPP", details: "Focus on hill state development." },
        "Mizoram": { phase: 1, votingDate: "April 19, 2026", seats: 1, cm: "Lalduhoma", capital: "Aizawl", party: "ZPM", details: "Single phase early voting." },
        "Nagaland": { phase: 1, votingDate: "April 19, 2026", seats: 1, cm: "Neiphiu Rio", capital: "Kohima", party: "NDPP", details: "Focus on regional autonomy." },
        "Odisha": { phase: "4-7", votingDate: "May-June 2026", seats: 21, cm: "Mohan Charan Majhi", capital: "Bhubaneswar", party: "BJP", details: "Concurrent assembly polls expected." },
        "Punjab": { phase: 7, votingDate: "June 1, 2026", seats: 13, cm: "Bhagwant Mann", capital: "Chandigarh", party: "AAP", details: "Multi-cornered urban and rural contest." },
        "Rajasthan": { phase: "1-2", votingDate: "April 2026", seats: 25, cm: "Bhajan Lal Sharma", capital: "Jaipur", party: "BJP", details: "Early phase battleground." },
        "Sikkim": { phase: 1, votingDate: "April 19, 2026", seats: 1, cm: "Prem Singh Tamang", capital: "Gangtok", party: "SKM", details: "Focus on eco-tourism." },
        "Tamil Nadu": { phase: 1, votingDate: "April 19, 2026", seats: 39, cm: "M. K. Stalin", capital: "Chennai", party: "DMK (I.N.D.I.A)", details: "Major regional power." },
        "Telangana": { phase: 4, votingDate: "May 13, 2026", seats: 17, cm: "Revanth Reddy", capital: "Hyderabad", party: "INC", details: "Post-assembly poll test." },
        "Tripura": { phase: "1-2", votingDate: "April 2026", seats: 2, cm: "Manik Saha", capital: "Agartala", party: "BJP", details: "Focus on connectivity." },
        "Uttar Pradesh": { phase: "1-7", votingDate: "Multiple Dates", seats: 80, cm: "Yogi Adityanath", capital: "Lucknow", party: "BJP", details: "Largest voting contingent." },
        "Uttarakhand": { phase: 1, votingDate: "April 19, 2026", seats: 5, cm: "Pushkar Singh Dhami", capital: "Dehradun", party: "BJP", details: "Focus on mountain economy." },
        "West Bengal": { phase: "1-7", votingDate: "Multiple Dates", seats: 42, cm: "Mamata Banerjee", capital: "Kolkata", party: "AITC", details: "Most intense 7-phase contest." },
        "Delhi": { phase: 6, votingDate: "May 25, 2026", seats: 7, cm: "Atishi Marlena", capital: "New Delhi", party: "AAP", details: "The national capital contest." }
    }
};

export const myths = [
    { cat: "EVM Security", m: "EVMs can be hacked via Bluetooth.", f: "EVMs are standalone calculators with no wireless chips or internet connectivity." },
    { cat: "Vote Secrecy", m: "The govt knows who I voted for.", f: "Voting is strictly anonymous. EVMs do not record voter identity." },
    { cat: "Valid ID", m: "I can only vote if I have a Voter ID card.", f: "You can vote using Aadhaar, Passport, PAN card, or 11 other approved IDs." },
    { cat: "NOTA", m: "If NOTA gets max votes, elections are canceled.", f: "NOTA does not cancel elections. The candidate with the next highest votes wins." },
    { cat: "Ink Removal", m: "Indelible ink can be washed off with chemicals.", f: "The ink contains Silver Nitrate which reacts with skin protein and cannot be removed for weeks." },
    { cat: "Double Voting", m: "One person can vote multiple times.", f: "Biometric checks and indelible ink prevent anyone from voting twice." },
    { cat: "VVPAT Slip", m: "The VVPAT slip is given to the voter.", f: "The slip is only visible for 7 seconds behind glass before dropping into a sealed box." },
    { cat: "Foreigners", m: "NRIs can vote online from abroad.", f: "NRIs must be physically present at their polling station in India to vote." },
    { cat: "Holiday", m: "Voting day is a optional holiday.", f: "Employers are legally mandated to provide a paid holiday for voting." },
    { cat: "Mobile Phones", m: "You can carry phones inside the booth.", f: "Mobile phones and cameras are strictly prohibited inside the voting compartment." },
    { cat: "Candidate Wealth", m: "Rich candidates can spend unlimited money.", f: "ECI sets strict expenditure limits for every candidate's campaign." },
    { cat: "Fake News", m: "ECI cannot track social media fake news.", f: "ECI has dedicated social media monitoring cells to report and remove misinformation." },
    { cat: "Voter List", m: "If I have an EPIC card, I can definitely vote.", f: "You must also be registered in the current electoral roll to cast a vote." },
    { cat: "Postal Ballot", m: "Anyone can use a postal ballot.", f: "Only essential service workers, PwDs, and voters over 85 can opt for home/postal voting." },
    { cat: "Security Forces", m: "Security forces inside the booth influence voters.", f: "Forces only maintain order outside; only polling officials are allowed inside." },
    { cat: "EVM Storage", m: "EVMs are stored in private warehouses.", f: "EVMs are stored in multi-layer secure strongrooms guarded by CAPF." },
    { cat: "Result Delay", m: "Delayed results mean foul play.", f: "Counting is a meticulous process involving physical VVPAT slip verification in random booths." },
    { cat: "Opinion Polls", m: "Opinion polls can be published anytime.", f: "Opinion polls are banned during the exit poll period and 48 hours before polling." },
    { cat: "Voter Age", m: "You can vote if you turn 18 on election day.", f: "You must be 18 as of the qualifying date (Jan 1, Apr 1, Jul 1, or Oct 1)." },
    { cat: "Campaigning", m: "Parties can campaign till the last minute.", f: "All campaigning must stop 48 hours before the conclusion of polling." }
];

export const journeySteps = [
    { id: 's1', title: 'Step 1: Registration Search', desc: 'Confirm your name is on the Electoral Roll. Deadline: Feb 10, 2026.', interactive: '<button class="btn btn-white" style="border: 1px solid var(--border); padding: 8px 15px; font-size: 0.85rem;" onclick="window.showTab(\'pulse\'); event.stopPropagation();">Verify Roll Status 🔍</button>' },
    { id: 's2', title: 'Step 2: Form 6 Submission', desc: 'New voter? Submit Form 6 for fresh registration or address change.', interactive: '<button class="btn btn-primary" style="padding: 8px 15px; font-size: 0.85rem;" onclick="event.stopPropagation(); window.open(\'https://voters.eci.gov.in/\', \'_blank\');">Open Voter Portal ↗</button>' },
    { id: 's3', title: 'Step 3: e-EPIC Download', desc: 'Get your digital Voter ID. Essential for fast-track voting.', interactive: '<input type="text" placeholder="Enter EPIC Number" style="padding: 8px; border-radius: 8px; border: 1px solid var(--border);" onclick="event.stopPropagation();">' },
    { id: 's4', title: 'Step 4: Polling Booth Locator', desc: 'Booths are finalized by April 2026. Know your location.', interactive: '<button class="btn btn-white" style="border: 1px solid var(--border); padding: 8px 15px; font-size: 0.85rem;" onclick="window.showTab(\'pulse\'); event.stopPropagation();">Booth Finder 📍</button>' },
    { id: 's5', title: 'Step 5: Document Readiness', desc: 'Prepare Aadhaar, Passport, or DL if EPIC card is unavailable.', interactive: '<select style="padding: 8px; border-radius: 8px; border: 1px solid var(--border); font-family: inherit;" onclick="event.stopPropagation();"><option>Aadhaar Card</option><option>Driving License</option><option>Passport</option></select>' },
    { id: 's6', title: 'Step 6: Candidate Research', desc: 'Read criminal antecedents and assets of local candidates.', interactive: '<button class="btn btn-white" onclick="event.stopPropagation(); window.open(\'https://myneta.info/\', \'_blank\');" style="border: 1px solid var(--border); padding: 8px 15px; font-size: 0.85rem; font-weight: 700;">Research Candidates 🕵️</button>' },
    { id: 's7', title: 'Step 7: Mock Vote Practice', desc: 'Practice the EVM+VVPAT sequence to avoid errors.', interactive: '<button class="btn btn-white" style="border: 1px solid var(--border); padding: 8px 15px; font-size: 0.85rem;" onclick="window.showTab(\'home\'); document.getElementById(\'home-booth-sim\').scrollIntoView({behavior:\'smooth\'}); event.stopPropagation();">Launch Simulator 🗳️</button>' },
    { id: 's8', title: 'Step 8: Casting the Vote', desc: 'Polls: April-May 2026. Make your voice heard!', interactive: '<button class="btn btn-green" style="padding: 8px 15px; font-size: 0.85rem; font-weight: 800;" onclick="event.stopPropagation(); alert(\'Thanks for voting! Counting is on June 4, 2026.\');">Mark as Voted 🎉</button>' }
];
