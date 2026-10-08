/* ------------------------------------------------------------------
   Editorial variant: configuration
   ------------------------------------------------------------------ */
window.WEDDING = {
  couple: {
    first: "Anouk",
    last: "Vermeer",
    partnerFirst: "Rafael",
    partnerLast: "Costa",
    monogram: "A&R",
  },

  /* Copenhagen is UTC+2 in September. */
  date: "2027-09-11T15:00:00+02:00",
  rsvpDeadline: "2027-06-15",
  timeZone: "Europe/Copenhagen",
  issue: { volume: "I", number: "1", city: "Copenhagen" },

  ceremony: {
    venue: "Halle K",
    area: "Refshaleøen · Copenhagen",
    address: "Refshalevej 173, 1432 København K, Denmark",
    ceremonySpace: { en: "The Hall", da: "Hallen" },
    receptionSpace: { en: "The Courtyard, then the Hall", da: "Gården, derefter Hallen" },
    start: "2027-09-11T14:30:00+02:00",
    end: "2027-09-12T01:00:00+02:00",
  },

  recovery: {
    venue: "Islands Brygge Harbour Bath",
    area: "Islands Brygge · Copenhagen",
    address: "Islands Brygge 14, 2300 København S, Denmark",
    start: "2027-09-12T11:00:00+02:00",
    end: "2027-09-12T15:00:00+02:00",
  },

  shuttle: { from: "Nyhavn", departs: "13:45" },

  timeline: [
    { time: "14:30", key: "arrive" },
    { time: "15:00", key: "ceremony" },
    { time: "15:45", key: "cocktails" },
    { time: "18:00", key: "dinner" },
    { time: "21:30", key: "dancing" },
    { time: "01:00", key: "farewell" },
  ],

  rsvp: {
    endpoint: "",
    email: "anouk.rafael.2027@example.com",
  },

  credit: { name: "", url: "" },

  intro: { autoOpenAfter: 900 },
};
