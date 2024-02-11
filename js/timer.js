var gTimerInterval

function startTimer() {
    var startTime = Date.now()

    gTimerInterval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = currentTime - startTime

        const seconds = Math.floor(elapsedTime / 1000);

        gGame.secsPassed = seconds
        document.querySelector('.timer').innerText = seconds;

    }, 1000)
}

function stopTimer() {
    clearInterval(gTimerInterval)
} 

function clearTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.timer').innerText = '0'
}