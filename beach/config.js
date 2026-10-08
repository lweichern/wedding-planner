/* ------------------------------------------------------------------
   Beach watercolour variant: configuration
   ------------------------------------------------------------------ */
window.WEDDING = {
  couple: {
    first: "Isla",
    last: "Moreira",
    partnerFirst: "Theo",
    partnerLast: "Lindqvist",
    monogram: "I&T",
  },

  /* Comporta is on Lisbon time: UTC+1 in September. */
  date: "2027-09-04T17:00:00+01:00",
  rsvpDeadline: "2027-06-01",
  timeZone: "Europe/Lisbon",

  ceremony: {
    venue: "Praia do Carvalhal",
    area: "Comporta · Alentejo",
    address: "Praia do Carvalhal, 7570-789 Carvalhal, Portugal",
    ceremonySpace: { en: "On the sand, by the dunes", pt: "Na areia, junto às dunas" },
    receptionSpace: { en: "Sal Beach Club", pt: "Sal Beach Club" },
    start: "2027-09-04T16:30:00+01:00",
    end: "2027-09-05T00:00:00+01:00",
  },

  recovery: {
    venue: "Cavalariça Comporta",
    area: "Comporta village",
    address: "Rua do Secador 9, 7580-648 Comporta, Portugal",
    start: "2027-09-05T12:00:00+01:00",
    end: "2027-09-05T16:00:00+01:00",
  },

  shuttle: { from: "Lisbon", departs: "14:00" },

  timeline: [
    { time: "16:30", key: "arrive", icon: "shell" },
    { time: "17:00", key: "ceremony", icon: "rings" },
    { time: "17:45", key: "cocktails", icon: "coconut" },
    { time: "19:30", key: "reception", icon: "lantern" },
    { time: "23:30", key: "farewell", icon: "sparkler" },
  ],

  rsvp: {
    endpoint: "",
    email: "isla.theo.2027@example.com",
  },

  credit: { name: "", url: "" },

  intro: { autoOpenAfter: 1600 },
};
