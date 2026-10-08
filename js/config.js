/* ------------------------------------------------------------------
   Wedding e-invitation configuration
   Everything that is specific to one couple lives here. The rest of the
   site reads from this object, so a new wedding only needs a new config.
   ------------------------------------------------------------------ */
window.WEDDING = {
  couple: {
    first: "Camille",
    last: "Lefèvre",
    partnerFirst: "Antoine",
    partnerLast: "Marchand",
    monogram: "C&A",
  },

  /* ISO 8601 with offset. Paris is UTC+2 in June. */
  date: "2027-06-12T17:00:00+02:00",
  rsvpDeadline: "2027-03-01",
  timeZone: "Europe/Paris",

  ceremony: {
    venue: "Château de Belvent",
    area: "Gevrey-Chambertin · Bourgogne",
    address: "Château de Belvent, 21220 Gevrey-Chambertin, France",
    ceremonySpace: { en: "The Orangery", fr: "L’Orangerie" },
    receptionSpace: { en: "The Wine Cellar", fr: "Le Cellier" },
    start: "2027-06-12T16:45:00+02:00",
    end: "2027-06-12T23:00:00+02:00",
  },

  recovery: {
    venue: "Le Comptoir des Halles",
    area: "Beaune · Bourgogne",
    address: "4 Rue Monge, 21200 Beaune, France",
    start: "2027-06-13T12:00:00+02:00",
    end: "2027-06-13T17:00:00+02:00",
  },

  shuttle: { from: "Beaune", departs: "16:00" },

  /* Keys map to i18n strings timeline.<key>.title / .note */
  timeline: [
    { time: "16:45", key: "arrive", icon: "chapel" },
    { time: "17:00", key: "ceremony", icon: "rings" },
    { time: "18:00", key: "cocktails", icon: "coupe" },
    { time: "19:00", key: "reception", icon: "disco" },
    { time: "23:00", key: "farewell", icon: "moon" },
  ],

  /* RSVP delivery.
     endpoint: any URL that accepts a JSON POST (Formspree, Netlify
     Functions, Google Apps Script, your own API). Leave empty to fall
     back to a pre-filled email. */
  rsvp: {
    endpoint: "",
    email: "camille.antoine.2027@example.com",
  },

  /* Shown in the footer. Leave name empty to hide the credit. */
  credit: { name: "", url: "" },

  /* Envelope intro: milliseconds before it opens on its own. */
  intro: { autoOpenAfter: 1300 },
};
