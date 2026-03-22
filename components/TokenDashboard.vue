<template>
  <div
    class="rounded-xl overflow-hidden animate-fade-in"
    style="background:#08080f; border:1px solid rgba(0,245,255,0.15);"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3" style="border-bottom:1px solid rgba(0,245,255,0.08);">
      <div class="flex items-center gap-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#00f5ff" stroke-width="2"/>
          <path d="M12 7v5l3 3" stroke="#00f5ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="text-xs font-mono font-bold tracking-wider neon-text">TOKEN ANALYTICS</span>
      </div>
      <button @click="$emit('close')" style="color:#405060;" @mouseenter="e => e.currentTarget.style.color='#ff6080'" @mouseleave="e => e.currentTarget.style.color='#405060'">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="p-4">
      <!-- Summary stats -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div
          v-for="stat in summaryStats"
          :key="stat.label"
          class="rounded-lg p-3 text-center"
          style="background:rgba(0,245,255,0.03); border:1px solid rgba(0,245,255,0.08);"
        >
          <div class="text-xs font-mono font-bold mb-0.5" :style="`color:${stat.color}`">{{ stat.value }}</div>
          <div class="text-xs font-mono" style="color:#304050; font-size:9px; letter-spacing:0.05em;">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Per-message token breakdown -->
      <div v-if="messageStats.length > 0">
        <div class="text-xs font-mono font-bold tracking-wider mb-2" style="color:#405060; font-size:9px;">MESSAGE BREAKDOWN</div>
        <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
          <div
            v-for="(item, i) in messageStats"
            :key="i"
            class="flex items-center gap-2 rounded px-2 py-1.5"
            style="background:rgba(0,245,255,0.02);"
          >
            <div
              class="w-1.5 h-1.5 rounded-full flex-shrink-0"
              :style="item.role === 'user' ? 'background:#00ff94' : 'background:#00f5ff'"
            ></div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-mono truncate" style="color:#8090a0; font-size:9px;">
                {{ item.preview }}
              </div>
            </div>
            <div class="text-xs font-mono flex-shrink-0" :style="item.role === 'user' ? 'color:#00ff9480' : 'color:#00f5ff80'">
              ~{{ estimateTokens(item.content) }}tk
            </div>
            <!-- Mini bar -->
            <div class="w-16 h-1 rounded-full flex-shrink-0" style="background:rgba(255,255,255,0.05);">
              <div
                class="h-full rounded-full"
                :style="`width:${Math.min(100, (estimateTokens(item.content) / maxTokensInMsg) * 100)}%; background:${item.role === 'user' ? '#00ff9440' : '#00f5ff40'}`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Context usage bar -->
      <div v-if="contextWindow > 0" class="mt-4">
        <div class="flex justify-between mb-1">
          <span class="text-xs font-mono" style="color:#405060; font-size:9px;">CONTEXT WINDOW USAGE</span>
          <span class="text-xs font-mono neon-text" style="font-size:9px;">{{ contextPct }}%</span>
        </div>
        <div class="w-full h-2 rounded-full" style="background:rgba(255,255,255,0.05);">
          <div
            class="h-full rounded-full transition-all"
            :style="`width:${contextPct}%; background:${contextPct > 80 ? '#ff6040' : contextPct > 50 ? '#ffb400' : '#00f5ff'}`"
          ></div>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs font-mono" style="color:#203040; font-size:9px;">{{ totalTokens.toLocaleString() }} used</span>
          <span class="text-xs font-mono" style="color:#203040; font-size:9px;">{{ contextWindow.toLocaleString() }} max</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~/composables/useChat'

const props = defineProps<{
  messages: Message[]
  model: string
}>()

defineEmits<{ close: [] }>()

const modelContextWindows: Record<string, number> = {
  'gemini-2.0-flash': 1048576,
  'gemini-2.0-flash-lite': 1048576,
  'gemini-1.5-pro': 2097152,
  'gemini-1.5-flash': 1048576,
  'gemini-1.5-flash-8b': 1048576,
  'gemini-1.0-pro': 32768
}

const contextWindow = computed(() => modelContextWindows[props.model] || 1048576)

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

const totalTokens = computed(() =>
  props.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0)
)

const contextPct = computed(() =>
  Math.min(100, Math.round((totalTokens.value / contextWindow.value) * 100))
)

const userMessages = computed(() => props.messages.filter(m => m.role === 'user'))
const assistantMessages = computed(() => props.messages.filter(m => m.role === 'assistant'))

const userTokens = computed(() => userMessages.value.reduce((s, m) => s + estimateTokens(m.content), 0))
const assistantTokens = computed(() => assistantMessages.value.reduce((s, m) => s + estimateTokens(m.content), 0))
const avgResponseLen = computed(() => assistantMessages.value.length
  ? Math.round(assistantTokens.value / assistantMessages.value.length)
  : 0
)

const summaryStats = computed(() => [
  { label: 'TOTAL TOKENS', value: totalTokens.value.toLocaleString(), color: '#00f5ff' },
  { label: 'YOU SENT', value: userTokens.value.toLocaleString(), color: '#00ff94' },
  { label: 'AVG RESPONSE', value: avgResponseLen.value.toLocaleString(), color: '#bf00ff' }
])

const messageStats = computed(() =>
  props.messages.map(m => ({
    role: m.role,
    content: m.content,
    preview: m.content.substring(0, 50).replace(/\n/g, ' ') + (m.content.length > 50 ? '…' : '')
  }))
)

const maxTokensInMsg = computed(() =>
  Math.max(1, ...props.messages.map(m => estimateTokens(m.content)))
)
</script>
