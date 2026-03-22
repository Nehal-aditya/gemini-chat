<template>
  <aside class="flex flex-col h-full" style="width:260px; min-width:260px; background:#08080f; border-right:1px solid rgba(0,245,255,0.08);">
    <!-- Header -->
    <div class="p-4 border-b" style="border-color:rgba(0,245,255,0.08);">
      <div class="flex items-center gap-2 mb-3">
        <div class="relative">
          <div class="w-7 h-7 rounded flex items-center justify-center" style="background:linear-gradient(135deg,#00f5ff22,#bf00ff22); border:1px solid rgba(0,245,255,0.3);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#00f5ff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <div>
          <div class="text-xs font-mono neon-text font-bold tracking-wider">GEMINI</div>
          <div class="text-xs font-mono" style="color:#304050; font-size:9px; letter-spacing:2px;">AI STUDIO</div>
        </div>
      </div>

      <button
        @click="$emit('newChat')"
        class="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-display font-semibold transition-all"
        style="background:rgba(0,245,255,0.08); border:1px solid rgba(0,245,255,0.2); color:#00f5ff; letter-spacing:0.05em;"
        @mouseenter="e => e.currentTarget.style.background='rgba(0,245,255,0.15)'"
        @mouseleave="e => e.currentTarget.style.background='rgba(0,245,255,0.08)'"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        NEW CONVERSATION
      </button>
    </div>

    <!-- Conversations list -->
    <div class="flex-1 overflow-y-auto py-2 px-2">
      <div v-if="conversations.length === 0" class="text-center py-8">
        <div class="text-xs font-mono" style="color:#304050;">NO CONVERSATIONS YET</div>
        <div class="text-xs mt-1" style="color:#1e2a38;">Start chatting above</div>
      </div>

      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="sidebar-item neon-border rounded px-3 py-2 mb-1 group relative"
        :class="{ active: conv.id === activeConversationId }"
        @click="$emit('selectConversation', conv.id)"
      >
        <div class="flex items-start justify-between gap-1">
          <div class="flex-1 min-w-0">
            <div class="text-xs font-display font-medium truncate" style="color:#c8d8e8; font-size:11px;">
              {{ conv.title }}
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs font-mono" style="color:#304050; font-size:9px;">
                {{ formatDate(conv.updatedAt) }}
              </span>
              <span class="text-xs font-mono" style="color:#203040; font-size:9px; background:rgba(0,245,255,0.06); padding:1px 4px; border-radius:2px;">
                {{ conv.messages.length }}msg
              </span>
            </div>
          </div>
          <button
            @click.stop="$emit('deleteConversation', conv.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
            style="color:#405060;"
            @mouseenter="e => e.currentTarget.style.color='#ff4060'"
            @mouseleave="e => e.currentTarget.style.color='#405060'"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer actions -->
    <div class="p-3 border-t" style="border-color:rgba(0,245,255,0.08);">
      <button
        @click="$emit('openSettings')"
        class="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-mono transition-all"
        style="color:#506070; border:1px solid rgba(255,255,255,0.05);"
        @mouseenter="e => { e.currentTarget.style.color='#00f5ff'; e.currentTarget.style.borderColor='rgba(0,245,255,0.2)' }"
        @mouseleave="e => { e.currentTarget.style.color='#506070'; e.currentTarget.style.borderColor='rgba(255,255,255,0.05)' }"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        SETTINGS
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Conversation } from '~/composables/useChat'

defineProps<{
  conversations: Conversation[]
  activeConversationId: string | null
}>()

defineEmits<{
  newChat: []
  selectConversation: [id: string]
  deleteConversation: [id: string]
  openSettings: []
}>()

function formatDate(date: Date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}
</script>
