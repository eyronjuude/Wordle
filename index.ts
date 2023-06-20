const appDiv = document.getElementById('app');

if (appDiv !== null) {
    let elements: HTMLElement[] = [];
    let guessword: string;
    let guesses: number = 0;

    // create input box with default value of the URL
    const inputBox: HTMLInputElement = document.createElement('input');
    inputBox.setAttribute('title', 'URL');
    inputBox.setAttribute('type', 'text');
    inputBox.setAttribute('value', 'https://gist.githubusercontent.com/dracos/dd0668f281e685bad51479e5acaadb93/raw/ca9018b32e963292473841fb55fd5a62176769b5/valid-wordle-words.txt');
    
    // create input button to confirm URL
    const inputBoxButton = document.createElement('button');
    inputBoxButton.setAttribute('type', 'button');
    inputBoxButton.textContent = 'Confirm';
    // add onClick event listener for the button
    inputBoxButton.addEventListener('click', () => {
        // if input text is empty
        if (inputBox.value.length === 0){
            alert('No URL is specified.');
            return;
        }
        // if input text is non-empty
        // access the URL
        let xhr = new XMLHttpRequest;
        xhr.open('GET', inputBox.value, true);
        xhr.addEventListener('load', () => {
            const textArray = xhr.responseText.split('\n');
            const randomIndex = Math.floor(Math.random() * (textArray.length));
            // Get random word
            guessword = textArray[randomIndex].toUpperCase();
            // Upon generation of random word, remove the input box and button
            appDiv.removeChild(inputBox);
            appDiv.removeChild(inputBoxButton);
            wordblock.removeAttribute('hidden');
            azBlock.classList.add('azbar');
            azBlock.removeAttribute('hidden');
        })
        xhr.send();
        return;
    })

    const wordblock = document.createElement('div');
    wordblock.setAttribute('name', 'guess');
    wordblock.setAttribute('hidden', '');
    const guessblock = document.createElement('p');
    guessblock.setAttribute('name', 'guessblock');
    let guessblockElements: HTMLSpanElement[] = [];
    let guessblockCount = 0;
    for (let i = 0; i < 5; i++){
        let guessblockletter = document.createElement('span');
        guessblockletter.classList.add('default');
        guessblock.appendChild(guessblockletter);
        guessblockElements.push(guessblockletter);
    }
    wordblock.appendChild(guessblock);

    const azBlock = document.createElement('span');
    azBlock.setAttribute('hidden', '');
    // A-Z characters for input
    for(let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++){
        let appendLetter = document.createElement('span');
        appendLetter.classList.add('azblock');
        appendLetter.textContent = String.fromCharCode(i);
        function enqueueLetterClick () {
            // do not act unless guessblock is shown
            if (wordblock.getAttribute('hidden') !== null) return;
            // enqueue if not yet full
            if (guessblockCount == 5) return;
            guessblockElements[guessblockCount++].textContent = appendLetter.textContent;
        }
        appendLetter.addEventListener('click', enqueueLetterClick);
        azBlock.appendChild(appendLetter);
    }
    
    function dequeueLetterBackspace (press: KeyboardEvent) {
        // do not act unless guessblock is shown
        if (wordblock.getAttribute('hidden') !== null) return;
        // check if the pressed key is Backspace
        if (press.key !== "Backspace") return;
        // dequeue if not empty
        if (guessblockCount == 0) return;
        // dequeue if Backspace is entered
        guessblockElements[--guessblockCount].textContent = '';
    }

    function enqueueLetterKeypress (press: KeyboardEvent) {
        // do not act unless guessblock is shown
        if (wordblock.getAttribute('hidden') !== null) return;
        // check if the pressed key is a valid letter
        if (press.code.slice(0,3) !== "Key") return;
        // enqueue if letter is entered and not yet full
        if (guessblockCount == 5) return;
        guessblockElements[guessblockCount++].textContent = press.key.toUpperCase();
    }

    function confirmUponEnter (press: KeyboardEvent) {
        // do not act unless guessblock is shown
        if (wordblock.getAttribute('hidden') !== null) return;
        // if key pressed is not Enter, then just ignore
        if (press.key !== 'Enter') return;
        // if guess is not valid, do not consider guess
        // and clear the text box
        if (guessblockCount !== 5){
            alert('The input box should have exactly five characters!');
            return;
        }
        // the guess is valid -> increment guess by 1
        ++guesses;
        // display the input text on screen, with style

        // check if character is CORRECT, MISPLACED, or WRONG
        enum gstates {UNCHECKED, CHECKED};
        enum states {CORRECT, MISPLACED, WRONG};
        let guesswordStates: number[] = new Array(5).fill(gstates.UNCHECKED);
        let newInputBoxStates: number[] = new Array(5).fill(states.WRONG);
        // check for correct letters
        for (let i = 0; i < 5; i++){
            if (guessblockElements[i].textContent !== guessword[i]) continue; // ignore if not correct
            guesswordStates[i] = gstates.CHECKED; // set guessword letter state to CHECKED
            newInputBoxStates[i] = states.CORRECT; // set input letter state to CORRECT
        }
        // check of misplaced letters
        for(let i = 0; i < 5; i++){
            if (newInputBoxStates[i] === states.CORRECT) continue;
            for(let j = 0; j < 5; j++){
                if (guessblockElements[i].textContent !== guessword[j]) continue; // ignore if not match
                if (guesswordStates[j] === gstates.CHECKED) continue; // ignore if already checked
                guesswordStates[j] = gstates.CHECKED; // set guessword letter state to CHECKED
                newInputBoxStates[i] = states.MISPLACED; // set input letter state to MISPLACED
                break; // MISPLACED IS FOUND, BREAK SCANNING
            }
        }
        // append text blocks
        let textblock = document.createElement('p');
        wordblock.insertBefore(textblock, guessblock);
        for (let i = 0; i < 5; i++){
            let appendText = document.createElement('span');
            switch (newInputBoxStates[i]){
                case states.CORRECT:
                    appendText.classList.add('correct');
                    break;
                case states.MISPLACED:
                    appendText.classList.add('misplaced');
                    break;
                default:
                    appendText.classList.add('default');
            }
            appendText.textContent = guessblockElements[i].textContent;
            textblock.appendChild(appendText);
        }
        // if the guess is correct, display the correct guessed word
        let inputword = guessblockElements.map(x => x.textContent).join('');
        if (inputword == guessword){
            alert(`Congratulations! The word ${guessword} is guessed correctly!`);
            wordblock.removeChild(guessblock);
            document.removeEventListener('keyup', confirmUponEnter);
            document.removeEventListener('keyup', dequeueLetterBackspace);
            document.removeEventListener('keyup', enqueueLetterKeypress);
            return;
        }
        if (guesses == 6){
            alert(`Game is over! The correct word is ${guessword}`);
            for (let i = 0; i < 5; i++){
                guessblockElements[i].classList.add('wrong');
                guessblockElements[i].textContent = guessword[i];
            }
            document.removeEventListener('keyup', confirmUponEnter);
            document.removeEventListener('keyup', dequeueLetterBackspace);
            document.removeEventListener('keyup', enqueueLetterKeypress);
            return;
        }
        // input box should have its content cleared
        for (let i = 0; i < 5; i++){
            guessblockElements[i].textContent = '';
            guessblockCount = 0;
        }
        return;
    }

    document.addEventListener('keyup', confirmUponEnter);
    document.addEventListener('keyup', dequeueLetterBackspace);
    document.addEventListener('keyup', enqueueLetterKeypress);

    elements.push(inputBox);
    elements.push(inputBoxButton);
    elements.push(wordblock);
    elements.push(azBlock);
    // add entire block
    appDiv.replaceChildren(...elements);
}