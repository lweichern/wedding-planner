/* ------------------------------------------------------------------
   Wax seal and vellum variant: configuration
   ------------------------------------------------------------------ */
window.WEDDING = {
  couple: {
    first: "Eleanor",
    last: "Whitfield",
    partnerFirst: "Matteo",
    partnerLast: "Ferrante",
    monogram: "E·M",
  },

  /* Italy is UTC+2 in May. */
  date: "2027-05-29T17:00:00+02:00",
  rsvpDeadline: "2027-03-01",
  timeZone: "Europe/Rome",

  ceremony: {
    venue: "Villa Serafina",
    area: "Val d’Orcia · Toscana",
    address: "Strada Provinciale 146, 53027 San Quirico d’Orcia SI, Italy",
    ceremonySpace: { en: "The chapel courtyard", it: "Il cortile della cappella" },
    receptionSpace: { en: "The long terrace, by candlelight", it: "La terrazza lunga, a lume di candela" },
    start: "2027-05-29T16:30:00+02:00",
    end: "2027-05-30T01:00:00+02:00",
  },

  recovery: {
    venue: "Podere Le Querce",
    area: "Pienza · Toscana",
    address: "Via delle Querce 4, 53026 Pienza SI, Italy",
    start: "2027-05-30T13:00:00+02:00",
    end: "2027-05-30T17:00:00+02:00",
  },

  shuttle: { from: "Siena", departs: "15:00" },

  timeline: [
    { time: "16:30", key: "arrive", motif: "key" },
    { time: "17:00", key: "ceremony", motif: "rings" },
    { time: "18:00", key: "aperitivo", motif: "olive" },
    { time: "20:00", key: "dinner", motif: "candle" },
    { time: "23:00", key: "dancing", motif: "moon" },
    { time: "01:00", key: "farewell", motif: "bee" },
  ],

  rsvp: {
    endpoint: "",
    email: "eleanor.matteo.2027@example.com",
  },

  credit: { name: "", url: "" },

  intro: { autoOpenAfter: 2200 },
};
