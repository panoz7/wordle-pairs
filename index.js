
const apiUrl = 'api'
console.log('here');
setup();



async function setup() {

    // Get the pair data from the api
    const pairData = await getPairData();
    console.log(pairData);

    // Update the week number in the UI 
    document.getElementById('week-num').innerHTML = pairData.weekNum;

    // Add the letters in the UI
    document.getElementById('letter1').innerHTML = pairData.letter1;
    document.getElementById('letter2').innerHTML = pairData.letter2;

    // Add text to the expanding matching words button
    document.getElementById('match-count').innerHTML = pairData.matchingWords.length;

    // Add the event listener to the button
    document.getElementById('expand-matching-words').addEventListener('click', (e) => {
        e.target.parentElement.classList.toggle('expanded')
    })

    // Add the matching words
    const wordMatchesUl = document.getElementById('word-matches');

    for (let word of pairData.matchingWords) {
        const li = document.createElement('li');
        li.innerHTML = word;
        wordMatchesUl.appendChild(li);
    }


}





async function getPairData() {
    const response = await fetch('api');
    const jsonData = await response.json();
    return jsonData;
}