// Disney Watch Odyssey — film catalogue
// The long, shared list of Disney / Pixar / Disneytoon animated features we want
// to watch with three scaredy-cat girls, ordered GENTLEST FIRST and skewed toward
// what a 36-year-old mum is likely to enjoy.
//
// This module is presentation data only. The *state* (who has watched what, the
// dates, the custom order, resolved poster URLs) lives server-side in
// disney_data.json via /api/disney/* — see server.py and disney-watch.js.
//
// Poster art is fetched live at runtime from Wikipedia (see disney-watch.js),
// keyed by the `wiki` article title below; a coloured title-card is shown as a
// fallback when offline or when a lookup misses.
(function () {
    'use strict';

    // tiers -> badge presentation
    var TIERS = {
        cozy:    { label: 'Cozy',          emoji: '🫧', color: '#4ade80' },
        peril:   { label: 'Some peril',    emoji: '⚡', color: '#fbbf24' },
        preview: { label: 'Preview first', emoji: '👀', color: '#f87171' }
    };

    // Fallback title-card colours, cycled by catalogue position.
    var PALETTE = [
        '#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa',
        '#f87171', '#34d399', '#60a5fa', '#c084fc', '#fbbf24', '#2dd4bf',
        '#fb7185', '#818cf8'
    ];

    // The catalogue. Order here == default watchlist order (gentlest first).
    // f(id, title, year, studio, wiki, tier, note)
    function f(id, title, year, studio, wiki, tier, note) {
        return { id: id, title: title, year: year, studio: studio, wiki: wiki, tier: tier, note: note };
    }

    var CATALOG = [
        // ---------- COZY ----------
        f('cars', 'Cars', 2006, 'Pixar', 'Cars (film)', 'cozy', 'Pixar with the handbrake on — about the gentlest they ever made.'),
        f('winnie-the-pooh-2011', 'Winnie the Pooh', 2011, 'Disney', 'Winnie the Pooh (2011 film)', 'cozy', '65 warm minutes and no villain to speak of.'),
        f('many-adventures-pooh', 'The Many Adventures of Winnie the Pooh', 1977, 'Disney', 'The Many Adventures of Winnie the Pooh', 'cozy', 'The classic Pooh shorts; a blustery day is as scary as it gets.'),
        f('emperors-new-groove', "The Emperor's New Groove", 2000, 'Disney', "The Emperor's New Groove", 'cozy', 'Pure comedy — Yzma is funny, not frightening. Mum will laugh too.'),
        f('kronks-new-groove', "Kronk's New Groove", 2005, 'Disneytoon', "Kronk's New Groove", 'cozy', 'More of the same gentle laughs.'),
        f('tinker-bell', 'Tinker Bell', 2008, 'Disneytoon', 'Tinker Bell (film)', 'cozy', 'Fairy crafts and friendship; cosy from start to finish.'),
        f('tinker-bell-lost-treasure', 'Tinker Bell and the Lost Treasure', 2009, 'Disneytoon', 'Tinker Bell and the Lost Treasure', 'cozy', 'A gentle quest, a small falling-out, a hug to finish.'),
        f('tinker-bell-great-fairy-rescue', 'Tinker Bell and the Great Fairy Rescue', 2010, 'Disneytoon', 'Tinker Bell and the Great Fairy Rescue', 'cozy', 'A curious girl finds the fairies; no real danger.'),
        f('secret-of-the-wings', 'Secret of the Wings', 2012, 'Disneytoon', 'Secret of the Wings', 'cozy', 'Sisters meet across the frost border. Sweet and low-stakes.'),
        f('monsters-university', 'Monsters University', 2013, 'Pixar', 'Monsters University', 'cozy', 'College hijinks; every scare is played for a laugh.'),
        f('lion-king-1half', 'The Lion King 1½', 2004, 'Disneytoon', 'The Lion King 1½', 'cozy', 'Timon & Pumbaa retell the story as comedy and skip the sad part.'),
        f('cinderella-ii', 'Cinderella II: Dreams Come True', 2002, 'Disneytoon', 'Cinderella II: Dreams Come True', 'cozy', 'Three light vignettes with happily-ever-after already banked.'),
        f('soul', 'Soul', 2020, 'Pixar', 'Soul (2020 film)', 'cozy', 'Thoughtful and calm — big ideas, no monsters. One for Mum especially.'),
        f('wall-e', 'WALL·E', 2008, 'Pixar', 'WALL-E', 'cozy', 'Nearly wordless and tender; only mild tension late on.'),
        f('ratatouille', 'Ratatouille', 2007, 'Pixar', 'Ratatouille (film)', 'cozy', 'Warm kitchen comedy with one brief broom-swinging scare.'),
        f('inside-out', 'Inside Out', 2015, 'Pixar', 'Inside Out (2015 film)', 'cozy', 'Feelings as characters — sad in places, never scary. Helps anxious kids name what they feel.'),
        f('101-dalmatians-ii', '101 Dalmatians II: Patch’s London Adventure', 2003, 'Disneytoon', '101 Dalmatians II: Patch’s London Adventure', 'cozy', 'Cruella is back but softened; mostly a pup-and-TV-hero caper.'),
        f('belles-magical-world', "Belle's Magical World", 1998, 'Disneytoon', "Belle's Magical World", 'cozy', 'Castle vignettes with no threat; the Beast just needs to say sorry.'),
        f('tarzan-ii', 'Tarzan II', 2005, 'Disneytoon', 'Tarzan II', 'cozy', 'Young Tarzan and a comic "Zugor"; the leopard scare is gone.'),
        f('lilo-and-stitch-2', 'Lilo & Stitch 2: Stitch Has a Glitch', 2005, 'Disneytoon', 'Lilo & Stitch 2: Stitch Has a Glitch', 'cozy', 'Emotional near the end, but the danger stays small.'),
        f('the-sword-in-the-stone', 'The Sword in the Stone', 1963, 'Disney', 'The Sword in the Stone (film)', 'cozy', 'The wizards’ duel is silly rather than scary; gentle and funny.'),
        f('leroy-and-stitch', 'Leroy & Stitch', 2006, 'Disneytoon', 'Leroy & Stitch', 'cozy', 'A cartoonish sci-fi romp to wrap up the series.'),
        f('planes', 'Planes', 2013, 'Disneytoon', 'Planes (film)', 'cozy', 'A racing underdog; the peril is airshow-mild.'),
        f('home-on-the-range', 'Home on the Range', 2004, 'Disney', 'Home on the Range (2004 film)', 'cozy', 'Cows catch a rustler; a yodelling villain with no real edge.'),
        f('the-little-mermaid-ariels-beginning', 'The Little Mermaid: Ariel’s Beginning', 2008, 'Disneytoon', 'The Little Mermaid: Ariel’s Beginning', 'cozy', 'Music banned, then music restored — and no Ursula.'),
        f('bambi-ii', 'Bambi II', 2006, 'Disneytoon', 'Bambi II', 'cozy', 'Picks up after the sad part; mostly father-and-son bonding.'),
        f('fantasia-2000', 'Fantasia 2000', 1999, 'Disney', 'Fantasia 2000', 'cozy', 'Music and pictures — skip to the next piece if the Firebird is too much.'),
        f('the-aristocats', 'The Aristocats', 1970, 'Disney', 'The Aristocats', 'cozy', 'Jazzy and light; the butler is a bumbler, not a menace.'),

        // ---------- SOME PERIL ----------
        f('moana', 'Moana', 2016, 'Disney', 'Moana (2016 film)', 'peril', 'The Kakamora and the lava figure are loud but brief. Already a hit here.'),
        f('moana-2', 'Moana 2', 2024, 'Disney', 'Moana 2', 'peril', 'Same energy; a storm-god set-piece, quickly resolved.'),
        f('encanto', 'Encanto', 2021, 'Disney', 'Encanto', 'peril', 'Family tension and one collapsing house; no villain. Already loved here.'),
        f('tangled', 'Tangled', 2010, 'Disney', 'Tangled', 'peril', 'Gothel is menacing and there is a brief stabbing, with lots of humour around it. Mum-friendly.'),
        f('frozen', 'Frozen', 2013, 'Disney', 'Frozen (2013 film)', 'peril', 'A snow-monster chase and an icy storm. Ella has seen it; the songs carry it.'),
        f('frozen-ii', 'Frozen II', 2019, 'Disney', 'Frozen II', 'peril', 'Elemental spirits and a dark-sea crossing; tense, not gory.'),
        f('zootopia', 'Zootopia', 2016, 'Disney', 'Zootopia', 'peril', 'A couple of "gone savage" jump-scares; otherwise a witty buddy mystery. One for Mum.'),
        f('zootopia-2', 'Zootopia 2', 2025, 'Disney', 'Zootopia 2', 'peril', 'More mystery caper with comparable mild scares.'),
        f('big-hero-6', 'Big Hero 6', 2014, 'Disney', 'Big Hero 6 (film)', 'peril', 'Baymax is pure comfort, but there is a fire, a loss, and a masked villain.'),
        f('wreck-it-ralph', 'Wreck-It Ralph', 2012, 'Disney', 'Wreck-It Ralph', 'peril', 'A bug swarm and a body-horror-lite villain reveal near the end.'),
        f('ralph-breaks-the-internet', 'Ralph Breaks the Internet', 2018, 'Disney', 'Ralph Breaks the Internet', 'peril', 'One giant needy-Ralph monster in the finale; mostly jokes.'),
        f('lilo-and-stitch', 'Lilo & Stitch', 2002, 'Disney', 'Lilo & Stitch', 'peril', 'Alien chases and crash-landings, played light. A great sisters story.'),
        f('the-little-mermaid', 'The Little Mermaid', 1989, 'Disney', 'The Little Mermaid (1989 film)', 'peril', 'Ursula, a storm, and a giant-Ursula finale. A Mum classic.'),
        f('aladdin', 'Aladdin', 1992, 'Disney', 'Aladdin (1992 Disney film)', 'peril', 'Jafar and the collapsing Cave of Wonders; the Genie keeps it buoyant. Mum classic.'),
        f('beauty-and-the-beast', 'Beauty and the Beast', 1991, 'Disney', 'Beauty and the Beast (1991 film)', 'peril', 'Wolf attacks and the Beast’s roar; the ballroom makes up for it. Mum favourite.'),
        f('hercules', 'Hercules', 1997, 'Disney', 'Hercules (1997 film)', 'peril', 'Hades and the Titans are big and loud, but comic-book rather than creepy.'),
        f('mulan', 'Mulan', 1998, 'Disney', 'Mulan (1998 film)', 'peril', 'War, an avalanche, and Shan Yu. Already watched here.'),
        f('the-jungle-book', 'The Jungle Book', 1967, 'Disney', 'The Jungle Book (1967 film)', 'peril', 'Kaa’s hypnosis and Shere Khan, with swingy songs in between.'),
        f('robin-hood', 'Robin Hood', 1973, 'Disney', 'Robin Hood (1973 film)', 'peril', 'A castle fire and a jailbreak; foxes and bears keep it charming.'),
        f('monsters-inc', 'Monsters, Inc.', 2001, 'Pixar', 'Monsters, Inc.', 'peril', 'The whole point is scaring kids, but Randall is the only real fright.'),
        f('a-bugs-life', "A Bug's Life", 1998, 'Pixar', "A Bug's Life", 'peril', 'Hopper the grasshopper and a hungry bird; ends triumphant.'),
        f('toy-story', 'Toy Story', 1995, 'Pixar', 'Toy Story', 'peril', 'Sid and his mutant toys unsettle a lot of little kids. Everything else is joy.'),
        f('toy-story-2', 'Toy Story 2', 1999, 'Pixar', 'Toy Story 2', 'peril', 'A creepy toy-repair scene and an airport chase.'),
        f('toy-story-4', 'Toy Story 4', 2019, 'Pixar', 'Toy Story 4', 'peril', 'The ventriloquist dummies are unsettling; a heart-tugging finish.'),
        f('finding-dory', 'Finding Dory', 2016, 'Pixar', 'Finding Dory', 'peril', 'A truck chase and a scary squid, but calmer than Nemo.'),
        f('incredibles-2', 'Incredibles 2', 2018, 'Pixar', 'Incredibles 2', 'peril', 'Hypnosis screens and peril; a strobe warning applies in the finale.'),
        f('the-incredibles', 'The Incredibles', 2004, 'Pixar', 'The Incredibles', 'peril', 'Gun-toting henchmen, real danger, deaths implied. Enormous fun, though.'),
        f('cars-3', 'Cars 3', 2017, 'Pixar', 'Cars 3', 'peril', 'Opens with Lightning’s bad crash; a recovery story after.'),
        f('cars-2', 'Cars 2', 2011, 'Pixar', 'Cars 2', 'peril', 'Spy-movie violence and an interrogation scene; the odd one out.'),
        f('onward', 'Onward', 2020, 'Pixar', 'Onward (film)', 'peril', 'A stone-dragon finale; mostly a gentle brothers road-trip.'),
        f('luca', 'Luca', 2021, 'Pixar', 'Luca (2021 film)', 'peril', 'Rain means danger for the boys, plus a bully; sunny overall.'),
        f('turning-red', 'Turning Red', 2022, 'Pixar', 'Turning Red', 'peril', 'A giant red-panda rampage; comedy keeps it light. Mum will relate.'),
        f('elemental', 'Elemental', 2023, 'Pixar', 'Elemental (2023 film)', 'peril', 'Floods threaten Ember’s flame; tense but romantic.'),
        f('lightyear', 'Lightyear', 2022, 'Pixar', 'Lightyear (film)', 'peril', 'Zurg and robot battles; straight sci-fi action.'),
        f('raya-and-the-last-dragon', 'Raya and the Last Dragon', 2021, 'Disney', 'Raya and the Last Dragon', 'peril', 'The Druun smoke-creatures petrify people; no blood, plenty of chase.'),
        f('strange-world', 'Strange World', 2022, 'Disney', 'Strange World (film)', 'peril', 'Pulpy monster-land peril — more icky than scary.'),
        f('wish', 'Wish', 2023, 'Disney', 'Wish (film)', 'peril', 'King Magnifico turns properly nasty in the last act.'),
        f('meet-the-robinsons', 'Meet the Robinsons', 2007, 'Disney', 'Meet the Robinsons', 'peril', 'The Bowler Hat Guy and a sinister robot hat; a time-travel tangle with an upbeat end.'),
        f('chicken-little', 'Chicken Little', 2005, 'Disney', 'Chicken Little (2005 film)', 'peril', 'An alien-invasion scare that turns out to be a misunderstanding.'),
        f('the-great-mouse-detective', 'The Great Mouse Detective', 1986, 'Disney', 'The Great Mouse Detective', 'peril', 'Ratigan is genuinely mean; a clock-tower chase to finish.'),
        f('the-rescuers', 'The Rescuers', 1977, 'Disney', 'The Rescuers', 'peril', 'Medusa and her crocodiles menace an orphan; the mice save the day.'),
        f('the-rescuers-down-under', 'The Rescuers Down Under', 1990, 'Disney', 'The Rescuers Down Under', 'peril', 'A poacher hunts a boy and an eagle; big aerial peril.'),
        f('atlantis-the-lost-empire', 'Atlantis: The Lost Empire', 2001, 'Disney', 'Atlantis: The Lost Empire', 'peril', 'A sea-monster attack early, casualties, and a fiery betrayal.'),
        f('treasure-planet', 'Treasure Planet', 2002, 'Disney', 'Treasure Planet', 'peril', 'A spider-crab villain, a mutiny, and a black hole.'),
        f('return-to-never-land', 'Return to Never Land', 2002, 'Disneytoon', 'Return to Never Land', 'peril', 'Hook and an octopus; a WWII framing at the start.'),
        f('peter-pan', 'Peter Pan', 1953, 'Disney', 'Peter Pan (1953 film)', 'peril', 'Hook and the crocodile — and note some very dated stereotypes.'),
        f('the-lion-king-ii', 'The Lion King II: Simba’s Pride', 1998, 'Disneytoon', 'The Lion King II: Simba’s Pride', 'peril', 'Outsiders, a fire, a river; Romeo-and-Juliet stakes.'),
        f('cinderella-iii', 'Cinderella III: A Twist in Time', 2007, 'Disneytoon', 'Cinderella III: A Twist in Time', 'peril', 'The stepmother gets magic; briefly darker than the original.'),
        f('mulan-ii', 'Mulan II', 2004, 'Disneytoon', 'Mulan II', 'peril', 'A rickety-bridge sacrifice scene; mostly a road trip.'),
        f('the-jungle-book-2', 'The Jungle Book 2', 2003, 'Disneytoon', 'The Jungle Book 2', 'peril', 'Shere Khan again, but lighter than the original.'),
        f('lady-and-the-tramp', 'Lady and the Tramp', 1955, 'Disney', 'Lady and the Tramp', 'peril', 'A rat in the nursery and the dog pound; the spaghetti scene redeems it.'),
        f('lady-and-the-tramp-ii', "Lady and the Tramp II: Scamp's Adventure", 2001, 'Disneytoon', "Lady and the Tramp II: Scamp's Adventure", 'peril', 'Junkyard dogs and a pound; the pup learns his lesson.'),
        f('oliver-and-company', 'Oliver & Company', 1988, 'Disney', 'Oliver & Company', 'peril', 'Sykes and his dobermans; a scary subway-train climax.'),
        f('pocahontas-ii', 'Pocahontas II: Journey to a New World', 1998, 'Disneytoon', 'Pocahontas II: Journey to a New World', 'peril', 'A bear-baiting scene and a near-execution; softer than the first.'),
        f('tinker-bell-neverbeast', 'Tinker Bell and the Legend of the NeverBeast', 2014, 'Disneytoon', 'Tinker Bell and the Legend of the NeverBeast', 'peril', 'A misunderstood "monster"; the scout fairies overreact and all ends well.'),
        f('the-pirate-fairy', 'The Pirate Fairy', 2014, 'Disneytoon', 'The Pirate Fairy', 'peril', 'A young Captain Hook and pirate scuffles; swashbuckling, not grim.'),
        f('planes-fire-and-rescue', 'Planes: Fire & Rescue', 2014, 'Disneytoon', 'Planes: Fire & Rescue', 'peril', 'A wildfire and a trapped-tourists rescue; genuinely tense for a Planes film.'),
        f('the-lion-king', 'The Lion King', 1994, 'Disney', 'The Lion King', 'peril', 'Mufasa’s death and the stampede are the scenes to prepare them for. Otherwise glorious.'),

        // ---------- PREVIEW FIRST ----------
        f('finding-nemo', 'Finding Nemo', 2003, 'Pixar', 'Finding Nemo', 'preview', 'The opening loses Nemo’s mum and siblings; anglerfish and sharks after. Beloved once past minute five.'),
        f('coco', 'Coco', 2017, 'Pixar', 'Coco (2017 film)', 'preview', 'Skeletons everywhere and a betrayal; some kids find the Land of the Dead eerie. Deeply moving.'),
        f('up', 'Up', 2009, 'Pixar', 'Up (2009 film)', 'preview', 'The wordless opening montage is a gut-punch; talking dogs fly planes later. Worth it.'),
        f('inside-out-2', 'Inside Out 2', 2024, 'Pixar', 'Inside Out 2', 'preview', 'Anxiety arrives as a character and there is a panic-attack scene — could hit close to home. Preview and decide.'),
        f('brave', 'Brave', 2012, 'Pixar', 'Brave (2012 film)', 'preview', 'Mor’du the bear is a proper horror-movie beast; a mother-turned-bear in danger.'),
        f('bambi', 'Bambi', 1942, 'Disney', 'Bambi', 'preview', 'The forest fire, the gunshots, and that line about Bambi’s mother.'),
        f('snow-white', 'Snow White and the Seven Dwarfs', 1937, 'Disney', 'Snow White and the Seven Dwarfs (1937 film)', 'preview', 'The witch’s transformation and the forest flight terrified generations. At least it is short.'),
        f('sleeping-beauty', 'Sleeping Beauty', 1959, 'Disney', 'Sleeping Beauty (1959 film)', 'preview', 'Maleficent becomes a dragon and calls on "all the powers of hell". Stunning to look at.'),
        f('the-princess-and-the-frog', 'The Princess and the Frog', 2009, 'Disney', 'The Princess and the Frog', 'preview', 'Dr. Facilier’s voodoo shadow-demons are nightmare fuel for little ones. Gorgeous otherwise.'),
        f('the-good-dinosaur', 'The Good Dinosaur', 2015, 'Pixar', 'The Good Dinosaur', 'preview', 'A parent dies in a flood, then storms, pterodactyls and a hallucination scene. Very intense.'),
        f('pinocchio', 'Pinocchio', 1940, 'Disney', 'Pinocchio (1940 film)', 'preview', 'Pleasure Island, boys turning into donkeys, and Monstro the whale. Genuinely scarring.'),
        f('the-hunchback-of-notre-dame', 'The Hunchback of Notre Dame', 1996, 'Disney', 'The Hunchback of Notre Dame (1996 film)', 'preview', 'Frollo, "Hellfire", attempted burnings — Disney’s darkest. Save it for years from now.')
    ];

    // Films already watched, with month and which girls were there. These seed
    // disney_data.json on first run (see server.py _disney_default_data()).
    // date is "YYYY-MM" (month precision); girls not listed did not watch.
    var WATCHED_SEED = [
        { id: 'encanto',        date: '2025-04', girls: ['noga', 'dana', 'ella'] },
        { id: 'the-101-dalmatians-1961', title: 'One Hundred and One Dalmatians', year: 1961, studio: 'Disney', wiki: 'One Hundred and One Dalmatians', tier: 'peril', note: 'Cruella de Vil and a stormy rescue; the classic animated one.', date: '2025-04', girls: ['noga', 'dana', 'ella'] },
        { id: 'toy-story-5',    title: 'Toy Story 5', year: 2026, studio: 'Pixar', wiki: 'Toy Story 5', tier: 'peril', note: 'The newest one.', date: '2026-07', girls: ['dana', 'ella'] },
        { id: 'mulan',          date: '2026-08', girls: ['noga', 'dana', 'ella'] },
        { id: 'moana',          date: '2026-08', girls: ['noga', 'dana', 'ella'] },
        { id: 'moana-2',        date: '2026-08', girls: ['noga', 'dana', 'ella'] },
        { id: 'frozen',         date: '2026-09', girls: ['ella'] }
    ];

    // Popularity score (0-100): roughly worldwide box office with a firm nudge
    // toward recent films. Drives the *default* watch order — the family didn't
    // like "gentlest first". The live order is then: most 👍 likes, then this.
    var POP = {
        'inside-out-2': 100, 'frozen-ii': 96, 'frozen': 95, 'incredibles-2': 94, 'moana-2': 94,
        'toy-story-4': 92, 'zootopia': 92, 'encanto': 92, 'moana': 91, 'finding-dory': 90,
        'coco': 90, 'zootopia-2': 89, 'finding-nemo': 89, 'inside-out': 88, 'the-lion-king': 88,
        'big-hero-6': 87, 'up': 86, 'monsters-university': 85, 'ralph-breaks-the-internet': 84,
        'the-incredibles': 84, 'tangled': 84, 'wall-e': 83, 'monsters-inc': 83, 'elemental': 83,
        'ratatouille': 82, 'brave': 82, 'wreck-it-ralph': 81, 'turning-red': 80, 'toy-story-2': 79,
        'aladdin': 79, 'cars': 78, 'soul': 78, 'luca': 78, 'toy-story': 76, 'cars-2': 76,
        'raya-and-the-last-dragon': 76, 'beauty-and-the-beast': 75, 'cars-3': 74, 'wish': 74,
        'mulan': 73, 'the-little-mermaid': 72, 'a-bugs-life': 71, 'lightyear': 71, 'lilo-and-stitch': 70,
        'hercules': 70, 'onward': 70, 'the-good-dinosaur': 68, 'the-hunchback-of-notre-dame': 68,
        'the-jungle-book': 67, 'snow-white': 66, 'the-princess-and-the-frog': 66, 'chicken-little': 62,
        'emperors-new-groove': 62, 'lady-and-the-tramp': 60, 'bambi': 58, 'meet-the-robinsons': 58,
        'atlantis-the-lost-empire': 56, 'peter-pan': 56, 'strange-world': 56, 'pinocchio': 56,
        'the-aristocats': 54, 'sleeping-beauty': 54, 'planes': 50, 'treasure-planet': 50,
        'robin-hood': 48, 'home-on-the-range': 46, 'the-rescuers': 46, 'return-to-never-land': 46,
        'the-jungle-book-2': 46, 'many-adventures-pooh': 44, 'the-sword-in-the-stone': 44,
        'oliver-and-company': 44, 'planes-fire-and-rescue': 44, 'the-lion-king-ii': 42,
        'the-great-mouse-detective': 40, 'the-rescuers-down-under': 40, 'fantasia-2000': 40,
        'winnie-the-pooh-2011': 40, 'tinker-bell': 36, 'lion-king-1half': 32, 'mulan-ii': 30,
        '101-dalmatians-ii': 30, 'tinker-bell-lost-treasure': 30, 'tinker-bell-great-fairy-rescue': 30,
        'secret-of-the-wings': 30, 'cinderella-iii': 28, 'tinker-bell-neverbeast': 28, 'the-pirate-fairy': 28,
        'cinderella-ii': 26, 'lilo-and-stitch-2': 26, 'bambi-ii': 26, 'lady-and-the-tramp-ii': 26,
        'tarzan-ii': 24, 'the-little-mermaid-ariels-beginning': 24, 'pocahontas-ii': 24,
        'kronks-new-groove': 22, 'leroy-and-stitch': 22, 'belles-magical-world': 18
    };
    CATALOG.forEach(function (c) { c.pop = (typeof POP[c.id] === 'number') ? POP[c.id] : 45; });

    window.DisneyWatchData = {
        TIERS: TIERS,
        PALETTE: PALETTE,
        CATALOG: CATALOG,
        WATCHED_SEED: WATCHED_SEED,
        GIRLS: [
            { id: 'noga', name: 'Noga', emoji: '🦫', color: '#f59e0b' },
            { id: 'dana', name: 'Dana', emoji: '🦊', color: '#fb923c' },
            { id: 'ella', name: 'Ella', emoji: '🐼', color: '#38bdf8' }
        ],
        accentFor: function (index) { return PALETTE[index % PALETTE.length]; },
        byId: function (id) {
            for (var i = 0; i < CATALOG.length; i++) { if (CATALOG[i].id === id) return CATALOG[i]; }
            return null;
        }
    };
})();
