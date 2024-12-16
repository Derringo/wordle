const apiWotd = "https://words.dev-apis.com/word-of-the-day?random=1";
const apiValidate = "https://words.dev-apis.com/validate-word";
const boxes = document.querySelectorAll(".scoreboard-letter");

let wordBuffer = "";
let currentRow = 0;
let guesses = [];


function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

async function getWordOfTheDay() {
    fetch(apiWotd)
        .then(response => {
            if (!response.ok) {
                throw new Error("wotd response not OK");
            }
            return response.json();
        })
        .then(data => {
            //console.log(data);
            wordOfTheDay = data['word'];
          })
          .catch(error => {
            console.error('Error:', error);
          });
}

async function validateWord(word) {
    // Disallow under 5 letters
    if (word.length < 5) return false;
    // Disallow previous guesses
    if (guesses.includes(word)) return false;

    const res = await fetch(apiValidate, {
        method: "POST",
        body: JSON.stringify({ word: word })
    });

    const {validWord} = await res.json();

    return validWord;
}

function checkWord(word) {
    let guess = word.split("");
    let answer = wordOfTheDay.split("");

    // Check green
    for (let i=0; i<5; i++) {
        if (guess[i] === answer[i]) {
            boxes[i+currentRow*5].classList.add("correct-place");
            guess[i] = "-";
            answer[i] = " ";
        }
    }

    //Check yellow
    for (let i=0; i<5; i++) {
       for (let j=0; j<5; j++) {
            if (guess[i] === answer[j]) {
                boxes[i+currentRow*5].classList.add("correct-letter");
                guess[i] = " ";
                answer[j] = " ";
                break;
            }
        }
    }

    // Fill grey
    for (let i=0; i<5; i++) {
        if (isLetter(guess[i])) {
            boxes[i+currentRow*5].classList.add("wrong-letter");
        }
    }

    if (word === wordOfTheDay) {
        return true;
    }
    return false;
}

function updateWord() {
    for (let i=0; i<5; i++) {
        if (i < wordBuffer.length) {
            boxes[i+currentRow*5].innerText = wordBuffer[i].toUpperCase();
        } else {
            boxes[i+currentRow*5].innerText = "";
        }
    }
}

function invalidate() {
    for (let i=0; i<5; i++) {
        for (let j=0; j<2; j++) {
            setTimeout(() => boxes[i+currentRow*5].classList.add("invalid"), 600*j);
            setTimeout(() => boxes[i+currentRow*5].classList.remove("invalid"), 300+600*j);
        }
    }
}

function gameOver(condition) {
    // Stop keyboard input
    document
        .querySelector("body")
        .removeEventListener("keydown", function(event) {});
    // Game over message
    let header = document.querySelector(".header");
    if (condition === 0) {
        header.innerText = "YOU WIN";
        header.style.color = "green";
    } else {
        header.innerText = "YOU LOSE";
        header.style.color = "red";
    }
}

function init() {
    getWordOfTheDay();
    document
        .querySelector("body")
        .addEventListener("keydown", async function (event) {
            if (isLetter(event.key)) { // IF LETTER
                if (wordBuffer.length < 5) {
                    wordBuffer += event.key.toLowerCase();
                }
            } else { // IF NOT A LETTER
                event.preventDefault();
                if (event.key === "Backspace") {
                    if (wordBuffer.length > 0) {
                        wordBuffer = wordBuffer.slice(0, -1);
                    }
                }
                if (event.key === "Enter") {
                    if (await validateWord(wordBuffer)) {
                        if (checkWord(wordBuffer)) { gameOver(0); }
                        else if (currentRow === 5) { gameOver(1); }
                        else {
                            guesses.push(wordBuffer);
                            wordBuffer = "";
                            currentRow++;
                        }
                    } else {invalidate();}
                    
                }
            }
            updateWord();
        });
}

init();