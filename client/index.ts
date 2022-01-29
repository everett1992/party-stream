import { TimingObject } from 'timing-object'
import { setTimingsrc } from 'timingsrc'
import { SocketMessage } from '#common/types'

document.addEventListener('readystatechange', () => {
  const url = new URL(document.location.toString())
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = 'ws'
  const socket = new WebSocket(url.toString())

  const player =
    document.getElementById('player') as HTMLDivElement
  const join =
    document.getElementById('join') as HTMLDivElement
  const video =
    document.getElementById('video') as HTMLVideoElement
  const playpause =
    document.getElementById('playpause') as HTMLButtonElement
  const seek =
    document.getElementById('seek') as HTMLInputElement
  const volume =
    document.getElementById('volume') as HTMLInputElement
  const fullscreenButton =
    document.getElementById('fullscreen') as HTMLButtonElement

  const timingObject = new TimingObject()
  setTimingsrc(video, timingObject)

  // video updates UI

  video.addEventListener('play', () => playpause.textContent = 'pause')
  video.addEventListener('pause', () => playpause.textContent = 'play')
  video.addEventListener('timeupdate', () => {
    seek.value = ((100 / video.duration) * video.currentTime).toString()
  })
  video.addEventListener('volumechange', () => {
    volume.value = video.volume.toString()
  })

  // UI updates server

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      send({ vector: { velocity: video.paused ? 1 : 0 } })
    }
  })

  playpause.addEventListener('click', () => {
    send({ vector: { velocity: video.paused ? 1 : 0 } })
  })

  seek.addEventListener('change', () => {
    const position = video.duration * (Number(seek.value) / 100)
    send({ vector: { position } })
  })

  // UI updates the player

  join.addEventListener('click', () => {
    join.remove()
    player.classList.remove('blur')
    video.muted = false
  })

  fullscreenButton.addEventListener('click', () => {
    player.requestFullscreen()
  })

  volume.addEventListener('change', () => {
    video.volume = Number(volume.value)
  })

  // server updates video

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    console.debug('receive', message)
    timingObject.update(message)
  })

  function send (message: SocketMessage) {
    socket.send(JSON.stringify(message))
  }
})
