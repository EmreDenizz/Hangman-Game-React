import React, { useState, useEffect } from 'react'
import './App.css';

const letterCount = 7
const wrongCountLimit = 7

const keyboard = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
]

function App() {
  const [lettersEntered, setLettersEntered] = useState([])
  const [clickedKeys, setClickedKeys] = useState([])
  const [wrongCount, setWrongCount] = useState(0)

  const [gameOver, setGameOver] = useState(false)
  const [gameWin, setGameWin] = useState(false)

  const [answer, setAnswer] = useState("")
  const [hint, setHint] = useState("")

  // render input boxes
  const renderInputBoxes = () => {
    const inputs = []
    for(let i = 0; i<letterCount; i++){
      inputs.push(
        <input
          type="text"
          className='Input-Box'
          disabled={true}
          key={i}
          id={`box_${i}`}
          value={lettersEntered[i] ? lettersEntered[i] : ""}
        />
      )
    }
    return (<div className='Input-Row'>{inputs}</div>)
  }

  // render keyboard
  const renderKeyboard = () => {
    return (
      <div className='Keyboard'>
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="Keyboard-Row">
            {row.map((key, keyIndex) => (
              <div key={keyIndex} className={`Keyboard-Key ${clickedKeys.includes(key) ? "Gray-Background" : ""}`} onClick={() => onKeyPress(key)}>{key}</div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  // call when page loads
  useEffect(() => {
    if(!answer){
      getAnswerFromAPI()
    }
    console.log(answer)

    setLettersEntered(Array(letterCount).fill(""))
  }, [answer, hint])

  // get answer from API
  const getAnswerFromAPI = async() => {
    try {
      const response = await fetch(`https://www.wordgamedb.com/api/v1/words/?numLetters=${letterCount}`)
      const json = await response.json()
      const randomIndex = Math.floor(Math.random() * json.length)
      
      setAnswer((json[randomIndex].word).toUpperCase())
      setHint(json[randomIndex].hint)
    } catch(error){
      console.log(error)
    }
  }

  // handle keyboard press
  const onKeyPress = (key) => {
    const indexes = []
    for(let i=0; i<letterCount; i++){
      if(answer[i] === key){
        indexes.push(i)
      }
    }

    // update clicked keys
    setClickedKeys(prevKeys => [...prevKeys, key]);

    if(!indexes.length){
      setWrongCount(c => c + 1)

      // lost the game
      if(wrongCount+1 === wrongCountLimit){
        setTimeout(() => {
          setGameOver(true)
          const updatedLettersEntered = [...lettersEntered];
          for(let i=0; i<answer.length; i++){
            updatedLettersEntered[i] = answer[i]
          }
          setLettersEntered(updatedLettersEntered);
        }, 250);
      }
    }
    else{
      const updatedLettersEntered = [...lettersEntered];
      for(let i=0; i<indexes.length; i++){
        updatedLettersEntered[indexes[i]] = key
      }
      setLettersEntered(updatedLettersEntered);

      // win the game
      if(updatedLettersEntered.join("") === answer){
        setTimeout(() => {
          setGameWin(true)
        }, 250);
      }
    }
  }

  return (
    <div className="App">
      <p className='Title'>Play HANGMAN</p>
      <button className='Button-NewGame' onClick={() => window.location.reload()}>New Game</button><br/><br/>
      <div className='Hangman'>
        <div className={`Hook ${wrongCount > 0 ? "Border-Red" : ""}`}></div>
        <div className={`Head ${wrongCount > 1 ? "Border-Red" : ""}`}></div>
        <div className={`Body ${wrongCount > 2 ? "Border-Red" : ""}`}></div>
        <div className={`Arm-Left ${wrongCount > 3 ? "Border-Red" : ""}`}></div>
        <div className={`Arm-Right ${wrongCount > 4 ? "Border-Red" : ""}`}></div>
        <div className={`Leg-Left ${wrongCount > 5 ? "Border-Red" : ""}`}></div>
        <div className={`Leg-Right ${wrongCount > 6 ? "Border-Red" : ""}`}></div>
      </div><br/><br/>
      {wrongCount >= 5 ?
        <span style={{fontSize: "20px", color: "blue" }}><b>Hint: {hint}</b></span> :
        <span style={{fontSize: "20px", visibility: "hidden" }}><b>Hint</b></span>}
      {renderInputBoxes()}<br/><br/>
      {gameOver && <span style={{fontSize: "30px", color: "red" }}><b>You lost the game!</b></span>}
      {gameWin && <span style={{fontSize: "30px", color: "green" }}><b>You won the game!</b></span>}
      {(!gameOver && !gameWin) && renderKeyboard()}<br/><br/>
    </div>
  );
}

export default App;
