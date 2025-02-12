const grid = document.getElementById('grid')
const synth = new Tone.PolySynth(Tone.Synth).toDestination()
const tileSize = 40

// Note data is stored in this array as the user places more notes.
let midiData = {}

// Note coordinates are stored in this array as the user places more notes.
let coordinates = []

// This is an array of all the possible notes that can be played.
let pitches = [
    "B5", "A5", "G5", "F5", "E5", "D5", "C5",
    "B4", "A4", "G4", "F4", "E4", "D4", "C4",
    "B3", "A3", "G3", "F3", "E3", "D3", "C3",
]

// Boolean value for monitoring whether Tone is running or not.
let isToneRunning = false
Tone.Transport.on("start", () => {isToneRunning = true})
Tone.Transport.on("stop", () => {isToneRunning = false})

let isMouseDown = false
let isEraseModeOn = false

function roundCoordinates(x, y) {
    const snappedX = Math.floor(x / tileSize) * tileSize
    const snappedY = Math.floor(y / tileSize) * tileSize
    return [snappedX, snappedY]
}

export function checkForExistingTile(x, y) {
    return document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`)
}

function deleteTile(x, y) {
    for (let i = 0; i < coordinates.length; i++) {
        if (coordinates[i][0] === x) {
            if (coordinates[i][1] === y) {
                coordinates.splice(i, 1)
            }
        }
    }
    if (checkForExistingTile(x, y)) {
        checkForExistingTile(x, y).remove()
    }
}

function createTile(x, y) {
    // Trigger sound feedback on tile creation.
    synth.triggerAttackRelease(pitches[y / 40], "8n", undefined, 0.6)

    // Add the tile's position to the array of coordinates.
    coordinates.push([x, y])

    // Create the tile.
    const tile = document.createElement("div")
    tile.className = "tile"
    tile.style.setProperty("--original-colour", `hsl(${(6-(y/40))*(360/7)}, 70%, 50%)`)
    tile.style.left = `${x}px`
    tile.style.top = `${y}px`
    tile.dataset.x = x
    tile.dataset.y = y
    grid.appendChild(tile)
}

// Update midi data to current coordinates.
function updateMidi() {
    midiData = {
        "notes": []
    }

    for (let i = 0; i < coordinates.length; i++) {
        // Calculate the tile's location, converting from pixels to how many tiles away it is from the left or right.
        const relativeX = coordinates[i][0] / 40
        const relativeY = coordinates[i][1] / 40

        // Use the tile's relative position to calculate its beat and measure and pitch.
        const measure = Math.floor((relativeX) / 4)
        const beat = (relativeX) % 4
        const pitch = pitches[relativeY]

        midiData.notes.push(
            {"time": `${measure}:${beat}`, "note": `${pitch}`, "duration": "4n"}
        )
    }
}

// Allow other scripts to get access to the current midi data.
export function getMidiData() {
    return midiData
}

function toggleTile(x, y) {
    const existingTile = checkForExistingTile(x, y)

    // Placement mode: Create the tile if it doesn't exist already.
    // Erase mode: Delete the tile if it does exist.
    if ((existingTile && isEraseModeOn) || isEraseModeOn) {
        deleteTile(x, y)
        updateMidi()
    } else if (!existingTile) {
        createTile(x, y)
        updateMidi()
    }
}

// Return the exact coordinates of the user's mouse on the grid.
function getGridCoordinates(e) {
    const rect = grid.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    return roundCoordinates(mouseX, mouseY)
}

grid.addEventListener('mousedown', (e) => {
    // User starts mousedown on empty tile = Placement mode
    // User starts mousedown on existing tile = Erase mode
    if (!isToneRunning) {
        const location = getGridCoordinates(e)
        const existingTile = document.querySelector(`.tile[data-x="${location[0]}"][data-y="${location[1]}"]`)
        isEraseModeOn = !!existingTile;
        isMouseDown = true
        updateTile(e)
    }
})

// Allow the user to drag to place or erase.
grid.addEventListener('mousemove', (e) => {
    if (isMouseDown && !isToneRunning) {
        updateTile(e)
    }
})

grid.addEventListener('mouseup', () => {
    isMouseDown = false
})

// Render the tiles according to user input.
function updateTile(e) {
    const gridCoordinates = getGridCoordinates(e)
    toggleTile(gridCoordinates[0], gridCoordinates[1])
}