// Hangman - game logic
var WORDS = [
  { word: "apple", clue: "A round fruit that is often red or green.",
    hint: "They say one a day keeps the doctor away." },
  { word: "banana", clue: "A long yellow fruit that monkeys love.",
    hint: "You peel it before you eat it." },
  { word: "water", clue: "You drink it every day, and rain is made of it.",
    hint: "It is clear and has no color or taste." },
  { word: "house", clue: "The place where a family lives.",
    hint: "It has a roof, walls, doors and windows." },
  { word: "chair", clue: "You sit on it.",
    hint: "It usually has four legs and a back." },
  { word: "tiger", clue: "A big wild cat with orange fur and black stripes.",
    hint: "It is the largest cat in the world." },
  { word: "pizza", clue: "A round Italian food with cheese on top.",
    hint: "It is cut into slices." },
  { word: "river", clue: "Water that flows across land towards the sea.",
    hint: "A bridge is often built over it." },
  { word: "phone", clue: "You use it to call and text people.",
    hint: "Most people carry one in their pocket." },
  { word: "door", clue: "You open it to enter or leave a room.",
    hint: "It has a handle and often a lock." },
  { word: "book", clue: "You read it, and it is made of pages.",
    hint: "A library is full of them." },
  { word: "train", clue: "It runs on tracks and carries many passengers.",
    hint: "It goes choo-choo." },
  { word: "moon", clue: "It shines in the night sky and changes shape.",
    hint: "Astronauts have walked on it." },
  { word: "bread", clue: "A baked food made from flour, often sliced.",
    hint: "You use two slices to make a sandwich." },
  { word: "clock", clue: "It shows you the time.",
    hint: "It has hands and numbers on its face." },
  { word: "milk", clue: "A white drink that comes from cows.",
    hint: "Many people pour it on cereal." },
  { word: "shoes", clue: "You wear them on your feet.",
    hint: "They come in pairs and often have laces." },
  { word: "beach", clue: "A sandy place next to the sea.",
    hint: "People build sandcastles there." },
  { word: "cheese", clue: "A yellow food made from milk.",
    hint: "Mice love it in cartoons." },
  { word: "garden", clue: "A place outside where flowers and vegetables grow.",
    hint: "You water it and pull out the weeds." }
];
var MAX_WRONG = 6;
var ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

var current = null;   // the word entry in play
var guessed = [];
var wrong = [];
var hintUsed = false;
var over = false;
var won = false;
var wins = 0;
var losses = 0;

var wordEl = document.getElementById("word");
var clueEl = document.getElementById("clue");
var extraEl = document.getElementById("extra");
var hintBtn = document.getElementById("hintBtn");
var statusEl = document.getElementById("status");
var keysEl = document.getElementById("keys");
var countEl = document.getElementById("count");
var wrongListEl = document.getElementById("wrongList");
var winsEl = document.getElementById("wins");
var lossesEl = document.getElementById("losses");
var parts = document.querySelectorAll("#gallows .part");
var keyButtons = {};

ALPHABET.forEach(function (letter) {
  var b = document.createElement("button");
  b.type = "button";
  b.className = "key";
  b.textContent = letter;
  b.setAttribute("aria-label", letter);
  b.addEventListener("click", function () { guess(letter); });
  keysEl.appendChild(b);
  keyButtons[letter] = b;
});

function pickWord() {
  var next;
  do {
    next = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (current && next.word === current.word && WORDS.length > 1);
  return next;
}

function newGame() {
  current = pickWord();
  guessed = [];
  wrong = [];
  hintUsed = false;
  over = false;
  won = false;
  render("Guess a letter.");
}

function guess(letter) {
  if (over || guessed.indexOf(letter) !== -1) return;
  guessed.push(letter);
  var word = current.word;
  var message;

  if (word.indexOf(letter) !== -1) {
    message = letter.toUpperCase() + " is in the word.";
  } else {
    wrong.push(letter);
    message = letter.toUpperCase() + " is not in the word.";
  }

  var complete = word.split("").every(function (c) { return guessed.indexOf(c) !== -1; });
  if (complete) {
    over = true;
    won = true;
    wins += 1;
    message = "You won. The word is " + word.toUpperCase() + ".";
  } else if (wrong.length >= MAX_WRONG) {
    over = true;
    losses += 1;
    message = "Out of guesses. The word was " + word.toUpperCase() + ".";
  }
  render(message);
}

function showHint() {
  if (over || hintUsed) return;
  hintUsed = true;
  render("Extra hint shown.");
}

function render(message) {
  var word = current.word;

  wordEl.textContent = "";
  var spoken = [];
  word.split("").forEach(function (c) {
    var s = document.createElement("span");
    s.className = "slot";
    if (guessed.indexOf(c) !== -1) {
      s.textContent = c;
      spoken.push(c);
    } else if (over && !won) {
      s.textContent = c;
      s.className += " missed";
      spoken.push(c);
    } else {
      s.textContent = "\u00a0";
      spoken.push("blank");
    }
    wordEl.appendChild(s);
  });
  wordEl.setAttribute("aria-label", "Word, " + word.length + " letters: " + spoken.join(" "));

  clueEl.textContent = "Hint: " + current.clue;
  extraEl.hidden = !hintUsed;
  extraEl.textContent = "Extra hint: " + current.hint;
  hintBtn.disabled = hintUsed || over;

  for (var i = 0; i < parts.length; i++) {
    if (i < wrong.length) parts[i].classList.add("on");
    else parts[i].classList.remove("on");
  }

  ALPHABET.forEach(function (letter) {
    var b = keyButtons[letter];
    var used = guessed.indexOf(letter) !== -1;
    b.className = "key";
    if (used) b.className += word.indexOf(letter) !== -1 ? " hit" : " miss";
    b.disabled = used || over;
  });

  countEl.textContent = String(wrong.length);
  wrongListEl.textContent = wrong.length ? " (" + wrong.join(", ").toUpperCase() + ")" : "";
  winsEl.textContent = String(wins);
  lossesEl.textContent = String(losses);
  statusEl.textContent = message;
  statusEl.className = "status" + (over ? (won ? " win" : " lose") : "");
}

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key && /^[a-zA-Z]$/.test(e.key)) guess(e.key.toLowerCase());
});
hintBtn.addEventListener("click", showHint);
document.getElementById("newGame").addEventListener("click", newGame);

newGame();
