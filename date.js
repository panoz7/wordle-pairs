
function dateString(template) {

    const date = new Date();

    const transforms = {
        "y": date.getFullYear()
    }

    const transformedLetters = [];

    for (let i = 0; i < template.length; i++) {
        const letter = template[i];
        const transformedLetter = transforms[letter];
        transformedLetters[i] = transformedLetter ? transformedLetter : letter;
    }

    return(transformedLetters.join(""))


}


console.log(dateString("y-yg"));