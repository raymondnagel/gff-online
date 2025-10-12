from midiutil import MIDIFile
import random

midi = MIDIFile(1)
track = 0
midi.addTrackName(track, 0, "Stronghold Dark Funk + Lead")
midi.addTempo(track, 0, 92)

# Channels
BASS, DRUMS, ORGAN, LEAD = 1, 9, 2, 3
bars = 16

# --- Bassline (steady groove)
bass_pattern = [
    (50, 0), (50, 0.5), (53, 1.0), (50, 1.5),
    (57, 2.0), (55, 2.5), (53, 3.0), (50, 3.5)
]
for i in range(bars):
    offset = i * 4
    for note, beat in bass_pattern:
        midi.addNote(track, BASS, note, offset + beat, 0.45, 95)

# --- Drums (tight funk pattern)
for i in range(bars):
    bar_start = i * 4
    midi.addNote(track, DRUMS, 36, bar_start, 0.25, 110)      # kick
    midi.addNote(track, DRUMS, 38, bar_start + 2, 0.25, 100)  # snare
    midi.addNote(track, DRUMS, 36, bar_start + 1.5, 0.25, 90)
    midi.addNote(track, DRUMS, 36, bar_start + 3.5, 0.25, 85)
    for j in [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]:
        midi.addNote(track, DRUMS, 42, bar_start + j, 0.25, 70)

# --- Organ chords (dark stabs)
chords = [(50, 53, 57), (48, 52, 55), (53, 57, 60), (50, 53, 57)]
for i in range(bars):
    chord = chords[i % len(chords)]
    start = i * 4
    if i % 2 == 0:
        for n in chord:
            midi.addNote(track, ORGAN, n + 12, start, 1.0, 75)

# --- Lead Synth (sly melodic motion)
lead_scale = [62, 63, 65, 67, 69, 70, 72]  # D Dorian-ish
phrases = [
    [62, 65, 67, 65, 63, 62, 65, 67],
    [67, 69, 70, 69, 67, 65, 63, 62],
    [65, 67, 69, 67, 65, 63, 62, 60],
]
for i in range(bars):
    phrase = phrases[i % len(phrases)]
    start = i * 4
    for j, note in enumerate(phrase):
        duration = random.choice([0.25, 0.5])
        velocity = random.randint(70, 100)
        midi.addNote(track, LEAD, note + 12, start + j * 0.5, duration, velocity)

with open("stronghold_darkfunk_lead.mid", "wb") as f:
    midi.writeFile(f)

print("Created 'stronghold_darkfunk_lead.mid' — structured groove with a mischievous synth lead.")
