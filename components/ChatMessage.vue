<template>
  <div
    class="flex gap-3 animate-slide-up"
    :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0 mt-1">
      <div
        v-if="message.role === 'assistant'"
        class="w-7 h-7 rounded flex items-center justify-center"
        style="background:linear-gradient(135deg,#00f5ff18,#bf00ff18); border:1px solid rgba(0,245,255,0.25);"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00f5ff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div
        v-else
        class="w-7 h-7 rounded flex items-center justify-center text-xs font-mono font-bold"
        style="background:rgba(0,255,148,0.1); border:1px solid rgba(0,255,148,0.25); color:#00ff94;"
      >U</div>
    </div>

    <!-- Message bubble -->
    <div class="flex-1 min-w-0" :class="message.role === 'user' ? 'flex flex-col items-end' : ''">
      <!-- Role + meta -->
      <div class="flex items-center gap-2 mb-1.5" :class="message.role === 'user' ? 'flex-row-reverse' : ''">
        <span class="text-xs font-mono font-bold" :style="message.role === 'assistant' ? 'color:#00f5ff' : 'color:#00ff94'">
          {{ message.role === 'assistant' ? 'GEMINI' : 'YOU' }}
        </span>
        <span v-if="message.model" class="text-xs font-mono px-1.5 py-0.5 rounded" style="background:rgba(0,245,255,0.06); color:#304050; font-size:9px; letter-spacing:0.05em;">
          {{ message.model }}
        </span>
        <span class="text-xs font-mono" style="color:#203040; font-size:9px;">
          {{ formatTime(message.timestamp) }}
        </span>
        <span v-if="message.tokens" class="text-xs font-mono" style="color:#203040; font-size:9px;">
          {{ message.tokens.toLocaleString() }}tk
        </span>
      </div>

      <!-- Content -->
      <div
        class="relative rounded-lg px-4 py-3 max-w-3xl"
        :class="[
          message.error ? 'error-bubble' : '',
          message.role === 'user' ? 'user-bubble' : 'assistant-bubble'
        ]"
      >
        <!-- Corner decorators for assistant -->
        <div v-if="message.role === 'assistant'" class="corner-tl corner-br relative">
          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex items-center gap-1.5 py-1">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
          <!-- Rendered content -->
          <div
            v-else
            class="message-prose"
            v-html="renderedContent"
          ></div>
        </div>

        <!-- User message -->
        <div v-else class="text-sm" style="color:#c8e8d8; white-space:pre-wrap; line-height:1.6;">{{ message.content }}</div>
      </div>

      <!-- Actions -->
      <div
        v-if="message.role === 'assistant' && !isTyping && message.content"
        class="flex items-center gap-2 mt-1.5"
        :class="message.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <button
          @click="copyContent"
          class="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded transition-all"
          style="color:#304050; border:1px solid transparent;"
          @mouseenter="e => { e.currentTarget.style.color='#00f5ff'; e.currentTarget.style.borderColor='rgba(0,245,255,0.2)' }"
          @mouseleave="e => { e.currentTarget.style.color='#304050'; e.currentTarget.style.borderColor='transparent' }"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ copied ? 'COPIED' : 'COPY' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import type { Message } from '~/composables/useChat'

const props = defineProps<{
  message: Message
  isTyping?: boolean
}>()

const copied = ref(false)

const renderedContent = computed(() => {
  if (!props.message.content) return ''
  try {
    return marked.parse(props.message.content, { breaks: true, gfm: true }) as string
  } catch {
    return props.message.content
  }
})

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {}
}
</script>

<style scoped>
.user-bubble {
  background: rgba(0, 255, 148, 0.06);
  border: 1px solid rgba(0, 255, 148, 0.15);
  color: #c8e8d8;
}

.assistant-bubble {
  background: rgba(0, 245, 255, 0.03);
  border: 1px solid rgba(0, 245, 255, 0.1);
  color: #c8d8e8;
}

.error-bubble {
  background: rgba(255, 60, 80, 0.06) !important;
  border-color: rgba(255, 60, 80, 0.2) !important;
}
</style>
