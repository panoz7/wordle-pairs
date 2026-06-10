const express = require('express');
const router = express.Router();
const fs = require('node:fs').promises;

const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const isoWeek = require('dayjs/plugin/isoWeek');
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);


router.get('/', async (req, res) => {    

    try {

        // Attempt to load the current letter pairs
        let letterPairs = await getCurrentPairs();

        // Get the current day and week numbers
        const today = dayjs().tz('America/New_York');
        const currentWeekNum = today.isoWeek();
        const currentDayNum = today.day() == 0 ? 7 : today.day();

        // If it's a new week
        if (!letterPairs || letterPairs.weekNum != currentWeekNum) {
            // Load the words list
            const wordListPath = 'api/words.txt';
            const wordList = (await fs.readFile(wordListPath, 'utf-8')).split('\n')

            // Generate a new letter pair 
            letterPairs = getLetterPair(wordList);
            
            // Add the week num
            letterPairs.weekNum = currentWeekNum;
        } 

        // If it's a new day 
        if (letterPairs.dayNum != currentDayNum) {
            // Grab a random entries index from the matching words list 
            const randomEntryIndex = Math.floor(Math.random() * letterPairs.matchingWords.length);

            // Remove the entry from the list
            const randomWord = letterPairs.matchingWords.splice(randomEntryIndex, 1)[0];

            // Add it to the letterPairs along with the day num
            letterPairs.dayNum = currentDayNum;
            letterPairs.word = randomWord;

            // Save it out so anyone else visiting on the same day gets the same word
            await saveCurrentPairs(letterPairs);
        }


        res.setHeader('Access-Control-Allow-Origin', '*')
        res.set('Content-Type', 'application/json')
        res.json(letterPairs);
    } catch(e) {

        console.log(e);

        const response = {
            valid: false
        }

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.set('Content-Type', 'application/json')
        res.send(response);


    }

})

async function getCurrentPairs() {

    try {
        const currentPairPath = 'api/current-letter-pair.json';
        return JSON.parse(await fs.readFile(currentPairPath));
    } catch(e) {
        return undefined;
    }

}

async function saveCurrentPairs(letterPairs) {
    const currentPairPath = 'api/current-letter-pair.json';
    await fs.writeFile(currentPairPath, JSON.stringify(letterPairs, undefined, 2), 'utf8')
}

function getLetterPair(wordList) {

    // Get two random starting letters
    const char1 = getRandomChar();
    const char2 = getRandomChar();

    // Get words that have those two letters
    const matchingWords = getMatchingWords(wordList, char1, char2);

    // Return the letters and words if there's at least 7 words (enought to cover a week)
    if (matchingWords.length >= 7) {
        return {
            letter1: char1, 
            letter2: char2, 
            matchingWords
        }
    }

    // Otherwise try again with two new random letters
    return getLetterPair(wordList);

}


function getRandomChar() {
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}

function getMatchingWords(wordList, char1, char2) {
    return wordList.filter(word => {

        // Search from the front for the first char and from the end for the second
        // If the letters are the same this ensures that words will still match as long as the letter repeats
        const char1Pos = word.indexOf(char1);
        const char2Pos = word.lastIndexOf(char2)

        // The word matches both letters are found and they aren't in the same position 
        return char1Pos >= 0 && char2Pos >= 0 && char2Pos != char1Pos;
    })
}

module.exports = {router};