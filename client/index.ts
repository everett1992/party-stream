import { TimingObject } from 'timing-object'
import { setTimingsrc } from 'timingsrc'

document.addEventListener('readystatechange', () => {
  const url = new URL(document.location.toString())
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.pathname = 'ws'
  const socket = new WebSocket(url.toString())

  const video = document.getElementsByTagName('video')[0]
  const playButton = document.getElementById('play')
  const pauseButton = document.getElementById('pause')
  const muteButton = document.getElementById('mute')
  const unmuteButton = document.getElementById('unmute')
  const fullscreenButton = document.getElementById('fullscreen')

  const timingObject = new TimingObject()
  setTimingsrc(video, timingObject)
  
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      return socket.send(video.paused ? 'play' : 'pause')
    }
  })
  socket.addEventListener('message', event => {
    timingObject.update(JSON.parse(event.data))
  })
  playButton.addEventListener('click', () => socket.send('play'))
  pauseButton.addEventListener('click', () => socket.send('pause'))
  fullscreenButton.addEventListener('click', () => video.requestFullscreen())
})
