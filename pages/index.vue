<template>
  <div class="flex h-screen overflow-hidden relative z-10">
    <!-- Sidebar -->
    <ChatSidebar
      :conversations="conversations"
      :active-conversation-id="activeConversationId"
      @new-chat="handleNewChat"
      @select-conversation="setActiveConversation"
      @delete-conversation="deleteConversation"
      @open-settings="showSettings = true"
    />

    <!-- Main chat area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Top bar -->
      <header class="flex items-center justify-between px-5 py-3 flex-shrink-0" style="border-bottom:1px solid rgba(0,245,255,0.08); background:rgba(6,6,13,0.8); backdrop-filter:blur(8px);">
        <div class="flex items-center gap-3 min-w-0">
          <div v-if="activeConversation" class="flex items-center gap-2 min-w-0">
            <div class="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse-slow" style="background:#00ff94;"></div>
            <span class="text-sm font-display font-semibold truncate" style="color:#c8d8e8; max-width:220px;">{{ activeConversation.title }}</span>
          </div>
          <div v-else>
            <span class="text-sm font-display font-semibold" style="color:#304050;">No active conversation</span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Token analytics toggle -->
          <button
            v-if="activeConversation && activeConversation.messages.length"
            @click="showTokenDash = !showTokenDash"
            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono transition-all text-xs"
            :style="showTokenDash
              ? 'background:rgba(0,245,255,0.12); border:1px solid rgba(0,245,255,0.3); color:#00f5ff;'
              : 'color:#405060; border:1px solid transparent;'"
            title="Token analytics (Ctrl+T)"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ estimateTotalTokens.toLocaleString() }}tk
          </button>

          <!-- Model selector -->
          <select
            v-model="selectedModel"
            class="text-xs font-mono px-3 py-1.5 rounded chat-input"
            style="background:rgba(0,0,0,0.4); border:1px solid rgba(0,245,255,0.15); color:#00f5ff; font-size:10px; letter-spacing:0.05em;"
          >
            <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>

          <!-- Export -->
          <ExportMenu
            v-if="activeConversation && activeConversation.messages.length"
            :conversation="activeConversation"
            :all-conversations="conversations"
          />

          <!-- Shortcuts help -->
          <button
            @click="showShortcuts = true"
            class="w-7 h-7 flex items-center justify-center text-xs font-mono rounded transition-all"
            style="color:#405060; border:1px solid transparent;"
            title="Keyboard shortcuts (?)"
            @mouseenter="e => { (e.currentTarget as HTMLButtonElement).style.color='#00f5ff'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(0,245,255,0.2)' }"
            @mouseleave="e => { (e.currentTarget as HTMLButtonElement).style.color='#405060'; (e.currentTarget as HTMLButtonElement).style.borderColor='transparent' }"
          >?</button>

          <!-- Clear chat -->
          <button
            v-if="activeConversation && activeConversation.messages.length"
            @click="clearConversationMessages"
            class="w-7 h-7 flex items-center justify-center text-xs font-mono rounded transition-all"
            style="color:#405060; border:1px solid transparent;"
            title="Clear messages (Ctrl+L)"
            @mouseenter="e => { (e.currentTarget as HTMLButtonElement).style.color='#ff6080'; (e.currentTarget as HTMLButtonElement).style.borderColor='rgba(255,60,80,0.2)' }"
            @mouseleave="e => { (e.currentTarget as HTMLButtonElement).style.color='#405060'; (e.currentTarget as HTMLButtonElement).style.borderColor='transparent' }"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/>
              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </header>

      <!-- Token Dashboard -->
      <div v-if="showTokenDash && activeConversation" class="px-5 pt-3 flex-shrink-0">
        <TokenDashboard
          :messages="activeConversation.messages"
          :model="activeConversation.model"
          @close="showTokenDash = false"
        />
      </div>

      <!-- Messages area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        <!-- Welcome screen -->
        <div v-if="!activeConversation || activeConversation.messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-12">
          <div class="relative mb-6">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto" style="background:linear-gradient(135deg,rgba(0,245,255,0.1),rgba(191,0,255,0.1)); border:1px solid rgba(0,245,255,0.2);">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" class="animate-float">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00f5ff" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full" style="background:#00f5ff; animation:pulse 2s infinite; opacity:0.5;"></div>
          </div>

          <h1 class="font-display font-bold text-2xl mb-2 neon-text">GEMINI AI STUDIO</h1>
          <p class="text-sm font-mono mb-2" style="color:#405060; max-width:380px; line-height:1.8;">
            Advanced AI chat with vision, streaming, file analysis, and token tracking.
          </p>
          <p class="text-xs font-mono mb-8" style="color:#203040;">
            Press <kbd class="px-1.5 py-0.5 rounded" style="background:rgba(0,245,255,0.08); color:#00f5ff; border:1px solid rgba(0,245,255,0.2);">?</kbd> for keyboard shortcuts · Drag &amp; drop images or files
          </p>

          <div class="grid grid-cols-2 gap-3 max-w-2xl w-full">
            <button
              v-for="prompt in starterPrompts"
              :key="prompt.title"
              @click="handleStarterPrompt(prompt.text)"
              class="neon-border p-3 rounded-lg text-left transition-all"
              style="background:rgba(0,245,255,0.02);"
              @mouseenter="e => (e.currentTarget as HTMLButtonElement).style.background='rgba(0,245,255,0.05)'"
              @mouseleave="e => (e.currentTarget as HTMLButtonElement).style.background='rgba(0,245,255,0.02)'"
            >
              <div class="text-lg mb-1">{{ prompt.emoji }}</div>
              <div class="text-xs font-display font-semibold" style="color:#c8d8e8; font-size:11px;">{{ prompt.title }}</div>
              <div class="text-xs font-mono mt-0.5" style="color:#304050; font-size:10px;">{{ prompt.subtitle }}</div>
            </button>
          </div>

          <div v-if="!apiKey" class="mt-6 px-4 py-3 rounded-lg flex items-center gap-2" style="background:rgba(255,180,0,0.06); border:1px solid rgba(255,180,0,0.2);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4M12 17h.01" stroke="#ffb400" stroke-width="2" stroke-linecap="round"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ffb400" stroke-width="2"/>
            </svg>
            <span class="text-xs font-mono" style="color:#ffb400;">No API key configured — <button @click="showSettings = true" class="underline">open settings</button></span>
          </div>
        </div>

        <!-- Messages -->
        <template v-else>
          <ChatMessage
            v-for="(msg, i) in activeConversation.messages"
            :key="msg.id"
            :message="msg"
            :is-typing="isLoading && i === activeConversation.messages.length - 1 && msg.role === 'assistant' && !msg.content"
          />
        </template>
      </div>

      <!-- Error banner -->
      <Transition name="slide-down">
        <div
          v-if="error"
          class="mx-6 mb-2 px-4 py-2 rounded-lg flex items-center justify-between flex-shrink-0"
          style="background:rgba(255,60,80,0.08); border:1px solid rgba(255,60,80,0.2);"
        >
          <div class="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ff6080" stroke-width="2"/>
              <path d="M12 8v4M12 16h.01" stroke="#ff6080" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="text-xs font-mono" style="color:#ff6080;">{{ error }}</span>
          </div>
          <button @click="error = null" style="color:#ff6080;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Input area -->
      <div class="px-5 pb-5 pt-2 flex-shrink-0" style="border-top:1px solid rgba(0,245,255,0.06);">

        <!-- Attachment previews -->
        <div class="mb-2">
          <FileAttachment
            :attachments="attachments"
            @add="onAddAttachments"
            @remove="onRemoveAttachment"
          />
        </div>

        <div
          class="relative rounded-xl overflow-hidden"
          style="background:#0a0a18; border:1px solid rgba(0,245,255,0.15); box-shadow:0 0 20px rgba(0,245,255,0.04);"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
        >
          <!-- Drag overlay -->
          <div
            v-if="isDragging"
            class="absolute inset-0 z-10 flex items-center justify-center rounded-xl"
            style="background:rgba(0,245,255,0.08); border:2px dashed rgba(0,245,255,0.5);"
          >
            <div class="text-center pointer-events-none">
              <div class="text-2xl mb-1">📎</div>
              <div class="text-xs font-mono neon-text">DROP TO ATTACH</div>
            </div>
          </div>

          <textarea
            ref="inputRef"
            v-model="inputText"
            :placeholder="apiKey ? 'Message Gemini… (⏎ send · Ctrl+Enter · drag & drop files · paste images)' : 'Add your Gemini API key in settings to start…'"
            :disabled="isLoading || !apiKey"
            rows="1"
            class="w-full px-4 pt-4 pb-12 text-sm font-mono resize-none bg-transparent chat-input"
            style="color:#c8d8e8; max-height:200px; line-height:1.6; min-height:60px;"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.ctrl.enter.prevent="handleSend"
            @keydown.meta.enter.prevent="handleSend"
            @input="autoResize"
            @paste="onPaste"
          ></textarea>

          <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono" style="color:#203040; font-size:9px; letter-spacing:0.04em;">{{ selectedModel }}</span>
              <span v-if="attachments.length" class="text-xs font-mono px-1.5 py-0.5 rounded" style="background:rgba(0,245,255,0.08); color:#00f5ff; font-size:9px;">
                {{ attachments.length }} attached
              </span>
              <span v-if="inputText.length > 80" class="text-xs font-mono" style="color:#203040; font-size:9px;">
                ~{{ Math.ceil(inputText.length / 4) }}tk
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs font-mono" style="color:#1e2a38; font-size:9px;">⏎ send</span>
              <button
                @click="handleSend"
                :disabled="(!inputText.trim() && !attachments.length) || isLoading || !apiKey"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all"
                :style="(inputText.trim() || attachments.length) && !isLoading && apiKey
                  ? 'background:rgba(0,245,255,0.15); border:1px solid rgba(0,245,255,0.35); color:#00f5ff; cursor:pointer;'
                  : 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); color:#304050; cursor:not-allowed;'"
              >
                <div
                  v-if="isLoading"
                  class="w-3 h-3 rounded-full border border-t-transparent animate-spin"
                  style="border-color:#00f5ff; border-top-color:transparent;"
                ></div>
                <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ isLoading ? 'THINKING…' : 'SEND' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SettingsModal
      :show="showSettings"
      :api-key="apiKey"
      :settings="chatSettings"
      @close="showSettings = false"
      @save="handleSaveSettings"
    />

    <KeyboardShortcutsHelp
      :show="showShortcuts"
      :shortcuts="shortcuts"
      @close="showShortcuts = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '~/composables/useChat'
