# Melato Sound Radio

**Melato Sound Radio** is a programmable online radio concept for Melato: music-first programming with occasional Melato fashion announcements, football/soccer segments, podcast-style audio, cultural commentary, and short-form recap segments.

The first target is a **12-hour daily station**, designed from day one so it can expand to 24/7.

## Product idea

Melato Sound Radio should feel like a real curated station, not a shuffle button.

Programming can include:

- Curated music rotation managed by Melato
- Station IDs, bumpers, sweepers, and transitions
- Melato fashion/news announcements
- Football/soccer recaps and commentary
- Short podcast or editorial segments
- Replays/recaps adapted from Melato short-form content
- Scheduled themed blocks and special programming

## MVP architecture

We should **not build the broadcasting engine from scratch**.

Recommended stack:

1. **AzuraCast** for station/media management, playlists, scheduling, public API, live DJ access, and operational controls.
2. **Liquidsoap** as the AutoDJ/programming engine underneath AzuraCast.
3. **Icecast** as the listener-facing broadcast stream.
4. **Melato Radio web player** as a lightweight custom frontend that can later be embedded or linked from melato.ca.
5. **Small application service** for Melato-specific scheduling logic, content ingestion, automation, analytics, and future taste intelligence.

## Spotify boundary

Spotify can be useful as a **curation signal**, but Spotify audio must not be rebroadcast through Melato Sound Radio.

The future integration should therefore work like this:

- Read a Melato-owned Spotify playlist as a source of track metadata/curation intent where permitted.
- Match those selections against music that Melato is independently licensed and technically authorized to broadcast.
- Add the independently sourced/authorized audio into the Melato Radio catalog and schedule.
- Never proxy, capture, rebroadcast, mix, or restream Spotify audio.

Spotify should not be used to train the future Melato recommendation model. Taste learning should be based on Melato Radio's own first-party signals such as manual adds, approvals, rejections, skips in the admin workflow, ratings, and programming decisions.

## Programming model

A future schedule can treat content as typed blocks:

- `music`
- `station_id`
- `melato_update`
- `football`
- `podcast`
- `culture`
- `short_recap`
- `special`

Example 12-hour structure:

| Time | Block |
| --- | --- |
| 12:00-15:00 | General music rotation + station IDs |
| 15:00-15:10 | Melato update |
| 15:10-18:00 | Music rotation |
| 18:00-18:15 | Football/culture segment |
| 18:15-21:00 | Music rotation |
| 21:00-21:20 | Podcast/editorial block |
| 21:20-00:00 | Evening music rotation + occasional recaps |

Actual hours remain configurable.

## Future intelligence layer

The recommendation system should begin as an explainable ranking engine rather than an opaque model.

Possible first-party signals:

- Artist affinity
- Genre/subgenre affinity
- Era and region
- Tempo/energy preferences
- Explicit manual approvals/rejections
- Frequency limits
- Recency/new-release preference
- Time-of-day fit
- Repetition penalties
- Existing station rotation balance

A candidate track can receive a score and stay in a **review queue** until confidence becomes high enough for optional automatic scheduling.

Human correction is part of the design: approve, reject, blacklist, reduce rotation, increase rotation, or mark an artist/track as a strong preference.

## Licensing and launch boundary

A public internet radio station playing commercial recordings requires music rights/licensing. For a Canadian operation this can involve multiple rights and collectives, including performing, communication, sound-recording, and reproduction rights.

**Prototype rule:** until the required rights are confirmed, development/testing should use music Melato controls, properly licensed production-library music, public-domain/CC material whose terms permit the intended use, or other audio explicitly cleared for broadcast.

This repository is software, not a substitute for rights clearance.

## MVP phases

### Phase 0 - Foundation

- [ ] Confirm branding: Melato Sound Radio
- [ ] Define initial 12-hour programming window
- [ ] Define content categories and rotation rules
- [ ] Establish cleared prototype audio library

### Phase 1 - Working station

- [ ] Deploy AzuraCast
- [ ] Configure AutoDJ + Icecast stream
- [ ] Create playlists and schedules
- [ ] Add station IDs/announcements
- [ ] Verify uninterrupted playback and metadata

### Phase 2 - Melato player

- [ ] Build responsive web player
- [ ] Live now-playing title/artist/artwork metadata
- [ ] Play/pause + volume
- [ ] Program/show label
- [ ] Recent tracks/program history
- [ ] Mobile-first layout
- [ ] Link or embed from melato.ca

### Phase 3 - Automation

- [ ] Admin content ingestion workflow
- [ ] Scheduled Melato/fashion segments
- [ ] Football/culture recap ingestion
- [ ] Podcast/editorial scheduling
- [ ] Rotation rules and guardrails

### Phase 4 - Taste engine

- [ ] First-party preference profile
- [ ] Candidate-track scoring
- [ ] Review/approve/reject queue
- [ ] New-release discovery from compliant metadata sources
- [ ] Confidence thresholds for optional auto-scheduling

### Phase 5 - Spotify-assisted curation

- [ ] OAuth connection
- [ ] Read selected playlist metadata where permitted
- [ ] Detect additions/removals
- [ ] Match against independently authorized radio catalog
- [ ] Never use Spotify audio as the station stream

## Initial repository direction

The codebase should remain small at first. The broadcasting stack should live in infrastructure/configuration, while the custom application focuses on the things that make the station uniquely Melato: programming, player experience, editorial content, automation, and taste intelligence.
