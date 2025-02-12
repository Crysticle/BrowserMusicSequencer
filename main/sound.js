import "./grid.js"

// Midi data stored here for Tone.js to read.
const midi_data = {
    "tracks": [
        {
            "notes": []
        }
    ]
}

// Initialize button info.
const play_button = document.getElementById('play-button')

// Play music from the midi data collected.
play_button.addEventListener("click", async () => {
    await Tone.start()
    console.log("Started!")

    const synth = new Tone.PolySynth(Tone.Synth).toDestination()
    synth.maxPolyphony = 128

    const notes = midi_data.tracks[0].notes

    Tone.Transport.stop()
    Tone.Transport.cancel()

    let sorted_midi_data = {}
    for (let i = 0; i < notes.length; i++) {
        if (!sorted_midi_data[notes[i].time]) {
            sorted_midi_data[notes[i].time] = []
        }
        sorted_midi_data[notes[i].time].push({
            note: notes[i].note,
            duration: notes[i].duration
        })
    }

    // For every time like 1:3 in our midi data...
    for (let i = 0; i < Object.keys(sorted_midi_data).length; i++) {

        let pitches = []
        let durations = []

        // For every note in our midi data...
        for (let j = 0; j < Object.keys(sorted_midi_data[Object.keys(sorted_midi_data)[i]]).length; j++) {
            pitches.push(sorted_midi_data[Object.keys(sorted_midi_data)[i]][j].note)
            durations.push(sorted_midi_data[Object.keys(sorted_midi_data)[i]][j].duration)
        }

        Tone.Transport.schedule(
            function(event) {
                synth.triggerAttackRelease(pitches, durations[0], event, 0.8)
            },
            Object.keys(sorted_midi_data)[i]
        )
    }

    Tone.Transport.bpm.value = 240;
    Tone.Transport.start();
});