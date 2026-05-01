export const fullGlossary = [
    { term: "EVM", hi: "ईवीएम", def: "Electronic Voting Machine - used to record votes digitally." },
    { term: "VVPAT", hi: "वीवीपैट", def: "Voter Verifiable Paper Audit Trail - shows a printed slip of your vote for 7 seconds." },
    { term: "NOTA", hi: "नोटा", def: "None Of The Above - option to reject all candidates." },
    { term: "Constituency", hi: "निर्वाचन क्षेत्र", def: "The geographic area that a Member of Parliament represents." },
    { term: "Form 6", hi: "फॉर्म 6", def: "Application form for new registration as a voter." },
    { term: "Model Code", hi: "आचार संहिता", def: "Guidelines issued by ECI for parties during elections." },
    { term: "EPIC", hi: "मतदाता पहचान पत्र", def: "Elector Photo Identity Card (Voter ID)." },
    { term: "Booth", hi: "मतदान केंद्र", def: "Specific location where you cast your vote." },
    { term: "Affidavit", hi: "हलफनामा", def: "Sworn document by candidates detailing assets and criminal records." },
    { term: "Lok Sabha", hi: "लोक सभा", def: "Lower house of Parliament. 543 elected seats." },
    { term: "Rajya Sabha", hi: "राज्य सभा", def: "The upper house of Parliament." },
    { term: "Exit Poll", hi: "एग्जिट पोल", def: "A survey taken immediately after voters leave the polling stations." },
    { term: "Returning Officer", hi: "रिटर्निंग ऑफिसर", def: "The statutory authority conducting the election in a constituency." },
    { term: "Election Commission", hi: "चुनाव आयोग", def: "Autonomous constitutional authority responsible for administering election processes in India." },
    { term: "Manifesto", hi: "घोषणापत्र", def: "A published declaration of the intentions, motives, or views of a political party." },
    { term: "Ballot Box", hi: "मतपेटी", def: "A sealed box into which voters put their completed ballot papers (historical, now EVMs)." }
];

export function renderGlossary(container, data) {
    container.innerHTML = `<div class="accordion" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 0 auto; width: 100%;">
        ${data.map((t, i) => `
            <div class="acc-item" style="background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; align-self: start;">
                <button class="acc-header" style="width: 100%; text-align: left; padding: 15px 20px; background: none; border: none; font-family: inherit; font-size: 1.1rem; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: var(--navy);" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block';">
                    <span class="fraunces">${t.term} <span style="font-family:'Noto Sans Devanagari'; font-weight:800; color:var(--saffron); font-size:0.9rem; margin-left: 10px;">${t.hi}</span></span>
                    <span>▼</span>
                </button>
                <div class="acc-body" style="display: none; padding: 0 20px 20px 20px;">
                    <p style="color:var(--text); font-size:1rem; font-weight:600; margin-bottom: 10px;">${t.def}</p>
                    <button class="audio-trigger" style="background: var(--grey-bg); border: 1px solid var(--border); border-radius: 8px; padding: 5px 10px; cursor: pointer; display: flex; align-items: center; gap: 5px;" onclick="window.playAudio('${t.term}')" title="Play pronunciation">🔊 <span style="font-size: 0.8rem; font-weight: bold;">Listen</span></button>
                </div>
            </div>
        `).join('')}
    </div>`;
}

window.playAudio = (text) => {
    try {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'hi-IN';
        u.pitch = 1.2;
        window.speechSynthesis.speak(u);
    } catch (e) { }
};
