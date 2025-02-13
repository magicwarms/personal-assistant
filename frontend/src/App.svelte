<script lang="ts">
  import VoiceInput from './lib/VoiceInput.svelte';
</script>

<main class="min-h-screen bg-black p-4">
  <div class="max-w-md mx-auto p-6">
    <div class="text-center mb-4">
      <p class="text-sm text-gray-400">I can search new contacts</p>
    </div>
    
    <h1 class="text-4xl font-bold text-center mb-12 text-[#00FF94]">
      What Can I Do for<br />You Today?
    </h1>

    <div class="mb-12">
      <VoiceInput />
    </div>

    <div class="flex justify-center space-x-8">
      <button class="p-3 rounded-full border border-[#00FF94]/20 hover:border-[#00FF94]/40 transition-colors">
        <svg class="w-6 h-6 text-[#00FF94]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </button>
      <button class="p-3 rounded-full border border-[#00FF94]/20 hover:border-[#00FF94]/40 transition-colors">
        <svg class="w-6 h-6 text-[#00FF94]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button class="p-3 rounded-full border border-[#00FF94]/20 hover:border-[#00FF94]/40 transition-colors">
        <svg class="w-6 h-6 text-[#00FF94]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>