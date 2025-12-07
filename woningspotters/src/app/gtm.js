// src/app/gtm.js
export const GTM_ID = "GTM-KW3565XP";

// Consent Mode v2 - Set default consent state BEFORE GTM loads
// This ensures proper consent handling for EU/EEA compliance
export const consentDefaultScript = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Set default consent to 'denied' for EU/EEA regions
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'wait_for_update': 500,
  'region': ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'GB', 'IS', 'LI', 'NO', 'CH']
});

// Enable URL passthrough for better measurement when cookies are denied
gtag('set', 'url_passthrough', true);

// Redact ads data when ad_storage is denied
gtag('set', 'ads_data_redaction', true);
`;

// GTM Script - loads AFTER consent defaults are set
export const gtmScript = `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KW3565XP');
`;