import { useKeyboardShortcuts } from '~/composables/useKeyboardShortcuts'
import { useExport } from '~/composables/useExport'
import type { Attachment } from '~/components/FileAttachment.vue'

const {
  conversations, activeConversationId, activeConversation,
  isLoading, error, apiKey, selectedModel, chatSettings,
  createConversation, deleteConversation, sendMessage,
  saveApiKey, loadFromStorage, saveSettings, setActiveConversation, clearConversationMessages
} = useChat()

const { MODELS: models } = useChat()

const showSettings = ref(false)
const showTokenDash = ref(false)
const showShortcuts = ref(false)
const inputText = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const messagesContainer = ref<HTMLDivElement | null>(null)
const attachments = ref<Attachment[]>([])
const isDragging = ref(false)

const estimateTotalTokens = computed(() => {
  if (!activeConversation.value) return 0
  return activeConversation.value.messages.reduce((s, m) => s + Math.ceil(m.content.length / 4), 0)
})

const shortcuts = computed(() => [
  { key: 'k', ctrl: true, description: 'New conversation', action: handleNewChat },
  { key: 'l', ctrl: true, description: 'Clear messages', action: () => clearConversationMessages() },
  { key: 't', ctrl: true, description: 'Toggle token dashboard', action: () => { showTokenDash.value = !showTokenDash.value } },
  { key: ',', ctrl: true, description: 'Open settings', action: () => { showSettings.value = true } },
  { key: 'Escape', description: 'Close modals / overlays', action: () => { showSettings.value = false; showShortcuts.value = false; showTokenDash.value = false } },
  { key: 'f', ctrl: true, shift: true, description: 'Focus message input', action: () => inputRef.value?.focus() },
])

