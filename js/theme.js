export const translations = {
    en: {
        tabHome: "Home", tabTimeline: "Timeline", tabJourney: "Journey", tabGlossary: "Glossary", tabFinder: "Finder", tabEligible: "Eligible?", tabChat: "AI Chat",
        tagline: "Samajho. Jano. Vote Karo.", heroTitle: "Master India's Elections in 5 Minutes",
        btnStart: "Start Your Journey →", btnChat: "Chat with AI 💬", poweredBy: "Powered by Gemini AI • 2026 Ready",
        mythsTitle: "Election Myths vs Facts", mythsDesc: "Clear your doubts before you step into the booth.",
        timelineTitle: "Election Journey Timeline", timelineDesc: "Follow your avatar's path from announcement to the ballot box.",
        evmTitle: "EVM Booth Simulator", evmDesc: "Experience the secure voting process exactly as it happens."
    },
    hi: {
        tabHome: "होम", tabTimeline: "समय सारणी", tabJourney: "यात्रा", tabGlossary: "शब्दकोश", tabFinder: "खोजें", tabEligible: "योग्य?", tabChat: "AI सहायक",
        tagline: "समझो। जानो। वोट करो।", heroTitle: "5 मिनट में भारत के चुनाव को समझें",
        btnStart: "अपनी यात्रा शुरू करें →", btnChat: "AI से बात करें 💬", poweredBy: "जेमिनी एआई द्वारा संचालित • 2026 तैयार",
        mythsTitle: "चुनाव: मिथक बनाम तथ्य", mythsDesc: "बूथ में कदम रखने से पहले अपने संदेह दूर करें।",
        timelineTitle: "चुनाव यात्रा समयरेखा", timelineDesc: "घोषणा से लेकर मतपेटी तक अपने अवतार के मार्ग का अनुसरण करें।",
        evmTitle: "ईवीएम बूथ सिम्युलेटर", evmDesc: "सुरक्षित मतदान प्रक्रिया का ठीक वैसे ही अनुभव करें जैसे यह होती है।"
    }
};

export function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    const btn = document.getElementById('btn-dark');
    if (btn) btn.textContent = dark ? '☀️' : '🌙';
}

export function applyHC(hc) {
    document.body.classList.toggle('hc', hc);
    const btn = document.getElementById('btn-hc');
    if (btn) btn.classList.toggle('active', hc);
}

export function applyLang(lang) {
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    document.getElementById('btn-lang').classList.toggle('active', lang === 'hi');
}
