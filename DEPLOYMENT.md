# Phase 1 deployment

The web player is a static site. The broadcast backend is intentionally separate.

## 1. Configure the player

Edit `config.js`:

```js
window.MELATO_RADIO_CONFIG = {
  stationName: "Melato Sound Radio",
  stationShortcode: "melato_sound_radio",
  azuraCastBaseUrl: "https://radio.example.com",
  fallbackStreamUrl: "",
  refreshIntervalMs: 15000,
  defaultProgram: {
    name: "The Melato Frequency",
    description: "Music first. Fashion, football, culture and short transmissions between rotations."
  }
};
```

The player requests:

`https://radio.example.com/api/nowplaying/melato_sound_radio`

and uses `station.listen_url` from that response as the stream URL. `fallbackStreamUrl` is only needed when the station metadata endpoint cannot provide a listener URL.

## 2. AzuraCast backend

Run AzuraCast on a Docker-capable VPS or server. Do not deploy AzuraCast itself to a static/serverless frontend host.

Recommended initial station configuration:

- station shortcode: `melato_sound_radio`
- frontend: Icecast
- AutoDJ: enabled
- primary mount: MP3/AAC-compatible stream for broad mobile/browser support
- public station: enabled
- song history: enabled
- HTTPS: required before embedding on `melato.ca`

Create these playlist/programming buckets:

- `music_rotation`
- `station_ids`
- `melato_updates`
- `football_culture`
- `podcast_editorial`
- `short_recaps`
- `specials`

For the first prototype, only upload/broadcast audio that is cleared for the intended use.

## 3. Hosting the player

Because the player is static, it can be hosted on:

- Vercel
- GitHub Pages
- Netlify
- the Melato Shopify theme/assets later

For the prototype, keep the player standalone. Integration into `melato.ca` should happen only after the broadcast endpoint is stable.

## 4. Smoke test

After setting `azuraCastBaseUrl`:

1. Open the player on a phone.
2. Verify the badge changes from `PREVIEW` to `LIVE`.
3. Verify title, artist and artwork update from AzuraCast.
4. Press play and confirm audio starts after the user gesture.
5. Lock the phone and verify media-session metadata appears where supported.
6. Leave the page open through a track transition and verify metadata refreshes without reloading.

## 5. Production gate

Before enabling commercial recordings publicly, confirm applicable music rights/licensing and reporting requirements for the intended territories and service model.
