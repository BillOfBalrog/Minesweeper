var gTimerInterval

function startTimer() {
    var startTime = Date.now()

    gTimerInterval = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = currentTime - startTime

        const seconds = Math.floor(elapsedTime / 1000);

        gGame.secsPassed = seconds
        document.querySelector('.time-container .seconds').innerText = seconds;

    }, 1000)
}

function stopTimer() {
    clearInterval(gTimerInterval)
} 

function clearTimer() {
    clearInterval(gTimerInterval)
    document.querySelector('.time-container .seconds').innerText = '0'
}








// function startTimer() {
//     if (gTimerInterval) clearInterval(gTimerInterval)

//     var startTime = Date.now()

//     gTimerInterval = setInterval(() => {
//         const timeDiff = Date.now() - startTime

//         const minutes = getFormatMinutes(timeDiff);
//         const seconds = getFormatSeconds(timeDiff);
//         const milliSeconds = getFormatMilliSeconds(timeDiff);

//         document.querySelector('.time-container .minutes').innerText = minutes + ':'
//         document.querySelector('.time-container .seconds').innerText = seconds
//         document.querySelector('.time-container .milli-seconds').innerText = '.' + milliSeconds

//     }, 100)
// }

// function getFormatMinutes(timeDiff) {
//     const minutes = Math.floor(timeDiff / 60000)
//     return (minutes + '').padStart(2, '0')
// }

// function getFormatSeconds(timeDiff) {
//     const seconds = Math.floor((timeDiff % 60000) / 1000)
//     return (seconds + '').padStart(2, '0')
// }

// function getFormatMilliSeconds(timeDiff) {
//     const milliSeconds = new Date(timeDiff).getMilliseconds() % 1000
//     return (milliSeconds + '').padStart(3, '0')
// }

// function stopTimer() {
//     clearInterval(gTimerInterval)
// } 


// function clearTimer() {
//     document.querySelector('.time-container .minutes').innerText = ''
//     document.querySelector('.time-container .seconds').innerText = '0'
//     document.querySelector('.time-container .milli-seconds').innerText = ''
// } 


// function startTimerFull() {
//     var gTimerInterval = setInterval(() => {
//         const seconds = now.getSeconds().toString().padStart(2, '0')
//         document.querySelector('.time-container .seconds').innerText = formattedTime
//     }, 1000)
// }