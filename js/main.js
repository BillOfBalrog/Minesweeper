'use strict'

const MINE = '💣' 
const FLAG = '🚩'
 
const gLevel = { 
    SIZE: 4, 
    MINES: 2
} 
const gGame = { 
    isOn: false, 
    shownCount: 0, 
    markedCount: 0, 
    secsPassed: 0,
    currMines: 0,
    lives: 3
}
var gBoard
var gIsFirstClick
var gFirstPos = {}
var gMines
var gSafeClicks
var gMega = {
    hints: 2,
    isEnabled: false,
    Pos: []
}
var gHints
var gHintIsEnabled
var gRollbackBoard = []
var gTimeout
var gExterminator
var gSafeClickIsEnabled
  
function onInit() {
    gGame.isOn = true
    setFlagsAndOthers() 
    updateSpans()
    gBoard = buildBoard()
    renderBoard2(gBoard)
}

function startGame() { 
    setMinesOnBoard(gBoard) 
    setMinesNegsCount(gBoard)
    
    startTimer()
}

function resetSmileyButton() {
    changeGameModes()    
}

function changeGameModes(size = gLevel.SIZE, mines = gLevel.MINES) {
    gLevel.SIZE = size
    gLevel.MINES = mines
    resetgGame()
    gBoard = buildBoard()
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

function renderBoard2(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            const minesAroundCell = cell.minesAroundCount > 0 ? cell.minesAroundCount + '' : ''
            const className = `cell cell-${i}-${j}`

            if (cell.isMine && cell.isShown) {
                strHTML += `<td class="${className} mined clicked" onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j})")">${MINE}</td>`
            } 
            else if (cell.isShown) { 
                strHTML += `<td class="${className} clicked" onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j})")">${minesAroundCell}</td>`
            } 
            // else if (cell.isMine && !cell.isShown) { 
            //     strHTML += `<td class="${className} mine" onclick="onCellClicked(this, ${i}, ${j})" 
            //     oncontextmenu="onCellMarked(this, ${i}, ${j})")">${minesAroundCell}</td>`
            // }
            else if (cell.isMarked) { 
                strHTML += `<td class="${className} marked" onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j})")">${FLAG}</td>`
            } 
            else {
                strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})" 
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
            getAndSetMinesNegsCount(i, j, board)
        }
    }
}

function getAndSetMinesNegsCount(cellI, cellJ, board) {
    var count = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) {
                count++
            }
        }
    }
    board[cellI][cellJ].minesAroundCount = count
    return count
}

function onCellClicked(elCell, i, j)  {
    if (elCell.classList.contains('marked') || elCell.classList.contains('clicked')
        || !gGame.isOn || gGame.lives <= 0 || gTimeout) return

    if (gMega.isEnabled && gMega.hints) {
        const Pos = {}
        Pos.i = i
        Pos.j = j
        
        if (gMega.hints === 2) {
            gMega.Pos.push(Pos)
            gMega.hints--
            return
        }         
        gMega.Pos.push(Pos)
        gMega.hints--

        megaHint(gMega.Pos)
        return
    }
    
    if (gHintIsEnabled) {
        revealHint(elCell, i, j)
        return
    }
    
    if (!gIsFirstClick) {
        gIsFirstClick = true
        gFirstPos.i = i
        gFirstPos.j = j
        startGame()
    }

    gRollbackBoard.push(deepCopyBoard(gBoard))

    if (!gBoard[i][j].isMine) {
        if (gBoard[i][j].minesAroundCount === 0 ) fullExpansion(i, j)
        setClickedAndPrintOnBoard(i, j)
        renderBoard2(gBoard)
    } else {
        gGame.lives--
        gMines--
        gGame.currMines--
        setClickedAndPrintMine(elCell, i, j)
    }
    updateRemainMinesDisplay()
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    const cell = gBoard[i][j]
    if (!cell.isMarked && gGame.markedCount >= gMines
        || !gGame.isOn || gGame.lives <= 0 || elCell.classList.contains('clicked') || gTimeout) {
        return
    }

    if (cell.isMarked) {
        gGame.markedCount--
        elCell.innerText = ''
    } else {
        gGame.markedCount++
        elCell.innerText = FLAG
    }

    setInnerText('flags', gGame.markedCount)
    updateRemainMinesDisplay()
    elCell.classList.toggle('marked')
    cell.isMarked = !cell.isMarked
}

function checkGameOver() {
    setInnerText('lives', gGame.lives)

    if (gGame.lives === 0) {
        loseGame()
        endGameCommands()
        return
    }

    if (Number(gGame.shownCount) === Number(gLevel.SIZE ** 2) ||
        gGame.shownCount + Math.floor(gGame.currMines) === gLevel.SIZE ** 2 ||
        (gLevel.SIZE ** 2) - gGame.currMines === gGame.shownCount) {
        winGame()
        endGameCommands()
        return
    } 
}

function endGameCommands() {
    stopTimer()
    setInnerText('lives', '')
    displayRestOfMines()
    gGame.isOn = false
}

function resetgGame() {
    gGame.isOn = true
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.lives = 3
}

function displayRestOfMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isShown) {
                const elCell = getElementByIndx(i, j)
                elCell.style.background = 'red'
                elCell.classList.add('clicked')

                elCell.innerText = MINE
            }
        }
    }
}

function loseGame() {
    setInnerText('smiley','😞')
    setInnerText('tooltip','Game over!')
}

function winGame() {
    setInnerText('smiley','😎')
    setInnerText('tooltip','You won! Woohoo!')
}

function updateRemainMinesDisplay() {
    setInnerText('mines', gMines)
    // setInnerText('mines', gMines - gGame.markedCount)
}

function resetRemainMinesDisplay() {
    setInnerText('mines', g.gLevel.MINES)
}

function setClickedAndPrintOnBoard(i, j) {   
    const cell = gBoard[i][j]
    if (!cell.isShown) gGame.shownCount++
    cell.isShown = true
}

function setClickedAndPrintMine(elCell, i, j) {
    gBoard[i][j].isShown = true
    gGame.shownCount++

    elCell.classList.add('clicked')
    elCell.innerText = MINE
}

function getElementByIndx(i, j) {
    const className = `cell-${i}-${j}`
    const callSelector = '.' + className
    const elCell = document.querySelector(callSelector)
    return elCell
}

function setInnerText(el, val) {
    document.querySelector(`.${el}`).innerText = val
}

function updateSpans() {
    setInnerText('lives', '3')
    setInnerText('mines', gLevel.MINES)
    setInnerText('flags', '0')
    setInnerText('timer', '0')
    setInnerText('smiley','😊')
    setInnerText('safe-click', gSafeClicks)
    setInnerText('hints', gHints)
    // setInnerText('tooltip', '')
}

function setFlagsAndOthers() {
    gGame.currMines = gLevel.MINES
    gMines = gLevel.MINES
    gSafeClicks = 3
    gHints = 3
    gHintIsEnabled = false
    gMega = {
        hints: 2,
        isEnabled: false,
        Pos: []
    }
    gIsFirstClick = false
    gExterminator = true
    gSafeClickIsEnabled = false
    
}

