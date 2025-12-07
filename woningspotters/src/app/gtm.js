// src/app/gtm.js
// Google Tag Manager + Consent Mode V2 - Production Ready
// GA4 wordt beheerd via GTM, niet via hard-coded scripts

export const GTM_ID = "GTM-KW3565XP";
export const GA4_ID = "G-189HKEFH32"; // Alleen als referentie, geen script

// Consent Mode V2 - Default consent state (MOET laden VOOR GTM)
export const consentDefaultScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500
});

gtag('set', 'url_passthrough', true);
gtag('set', 'ads_data_redaction', true);
`;

// Google Tag Manager Script
export const gtmScript = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KW3565XP');
`;
