function exterminator() {
    if (!gIsFirstClick || !gGame.isOn || gTimeout || !gExterminator) { 
        console.log('game isnt on')
        return
    }
    const mines = findAllNotShownMines()
    shuffleMines(mines)

    var rndMines = []
    rndMines = chooseRndMines(mines)

    setIsNotMineOnBoard(rndMines)
    setMinesNegsCount(gBoard)
    
    renderBoard2(gBoard)
    gExterminator = !gExterminator

    document.querySelector('.exterminator-icon').style.backgroundColor = 'yellow'
    gTimeout = setTimeout(() => {
        document.querySelector('.exterminator-icon').style.backgroundColor = ''
        gTimeout = null
    }, 500)
}

function findAllNotShownMines() {
    const mines = []

    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine && !cell.isShown) {
                const currMine = { i: i , j : j }
                mines.push(currMine)
            }
        }
    }

    return mines
}

function shuffleMines(mines) {
    for (var i = 0; i < mines.length - 1; i++) {
        const randIdx = getRandomInt(i, mines.length - 1) 
        const temp = mines[randIdx]
        mines[randIdx] = mines[i]
        mines[i] = temp
    }

}

function chooseRndMines(mines) {
    var minLength = mines.length > 3 ? 3 : mines.length
    var rndMines = []

    while (minLength > 0) {
        const randIdx = getRandomInt(0, mines.length)
        rndMines.push(mines[randIdx])
        mines.splice(randIdx, 1)[0]
        minLength--
    }

    return rndMines
}

function setIsNotMineOnBoard(mines) {
    for (var i = 0; i < mines.length; i++) {
        cell = mines[i]
        gBoard[cell.i][cell.j].isMine = false
        gMines--
        gGame.currMines--
    }
    updateRemainMinesDisplay
}


function safeClick() {
    if (gSafeClicks <= 0 || !gGame.isOn || gTimeout) {
        console.log("No more safe clicks amigo. You're on your own.")
        return
    }
    if (!gIsFirstClick) {
        console.log("The game isn't even started. Click on any cell to start game.")
        return
    }
    
    document.querySelector('.safe-click-icon').style.backgroundColor = 'yellow'

    const safeCell = findSafeCell()
    if (!safeCell) return

    displaySafeCell(safeCell)
}

function findSafeCell() {
    var safeCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (!cell.isShown && !cell.isMine) {
                const safeCell = { i: i , j : j }
                safeCells.push(safeCell)
            }
        }
    }

    return safeCells[getRandomInt(0, safeCells.length)]
}

function displaySafeCell(cell) {
    const prevBoard = deepCopyBoard(gBoard)
    const elCell = getElementByIndx(cell.i, cell.j) 
    
    elCell.classList.add('safeCell')
    elCell.innerText = '👍'

    gTimeout = setTimeout(() => {
        elCell.innerText = ''
        elCell.classList.remove('safeCell')
        const gBoard = deepCopyBoard(prevBoard)
        document.querySelector('.safe-click-icon').style.backgroundColor = ''
        gTimeout = null
    }, 1000)

    gSafeClickIsEnabled = !gSafeClickIsEnabled
    gSafeClicks--
    setInnerText('safe-click', gSafeClicks)
}

function getHintClick() {
    if (!gIsFirstClick || gHints <= 0 || gTimeout || !gGame.isOn || gMega.isEnabled) return

    gHintIsEnabled = !gHintIsEnabled
    if (gHintIsEnabled) {
        document.querySelector('.control-icon').style.backgroundColor = 'yellow'
    } else {
        document.querySelector('.control-icon').style.backgroundColor = ''
    }
}

function revealHint(elCell, i, j) {
    if (!gIsFirstClick || gHints <= 0 || gTimeout) return
    
    const prevBoard = deepCopyBoard(gBoard)
   
    revealsNegs(gBoard, elCell, i, j)
    
    gHints--

    gTimeout = setTimeout(() => {
        gBoard = deepCopyBoard(prevBoard)
        renderBoard2(gBoard)
        
        document.querySelector('.control-icon').style.backgroundColor = ''
        setInnerText('hints', gHints)
        gHintIsEnabled = !gHintIsEnabled

        gTimeout = null
    }, 1000)  
}

function revealsNegs(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            const cell = gBoard[i][j]

            cell.isShown = true
        }
    }
    renderBoard2(gBoard)
}

function deepCopyBoard(originalBoard) {
    const copiedBoard = []

    for (var i = 0; i < originalBoard.length; i++) {
        copiedBoard.push([]);
        for (var j = 0; j < originalBoard[i].length; j++) {
            const currCell = originalBoard[i][j]
            const newCell = createCell()
            newCell.isMarked = currCell.isMarked
            newCell.isMine = currCell.isMine
            newCell.isShown = currCell.isShown
            newCell.minesAroundCount = currCell.minesAroundCount
            copiedBoard[i][j] = newCell
        }
    }

    return copiedBoard
}

function rollBackBackOneStep() {
    if (!gRollbackBoard || gRollbackBoard.length === 0 || gTimeout) return
    gBoard = deepCopyBoard(gRollbackBoard.pop())
    renderBoard2(gBoard)
    
    document.querySelector('.undo-icon').style.backgroundColor = 'yellow'
    setTimeout(() => {
        document.querySelector('.undo-icon').style.backgroundColor = ''
        gTimeout = null
    }, 500) 
}

function fullExpansion (cellI, cellJ) {
    var negs = []
    const cell = gBoard[cellI][cellJ]

    if (cell.isMine || cell.isShown || cell.isMarked) return
    else if (cell.minesAroundCount > 0) {
        setClickedAndPrintOnBoard(cellI, cellJ)
        return
    }
    else if (cell.minesAroundCount === 0) {
        setClickedAndPrintOnBoard(cellI, cellJ)
        negs = getNegs(cellI, cellJ)
        for (var i = 0; i < negs.length; i++) {
            const currCell = negs[i]
            fullExpansion(currCell.i, currCell.j)
        }
    }
}

function getNegs(cellI, cellJ) {
    var nums = []
    
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            
            const cell = { i:i, j:j}
            nums.push(cell)
        } 
    }
    return nums
}


function onMegaHintClick() {
    if (!gGame.isOn || !gHints || gHintIsEnabled || !gIsFirstClick) return
    
    gMega.isEnabled = !gMega.isEnabled
    if (gMega.isEnabled) {
        document.querySelector('.mega-hint-icon').style.backgroundColor = 'yellow'
    } else {
        document.querySelector('.mega-hint-icon').style.backgroundColor = ''
    }
}


function megaHint(Pos) {
    const prevBoard = deepCopyBoard(gBoard)

    const startI = Math.min(Pos[0].i, Pos[1].i)
    const endI = Math.max(Pos[1].i, Pos[1].i)
    const startJ = Math.min(Pos[0].j, Pos[1].j)
    const endJ = Math.max(Pos[0].j, Pos[1].j)

    for (var i = startI; i <= endI; i++) {
        for (var j = startJ; j <= endJ; j++) {
            const cell = gBoard[i][j]
            cell.isShown = true
        }
    }

    gTimeout = setTimeout(() => {
        gBoard = deepCopyBoard(prevBoard)
        renderBoard2(gBoard)
        gTimeout = null
    }, 1500)
    renderBoard2(gBoard)
    document.querySelector('.mega-hint-icon').style.backgroundColor = ''
}

function darkModeToggle() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}

