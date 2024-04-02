async function main () {
  try {
      const buttonStart = document.querySelector('#buttonStart')
      const buttonStop = document.querySelector('#buttonStop')
      const audio = document.querySelector('#audio')
      const buttonGetPermission = document.querySelector('#buttonGetPermission')
      // const stream = new MediaStream();
      const buttonPause = document.querySelector('#buttonPause')
      const buttonResume = document.querySelector('#buttonResume')
      const title_h1 = document.querySelector('#this_title')

      const stream = await navigator.mediaDevices.getUserMedia({ // <1>
        video: false,
        audio: true,
      })
      // buttonGetPermission.addEventListener('click',async event=>{
      //   stream = await navigator.mediaDevices.getUserMedia({ // <1>
      //       video: false,
      //       audio: true,
      //     })
      // })
      // // async function getPermissions() {
        
      // }
      
      
      
      const [track] = stream.getAudioTracks()
      const settings = track.getSettings() // <2>

      const audioContext = new AudioContext() 
      await audioContext.audioWorklet.addModule('audio-recorder.js') // <3>

      const mediaStreamSource = audioContext.createMediaStreamSource(stream) // <4>
      const audioRecorder = new AudioWorkletNode(audioContext, 'audio-recorder') // <5>
      const buffers = []

      audioRecorder.port.addEventListener('message', event => { // <6>
        buffers.push(event.data.buffer)
      })
      audioRecorder.port.start() // <7>

      mediaStreamSource.connect(audioRecorder) // <8>
      audioRecorder.connect(audioContext.destination)

      buttonStart.addEventListener('click', event => {
        buttonStart.setAttribute('disabled', 'disabled')
        buttonStop.removeAttribute('disabled')
        title_h1.textContent = 'Recording On'
        const parameter = audioRecorder.parameters.get('isRecording')
        parameter.setValueAtTime(1, audioContext.currentTime) // <9>

        buffers.splice(0, buffers.length)
      })

      buttonStop.addEventListener('click', event => {
        buttonStop.setAttribute('disabled', 'disabled')
        buttonStart.removeAttribute('disabled')
        title_h1.textContent = 'Recording Off'
        const parameter = audioRecorder.parameters.get('isRecording')
        parameter.setValueAtTime(0, audioContext.currentTime) // <10>

        const blob = encodeAudio(buffers, settings) // <11>
        const url = URL.createObjectURL(blob)

        audio.src = url
      })
      buttonPause.addEventListener('click', event =>{
        buttonPause.setAttribute('disabled', 'disabled')
        buttonResume.removeAttribute('disabled')
        title_h1.textContent = 'Recording Pause'
        const parameter = audioRecorder.parameters.get('isPaused')
        parameter.setValueAtTime(1, audioContext.currentTime) 
        console.log("Pause")
      })
      buttonResume.addEventListener('click', event =>{
        buttonResume.setAttribute('disabled', 'disabled')
        buttonPause.removeAttribute('disabled')
        title_h1.textContent = 'Recording On'
        const parameter = audioRecorder.parameters.get('isPaused')
        parameter.setValueAtTime(0, audioContext.currentTime) 
        console.log("Resume")
      })
  } catch (err) {
    console.error(err)
  }
}

main()