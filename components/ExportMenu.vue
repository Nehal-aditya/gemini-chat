<template>
  <div class="relative" ref="menuRef">
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-mono transition-all"
      style="color:#405060; border:1px solid transparent;"
      title="Export conversation"
      @mouseenter="e => { e.currentTarget.style.color='#00f5ff'; e.currentTarget.style.borderColor='rgba(0,245,255,0.2)' }"
      @mouseleave="e => { e.currentTarget.style.color='#405060'; e.currentTarget.style.borderColor='transparent' }"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      EXPORT
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1 rounded-lg overflow-hidden z-20 animate-fade-in"
      style="background:#0d0d1a; border:1px solid rgba(0,245,255,0.2); box-shadow:0 8px 24px rgba(0,0,0,0.4); min-width:160px; top:100%;"
    >
      <button
        v-for="opt in options"
        :key="opt.label"
        @click="handleExport(opt.action)"
        class="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-mono text-left transition-all"
        style="color:#8090a0;"
        @mouseenter="e => { e.currentTarget.style.background='rgba(0,245,255,0.06)'; e.currentTarget.style.color='#00f5ff' }"
        @mouseleave="e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8090a0' }"
      >
        <span>{{ opt.icon }}</span>
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/composables/useChat'
import { useExport } from '~/composables/useExport'

const props = defineProps<{
  conversation: Conversation
  allConversations: Conversation[]
}>()

const { exportAsMarkdown, exportAsJSON, exportAsText, exportAllAsJSON } = useExport()

const open = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const options = [
  { icon: '📝', label: 'As Markdown', action: 'markdown' },
  { icon: '📄', label: 'As Plain Text', action: 'text' },
  { icon: '{ }', label: 'As JSON', action: 'json' },
  { icon: '📦', label: 'Export All (JSON)', action: 'all' }
]

function handleExport(action: string) {
  open.value = false
  switch (action) {
    case 'markdown': exportAsMarkdown(props.conversation); break
    case 'text': exportAsText(props.conversation); break
    case 'json': exportAsJSON(props.conversation); break
    case 'all': exportAllAsJSON(props.allConversations); break
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>
