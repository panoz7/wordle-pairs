<?php

date_default_timezone_set('America/New_York');

$currentPairFile = "current-letter-pair.json";

// Load all the possible wordle words
$wordleWords = getWordleWords();

// Get the current week and day numbers
$currentWeek = getWeekNum();
$currentDay = getDayNum();

// Load the current letter pairs from the saved file
$letterPairs = getCurrentPairs();

// If the saved week is different than the current week
if (!$letterPairs || $currentWeek != $letterPairs['weekNum']) {

    // Generate the new letter pair
    $letterPairs = genLetterPair($wordleWords);
    $letterPairs['weekNum'] = $currentWeek;

}

if (!isSet($letterPairs['dayNum']) || $letterPairs['dayNum'] != $currentDay) {
    // Add the day num
    $letterPairs['dayNum'] = $currentDay;

    // Get the index for a random word in the matching words word list
    $randomWordIndex = rand(0, count($letterPairs['matchingWords']) - 1);

    // Remove the word from the matching words list
    $todaysWord = array_splice($letterPairs['matchingWords'], $randomWordIndex, 1)[0];

    // Add the word to the object
    $letterPairs['word'] = $todaysWord;

}

// Update the database
savePairs($letterPairs);

// Output the results
header('Content-type: application/json');
echo json_encode($letterPairs);


function getWeekNum($date = null) {
    // Build a date time object from the date string
    $dateTime = new DateTime($date);

    // Return the week number
    return($dateTime->format("W"));
}

function getDayNum($date = null) {
    // Build a date time object from the date string
    $dateTime = new DateTime($date);

    $dayNum = $dateTime->format('w');

    if ($dayNum == 0) {
        return(7);
    }

    return($dayNum);
}

function getWordleWords() {
    // Load the words
    $words = file_get_contents('words.txt');
    
    // Split them into an array
    return(explode("\n", $words));
}


function getPossibleWords($letter1, $letter2, $wordList) {

    $filteredWords = array_filter($wordList, function($word) use($letter1, $letter2) {
        return hasLetters($letter1, $letter2, $word);
    });

    return array_values($filteredWords);
}

function hasLetters($letter1, $letter2, $word) {

    $letter1Pos = strpos($word, $letter1);
    

    if ($letter1Pos === false) {
        return false;
    }

    $letter2Pos = strpos($word, $letter2, $letter1Pos + 1);

    if ($letter2Pos === false) {
        return false;
    }

   return true;
}

function wordFilter($word) {
    return hasLetters($letter1, $letter2, $word);
}


function genLetterPair($wordList) {

    // Generate two random letters
    $letter1 = chr(rand(97,122));
    $letter2 = chr(rand(97,122));


    // Get words that have both of those letters
    $words = getPossibleWords($letter1, $letter2, $wordList);
    
    // If there's at least 7 words
    if (count($words) >= 7) {
        return array(
            'letter1' => $letter1,
            'letter2' => $letter2,
            'matchingWords' => $words
        );
    }

    return genLetterPair($wordList);

}

function getCurrentPairs() {
    global $currentPairFile;
    $content = file_get_contents($currentPairFile);
    return json_decode($content, true);
}

function savePairs($letterPair) {
    global $currentPairFile;
    file_put_contents($currentPairFile, json_encode($letterPair));
}

?>