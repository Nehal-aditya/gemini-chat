<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.8); backdrop-filter:blur(4px);"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-lg rounded-xl overflow-hidden animate-fade-in"
        style="background:#0a0a18; border:1px solid rgba(0,245,255,0.2); box-shadow:0 0 40px rgba(0,245,255,0.08), 0 0 80px rgba(191,0,255,0.04);"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4" style="border-bottom:1px solid rgba(0,245,255,0.08);">
          <div>
            <h2 class="font-display font-bold text-sm tracking-widest neon-text">SETTINGS</h2>
            <p class="text-xs font-mono mt-0.5" style="color:#304050;">Configure your AI parameters</p>
          </div>
          <button
            @click="$emit('close')"
            style="color:#405060;"
            @mouseenter="e => e.currentTarget.style.color='#ff4060'"
            @mouseleave="e => e.currentTarget.style.color='#405060'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto" style="max-height:70vh;">
          <!-- API Key -->
          <div class="mb-5">
            <label class="block text-xs font-mono font-bold mb-2 tracking-wider" style="color:#00f5ff;">API KEY</label>
            <div class="relative">
              <input
                :type="showKey ? 'text' : 'password'"
                v-model="localApiKey"
                placeholder="AIza..."
                class="w-full px-3 py-2.5 rounded text-xs font-mono chat-input"
                style="background:#06060d; border:1px solid rgba(0,245,255,0.15); color:#c8d8e8; letter-spacing:0.05em;"
              />
              <button
                @click="showKey = !showKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                style="color:#405060;"
              >
                {{ showKey ? 'HIDE' : 'SHOW' }}
              </button>
            </div>
            <p class="text-xs font-mono mt-1.5" style="color:#203040;">
              Get your key at <span class="neon-text">aistudio.google.com</span>
            </p>
          </div>

          <!-- Model selection moved to header, but show info here -->
          <div class="mb-5">
            <label class="block text-xs font-mono font-bold mb-2 tracking-wider" style="color:#00f5ff;">SYSTEM PROMPT</label>
            <textarea
              v-model="localSettings.systemPrompt"
              placeholder="You are a helpful AI assistant..."
              rows="3"
              class="w-full px-3 py-2.5 rounded text-xs font-mono chat-input resize-none"
              style="background:#06060d; border:1px solid rgba(0,245,255,0.15); color:#c8d8e8; line-height:1.6;"
            ></textarea>
          </div>

          <!-- Temperature -->
          <div class="mb-5">
            <div class="flex justify-between mb-2">
              <label class="text-xs font-mono font-bold tracking-wider" style="color:#00f5ff;">TEMPERATURE</label>
              <span class="text-xs font-mono neon-text">{{ localSettings.temperature.toFixed(1) }}</span>
            </div>
            <input
              type="range" min="0" max="2" step="0.1"
              v-model.number="localSettings.temperature"
              class="w-full accent-cyan-400"
              style="accent-color:#00f5ff;"
            />
            <div class="flex justify-between text-xs font-mono mt-1" style="color:#203040;">
              <span>PRECISE</span>
              <span>CREATIVE</span>
            </div>
          </div>

          <!-- Max Tokens -->
          <div class="mb-5">
            <div class="flex justify-between mb-2">
              <label class="text-xs font-mono font-bold tracking-wider" style="color:#00f5ff;">MAX TOKENS</label>
              <span class="text-xs font-mono neon-text">{{ localSettings.maxTokens.toLocaleString() }}</span>
            </div>
            <input
              type="range" min="256" max="8192" step="256"
              v-model.number="localSettings.maxTokens"
              class="w-full"
              style="accent-color:#00f5ff;"
            />
          </div>

          <!-- Top P -->
          <div class="mb-5">
            <div class="flex justify-between mb-2">
              <label class="text-xs font-mono font-bold tracking-wider" style="color:#00f5ff;">TOP-P</label>
              <span class="text-xs font-mono neon-text">{{ localSettings.topP.toFixed(2) }}</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              v-model.number="localSettings.topP"
              class="w-full"
              style="accent-color:#00f5ff;"
            />
          </div>

          <!-- Top K -->
          <div class="mb-5">
            <div class="flex justify-between mb-2">
              <label class="text-xs font-mono font-bold tracking-wider" style="color:#00f5ff;">TOP-K</label>
              <span class="text-xs font-mono neon-text">{{ localSettings.topK }}</span>
            </div>
            <input
              type="range" min="1" max="100" step="1"
              v-model.number="localSettings.topK"
              class="w-full"
              style="accent-color:#00f5ff;"
            />
          </div>

          <!-- Streaming toggle -->
          <div class="flex items-center justify-between p-3 rounded" style="background:rgba(0,245,255,0.04); border:1px solid rgba(0,245,255,0.1);">
            <div>
              <div class="text-xs font-mono font-bold tracking-wider" style="color:#00f5ff;">STREAMING</div>
              <div class="text-xs font-mono mt-0.5" style="color:#304050;">Real-time token streaming</div>
            </div>
            <button
              @click="localSettings.streamingEnabled = !localSettings.streamingEnabled"
              class="w-10 h-5 rounded-full transition-all relative"
              :style="localSettings.streamingEnabled
                ? 'background:rgba(0,245,255,0.3); border:1px solid rgba(0,245,255,0.5);'
                : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);'"
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                :style="localSettings.streamingEnabled
                  ? 'left:calc(100% - 18px); background:#00f5ff;'
                  : 'left:1px; background:#405060;'"
              ></span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4" style="border-top:1px solid rgba(0,245,255,0.08);">
          <button
            @click="resetDefaults"
            class="text-xs font-mono px-3 py-2 rounded transition-all"
            style="color:#405060; border:1px solid rgba(255,255,255,0.05);"
            @mouseenter="e => e.currentTarget.style.color='#c8d8e8'"
            @mouseleave="e => e.currentTarget.style.color='#405060'"
          >
            RESET DEFAULTS
          </button>
          <button
            @click="saveSettings"
            class="text-xs font-mono font-bold px-5 py-2 rounded transition-all"
            style="background:rgba(0,245,255,0.12); border:1px solid rgba(0,245,255,0.3); color:#00f5ff; letter-spacing:0.1em;"
            @mouseenter="e => e.currentTarget.style.background='rgba(0,245,255,0.2)'"
            @mouseleave="e => e.currentTarget.style.background='rgba(0,245,255,0.12)'"
          >
            SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ChatSettings } from '~/composables/useChat'

const props = defineProps<{
  show: boolean
  apiKey: string
  settings: ChatSettings
}>()

const emit = defineEmits<{
  close: []
  save: [{ apiKey: string; settings: ChatSettings }]
}>()

const showKey = ref(false)
const localApiKey = ref(props.apiKey)
const localSettings = ref<ChatSettings>({ ...props.settings })

watch(() => props.apiKey, v => { localApiKey.value = v })
watch(() => props.settings, v => { localSettings.value = { ...v } }, { deep: true })

function resetDefaults() {
  localSettings.value = {
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.95,
    topK: 40,
    systemPrompt: '',
    streamingEnabled: true
  }
}

function saveSettings() {
  emit('save', { apiKey: localApiKey.value, settings: { ...localSettings.value } })
}
</script>
