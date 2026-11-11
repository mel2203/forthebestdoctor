// Dates are in Pittsburgh / Philadelphia local time (Eastern Time).
export const TIME_ZONE = "America/New_York";
export const START = new Date("2026-10-01T00:00:00-04:00");
export const END = new Date("2026-11-16T23:59:59-05:00");
export const MESSAGE_INTERVAL_DAYS = 2;
export const MESSAGE_START = new Date("2026-10-18T00:00:00-04:00");

// Add each note between the quotes. Drops unlock every 2 local calendar days
// starting Oct 18, 2026. Blank notes remain hidden until they are written.
export const MESSAGES = [
  "Salam Taseal, This is the first letter, and I hope youre doing well and eating and sleeping well. I made this for you as a token of appreication for all the things youve done for me, there are no words enough to express how grateful I am for the things you've done for me, You will always have a special place in my heart and I will always pray for you Inshallah. ", // Drop 1 · Oct 18
  "Second letter! Im writing this in advanced but i do hope you have an awesome possum day today and do not forget to wash your hands after seeing a patient. ", // Drop 2 · Oct 20
  "Random funfact, scientists found that on the north pole of saturn , a perfect hexagonal cloud storm exists, when i heard this my mind was blown, we usually relate hexagonal things with nature like a honey combs and crystals or corals. How did a planet, that has no life force nor nature have a hexagon? Its so cool to think about. anyway hexagons have 6 sides, like the 6 things in your checklist, haha. make sure to eat and drink! take care!, ", // Drop 3 · Oct 22
  "Being a doctor is hard, I've read countless posts and articles about it. So i hope this letter finds you in a good place and just so you know, all the hard work you put in will soon be pay off inshallah, Don't forget to pray, always say Alhamdulillah and of course try get some sleep when you can!", // Drop 4 · Oct 24
  "I forgot to push the new letters on github.. im so sorry. I hope youre doing good. i miss you terribly and i hope to see you relax and having fun soon inshallah", // Drop 5 · Oct 26
  "We have 2 more months till 2027, and lets make the best of it, my new years resolution this year was to climb a mountain, obviously i didnt do that. If ur reading this, what 2026 goal do u wanna achieve before the end of the year? ", // Drop 6 · Oct 28
  "Tomorrow is halloween. We don't celebrate it but be careful anyway, i know u get scared easily, read ayatul kursi. Take Care tashu :>", // Drop 7 · Oct 30
  "if noone has told u this today, im proud of you.", // Drop 8 · Nov 1
  "I miss our momemts together in Malaysia :'(( I aint never had that much fun trust.  I still think about those little moments and smile. I wish we could've had more time together, but I'm really glad we got to experience that. You made those 12 days so special for me", // Drop 9 · Nov 3
  "Test to see if ur reading this! if u are send me \"lyana u look so pretty today\"", // Drop 10 · Nov 5
  "Almost there! Your well deserved break is coming up soon!! Im also stressing over finals next week but one thing is for sure, I'm here for you!", // Drop 11 · Nov 7
  "Never gonna give u up never gonna let u down. never gonna run around and desert you", // Drop 12 · Nov 9
  "3 things i like about you: 1. I like how caring you are and so kind to me and everyone, 2. how hard you always work to achieve your dreams and goals, you always tell me about how youre working harder and i find it very respectable 3. your determination in life and how goal oriented you are", // Drop 13 · Nov 11
  "Almost there!!! Lets talk soon!!", // Drop 14 · Nov 13
];
export const MESSAGE_COUNT = MESSAGES.length;

export const CHECKLIST = [
  "Suturing kit",
  "Chicken nuggets",
  "Ramen",
  "Chai",
  "100 Plus",
  "Socks",
  "Watch",
  "Are you eating and drinking enough?",
];
