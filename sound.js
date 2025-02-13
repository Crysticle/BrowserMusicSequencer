import {getMidiData} from "./grid.js"

export const beatsPerMeasure = 120
export const tilesPerBeat = 4
const playButton = document.getElementById('play-button')

function cancelPlayback() {
    Tone.Transport.stop()
    Tone.Transport.cancel()
}

function startPlayback(synth, sortedMidiData) {
    const noteTimeGroups = Object.keys(sortedMidiData)

    for (let i = 0; i < noteTimeGroups.length; i++) {
        const noteTime = noteTimeGroups[i]
        const notePitch = sortedMidiData[noteTime]

        // Schedule those notes to play at the specified times.
        Tone.Transport.schedule(
            function(event) {
                synth.triggerAttackRelease(notePitch, "8n", event, 0.6)
            },
            noteTime
        )
    }

    Tone.Transport.bpm.value = beatsPerMeasure * tilesPerBeat
    Tone.Transport.start()
}

// Play the user's music when the play button is clicked.
playButton.addEventListener("click", async () => {
    await Tone.start()
    const synth = new Tone.PolySynth(Tone.Synth).toDestination()
    synth.maxPolyphony = 64

    // Get the midi data from the "grid.js" script.
    const notes = getMidiData().notes

    // Stop any playback that might be playing at the time.
    cancelPlayback()

    // Sort midi data by time.
    let sortedMidiData = {}

    if (notes) {
        for (let i = 0; i < notes.length; i++) {
            const noteTime = notes[i].time
            const notePitch = notes[i].note

            // If the timeframe doesn't exist, create an array for it.
            if (!sortedMidiData[noteTime]) {
                sortedMidiData[noteTime] = []
            }

            // Add the note to the array of the correct timeframe.
            sortedMidiData[noteTime].push(notePitch)
        }
    }

    startPlayback(synth, sortedMidiData)
})