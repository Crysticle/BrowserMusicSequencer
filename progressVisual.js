import {checkForExistingTile} from "./grid.js"
import {beatsPerMeasure, tilesPerBeat} from "./sound.js"

const beatDuration = 60000 / (beatsPerMeasure * tilesPerBeat)
const grid = document.getElementById("grid")
const playButton = document.getElementById("play-button")
const stopButton = document.getElementById("stop-button")

// Declares progressLoop as a global variable so that the loop can be referenced outside its function's scope.
let progressLoop

function createNewPlayhead() {
    const playhead = document.getElementById("progress-bar").cloneNode(true)
    playhead.style.opacity = 0.05
    playhead.classList.add("active-progress-bar")
    grid.appendChild(playhead)
    return playhead
}

function blinkTiles(progress) {
    for (let i = 0; i < 21; i++) {
        // Checks if a tile exists at the specified location.
        let tile = checkForExistingTile(progress, i * 40)

        // If the tile does exist, make it blink.
        if (tile) {
            tile.classList.remove("tile-blink")

            // Cause the browser to finish running the animation first before moving on to removing the animation.
            void tile.offsetWidth

            tile.classList.add("tile-blink")
        }
    }
}

function deleteExistingPlayhead() {
    document.querySelector(".active-progress-bar").remove()
    clearInterval(progressLoop)
}

// Start visualizing the notes being played when the play button is clicked.
document.getElementById("play-button").addEventListener("click", () => {
    // Switch the play button into a stop button.
    stopButton.className = "fa fa-stop-circle"
    playButton.className = "invisible"

    // Reset the playhead.
    const playhead = createNewPlayhead()
    let progress = 0

    // Blink the tiles at the start.
    blinkTiles(progress)

    // Every beat (well, technically every fourth of a beat) progress the playhead.
    progressLoop = setInterval(() => {
        // Move the playhead 40 pixels to the right.
        progress += 40;
        playhead.style.left = `${progress}px`

        // Blink all the tiles at the playhead.
        blinkTiles(progress)
    }, beatDuration)
})

// Stop visualizing the notes being played when the play button is clicked.
document.getElementById("stop-button").addEventListener("click", () => {
    // Switch the stop button into a play button.
    stopButton.className = "invisible"
    playButton.className = "fa fa-play-circle"

    // Stop the sound
    Tone.Transport.stop()

    deleteExistingPlayhead()
})
