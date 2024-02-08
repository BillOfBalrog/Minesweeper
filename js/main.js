'use strict'

const MINE = '💣' 
const FLAG = '🚩'

const gGame = { 
    isOn: false, 
    shownCount: 0, 
    markedCount: 0, 
    secsPassed: 0,
    lives: 3
} 
const gLevel = { 
    SIZE: 4, 
    MINES: 2
} 
var gBoard
var gIsFirstClick
var gFirstPos = {}
var gMines
var gCurrMode
  
function onInit() {
    gGame.isOn = true
    gCurrMode = gLevel
    gMines = gLevel.MINES
    gIsFirstClick = false
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function startGame() { 
    setMinesOnBoard(gBoard) 
    setMinesNegsCount(gBoard)
    startTimer()
}

function resetSmileyButton() {
    changeGameModes(gCurrMode.SIZE, gCurrMode.MINES)    
}

function changeGameModes(size, mines) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    resetgGame()
    gBoard = buildBoard()
    gIsFirstClick = false
    clearTimer()
    onInit()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = createCell()
        }
    }
    return board
}

function createCell() { 
    return {
        minesAroundCount: 0, 
        isShown: false, 
        isMine: false, 
        isMarked: false 
    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const className = `cell cell-${i}-${j}`

            if (cell.isMine) {
                strHTML += `<td class="${className} mine" onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j})")"></td>`
            } 
            else { strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" 
                        oncontextmenu="onCellMarked(this, ${i}, ${j})")"></td>`
            }
        }
        strHTML += '</tr>'
    }
    const elContainer = document.querySelector('.board')
    elContainer.innerHTML = strHTML
}

function setMinesOnBoard(board) {
    var minesCount = gLevel.MINES
    while (minesCount > 0) {
        var rndRowIdx = getRandomInt(0, gLevel.SIZE)
        var rndColIdx = getRandomInt(0, gLevel.SIZE)
        if (!board[rndRowIdx][rndColIdx].isMine &&
            (rndRowIdx !== gFirstPos.i || rndColIdx !== gFirstPos.j)) {
            const cell = board[rndRowIdx][rndColIdx]
            cell.isMine = true
            minesCount--
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            getMinesNegsCount(i, j, board)
        }
    }
}

function getMinesNegsCount(cellI, cellJ, board) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) {
                board[cellI][cellJ].minesAroundCount++
            }
        }
    }
    return board[cellI][cellJ].minesAroundCount
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            
            const cell = gBoard[i][j]
            if (cell.isMine || cell.isMarked) continue
            
            setClickedAndPrintOnBoard(i, j)
        }
    }
}

function onCellClicked(elCell, i, j)  {
    if (elCell.classList.contains('marked') || elCell.classList.contains('clicked')
        || !gGame.isOn || gGame.lives <= 0) return
    
    if (!gIsFirstClick) {
        gIsFirstClick = true
        gFirstPos.i = i
        gFirstPos.j = j
        startGame()
    }
    
    elCell.classList.add('clicked')

    if (!gBoard[i][j].isMine) {
        setClickedAndPrintOnBoard(i, j)
        expandShown(i, j)
    } else {
        gGame.lives--
        gMines--
        setClickedAndPrintMine(elCell, i, j)
    }
    updateRemainMinesDisplay()
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    const cell = gBoard[i][j]
    if (!cell.isMarked && gGame.markedCount >= gMines
        || !gGame.isOn || gGame.lives <= 0) {
        return
    }

    if (cell.isMarked) {
        gGame.markedCount--
        elCell.innerText = ''
    } else {
        gGame.markedCount++
        elCell.innerText = FLAG
    }

    updateRemainMinesDisplay()
    elCell.classList.toggle('marked')
    cell.isMarked = !cell.isMarked
}

function checkGameOver() {
    var livesSpan = document.querySelector('.lives')
    var elLabel = document.querySelector('.alert-msg')
    livesSpan.textContent = gGame.lives
    
    if (gGame.lives === 0) {
        elLabel.textContent = 'Game over!'
        livesSpan.textContent = ''
        loseGame()
        displayRestOfMines()
        gGame.isOn = false
        return
    }

    if (gGame.shownCount + gLevel.MINES === gLevel.SIZE ** 2) {
        elLabel.textContent = 'You won! Woohoo!'
        livesSpan.textContent = ''
        displayRestOfMines()
        gGame.isOn = false
    } 
}

function resetgGame() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3

    handleDisplay()
}

function handleDisplay() {
    document.getElementById('gameStateButton').className = 'smiley'
    document.getElementById('gameStateButton').textContent = '😊'

    var livesSpan = document.querySelector('.lives');
    var elLabel = document.querySelector('.alert-msg')
    elLabel.textContent = 'Lives: '
    livesSpan.textContent = gGame.lives

    resetRemainMinesDisplay()
}

function displayRestOfMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isShown) {
                const elCell = getElementByIndx(i, j)
                elCell.style.background = 'red'
                elCell.innerText = MINE
            }
        }
    }
	stopTimer()
}

function loseGame() {
    document.getElementById('gameStateButton').className = 'sad'
    document.getElementById('gameStateButton').textContent = '😞'
}

function updateRemainMinesDisplay() {
    const elRemainMines = document.querySelector('.remain-mines span')
    const remainMines = gMines - gGame.markedCount
    elRemainMines.innerText = remainMines
}

function resetRemainMinesDisplay() {
    const elRemainMines = document.querySelector('.remain-mines span')
    elRemainMines.innerText = ''
}

function setClickedAndPrintOnBoard(i, j) {
    const elCell = getElementByIndx(i, j)
    const cell = gBoard[i][j]
    if (!cell.isShown) gGame.shownCount++
    cell.isShown = true
    elCell.classList.add('clicked')
    elCell.innerText = cell.minesAroundCount > 0 ? cell.minesAroundCount + '' : ''
}

function setClickedAndPrintMine(elCell, i, j) {
    gBoard[i][j].isShown = true
    elCell.innerText = MINE
}

function getElementByIndx(i, j) {
    const className = `cell-${i}-${j}`
    const callSelector = '.' + className
    const elCell = document.querySelector(callSelector)
    return elCell
}