const { showHelp } = useKeyboardShortcuts(shortcuts.value)
watch(showHelp, v => { showShortcuts.value = v })

const starterPrompts = [
  { emoji: '🧠', title: 'Explain a concept', subtitle: 'Deep dive into any topic', text: 'Explain quantum entanglement in simple terms with an analogy.' },
  { emoji: '💻', title: 'Write code', subtitle: 'Any language or framework', text: 'Write a TypeScript utility to deep-clone any object safely.' },
  { emoji: '🖼️', title: 'Analyze an image', subtitle: 'Attach a file below & ask', text: 'Describe what you see in this image in detail.' },
  { emoji: '📊', title: 'Data analysis', subtitle: 'Attach CSV/text for insights', text: 'Analyze and summarize the key trends in this data.' },
  { emoji: '✍️', title: 'Creative writing', subtitle: 'Stories, poems, scripts', text: 'Write a compelling opening paragraph for a sci-fi story about AI.' },
  { emoji: '🔍', title: 'Research & compare', subtitle: 'Pros, cons, summaries', text: 'Compare REST vs GraphQL APIs with a pros/cons table.' },
]

onMounted(() => { loadFromStorage() })

watch(() => activeConversation.value?.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({ top: messagesContainer.value.scrollHeight, behavior: 'smooth' })
    }
  })
})

