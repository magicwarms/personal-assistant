<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { processUserInput } from './socket';
  import socket from './socket';

  let isListening = false;
  let showKeyboard = false;
  let userInput = '';
  let response = '';
  let recognition: SpeechRecognition | null = null;
  let isConnected = false;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array;
  let animationFrame: number;
  let voiceIntensity = 0;

  // Handle socket connection status
  function handleConnection() {
    isConnected = true;
  }

  function handleDisconnection() {
    isConnected = false;
  }

  async function setupAudioAnalysis() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  }

  function updateVoiceIntensity() {
    if (!analyser || !isListening) return;
    
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    voiceIntensity = average / 128; // Normalize to 0-1 range
    
    animationFrame = requestAnimationFrame(updateVoiceIntensity);
  }

  onMount(async () => {
    // Set up WebSocket event listeners
    socket.on('connect', handleConnection);
    socket.on('disconnect', handleDisconnection);
    isConnected = socket.connected;

    await setupAudioAnalysis();

    // Set up speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        userInput = transcript;
        await processInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        cancelAnimationFrame(animationFrame);
      };

      recognition.onend = () => {
        isListening = false;
        cancelAnimationFrame(animationFrame);
      };
    }
  });

  onDestroy(() => {
    // Clean up WebSocket event listeners
    socket.off('connect', handleConnection);
    socket.off('disconnect', handleDisconnection);
    
    // Clean up audio context
    if (audioContext) {
      audioContext.close();
    }
    
    // Clean up animation frame
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });

  async function toggleVoiceInput() {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (!isConnected) {
      alert('Not connected to the server. Please try again later.');
      return;
    }

    if (!isListening) {
      try {
        await recognition.start();
        isListening = true;
        updateVoiceIntensity();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else {
      recognition.stop();
      isListening = false;
      cancelAnimationFrame(animationFrame);
    }
  }

  function toggleKeyboard() {
    showKeyboard = !showKeyboard;
    if (!showKeyboard) {
      userInput = '';
    }
  }

  async function processInput(input: string) {
    if (!input.trim() || !isConnected) return;
    
    try {
      response = await processUserInput(input);
    } catch (error) {
      console.error('Error:', error);
      response = "Sorry, I couldn't process your request.";
    }
  }

  async function handleSubmit() {
    if (!isConnected) {
      alert('Not connected to the server. Please try again later.');
      return;
    }
    await processInput(userInput);
    userInput = '';
  }

  $: orbClass = isListening ? 'voice-orb listening' : 'voice-orb';
  $: connectionStatus = isConnected ? 'Connected' : 'Disconnected';
  $: orbStyle = isListening ? `--intensity: ${voiceIntensity}` : '';
</script>

<div class="text-center mb-2">
  <span class={isConnected ? 'text-[#00FF94]' : 'text-red-500'}>
    {connectionStatus}
  </span>
</div>

<div class={orbClass} on:click={toggleVoiceInput} style={orbStyle}>
  <div class="voice-ring"></div>
  <div class="voice-ring voice-ring-2"></div>
  <div class="voice-ring voice-ring-3"></div>
  {#if isListening}
    <div class="pulse-rings">
      <div class="pulse-ring"></div>
      <div class="pulse-ring"></div>
      <div class="pulse-ring"></div>
    </div>
  {/if}
</div>

{#if response}
  <div class="mt-6 p-4 rounded-lg bg-[#00FF94]/10 text-[#00FF94]">
    {response}
  </div>
{/if}

<div class="text-center mt-8">
  <button 
    class="text-sm text-gray-400 flex items-center justify-center gap-2 mx-auto hover:text-gray-300 transition-colors"
    on:click={toggleKeyboard}
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m0-16l4 4m-4-4l-4 4" />
    </svg>
    Use Keyboard
  </button>
</div>

{#if showKeyboard}
  <div class="mt-4 flex gap-2">
    <input
      type="text"
      bind:value={userInput}
      placeholder="Type your message..."
      class="flex-1 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF94]/40"
      on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
    />
    <button
      on:click={handleSubmit}
      class="px-4 py-2 bg-[#00FF94]/20 text-[#00FF94] rounded-lg hover:bg-[#00FF94]/30 transition-colors"
    >
      Send
    </button>
  </div>
{/if}

<style>
  .voice-orb {
    --intensity: 0;
  }

  .listening .voice-ring {
    animation: rotate 2s linear infinite, pulse 1s ease-in-out infinite;
  }

  .pulse-rings {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pulse-ring {
    position: absolute;
    border: 2px solid var(--glow-color);
    border-radius: 50%;
    animation: pulseOut 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    opacity: 0;
  }

  .pulse-ring:nth-child(1) {
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    animation-delay: 0s;
  }

  .pulse-ring:nth-child(2) {
    width: calc(100% + 40px);
    height: calc(100% + 40px);
    animation-delay: 0.5s;
  }

  .pulse-ring:nth-child(3) {
    width: calc(100% + 60px);
    height: calc(100% + 60px);
    animation-delay: 1s;
  }

  @keyframes pulseOut {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.5;
      transform: scale(calc(1 + var(--intensity) * 0.2));
    }
    50% {
      opacity: 1;
      transform: scale(calc(1.1 + var(--intensity) * 0.3));
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg) scale(calc(1 + var(--intensity) * 0.1));
    }
    to {
      transform: rotate(360deg) scale(calc(1.1 + var(--intensity) * 0.2));
    }
  }
</style>