function handleNewChat() {
  createConversation()
  inputText.value = ''
  attachments.value = []
  nextTick(() => inputRef.value?.focus())
}

function handleStarterPrompt(text: string) {
  if (!apiKey.value) { showSettings.value = true; return }
  if (!activeConversation.value) createConversation()
  inputText.value = text
  nextTick(() => inputRef.value?.focus())
}

async function handleSend() {
  const hasInput = inputText.value.trim() || attachments.value.length
  if (!hasInput || isLoading.value || !apiKey.value) return

  const text = inputText.value.trim() || 'Please analyze the attached file(s).'
  const currentAttachments = [...attachments.value]

  inputText.value = ''
  attachments.value = []
  if (inputRef.value) inputRef.value.style.height = 'auto'

  await sendMessage(text, currentAttachments)
}

function handleSaveSettings({ apiKey: key, settings }: { apiKey: string; settings: typeof chatSettings.value }) {
  saveApiKey(key)
  chatSettings.value = settings
  saveSettings()
  showSettings.value = false
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function onAddAttachments(newAtts: Attachment[]) { attachments.value.push(...newAtts) }
function onRemoveAttachment(index: number) { attachments.value.splice(index, 1) }

async function readFileToBase64(file: File): Promise<{ dataUrl: string; base64: string }> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => { const d = r.result as string; res({ dataUrl: d, base64: d.split(',')[1] }) }
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

async function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  const newAtts: Attachment[] = []
  for (const file of files) {
    if (file.size > 20 * 1024 * 1024) continue
    const { dataUrl, base64 } = await readFileToBase64(file)
    newAtts.push({ name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size, dataUrl, base64 })
  }
  if (newAtts.length) attachments.value.push(...newAtts)
}

async function onPaste(e: ClipboardEvent) {
  const items = Array.from(e.clipboardData?.items || [])
  const imageItem = items.find(i => i.type.startsWith('image/'))
  if (!imageItem) return
  const file = imageItem.getAsFile()
  if (!file) return
  const { dataUrl, base64 } = await readFileToBase64(file)
  attachments.value.push({ name: 'pasted-image.png', mimeType: file.type, size: file.size, dataUrl, base64 })
}
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
