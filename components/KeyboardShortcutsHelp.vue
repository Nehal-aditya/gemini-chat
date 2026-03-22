<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.7); backdrop-filter:blur(4px);"
      @click.self="$emit('close')"
    >
      <div
        class="w-full max-w-md rounded-xl overflow-hidden animate-fade-in"
        style="background:#0a0a18; border:1px solid rgba(0,245,255,0.2); box-shadow:0 0 40px rgba(0,245,255,0.08);"
      >
        <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid rgba(0,245,255,0.08);">
          <span class="text-xs font-mono font-bold tracking-widest neon-text">KEYBOARD SHORTCUTS</span>
          <button @click="$emit('close')" style="color:#405060;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-1">
          <div
            v-for="(s, i) in shortcuts"
            :key="i"
            class="flex items-center justify-between py-2 px-3 rounded"
            :style="i % 2 === 0 ? 'background:rgba(0,245,255,0.02)' : ''"
          >
            <span class="text-xs font-mono" style="color:#8090a0;">{{ s.description }}</span>
            <div class="flex items-center gap-1">
              <kbd
                v-for="k in formatKeys(s)"
                :key="k"
                class="px-1.5 py-0.5 rounded text-xs font-mono"
                style="background:rgba(0,245,255,0.08); border:1px solid rgba(0,245,255,0.2); color:#00f5ff; font-size:10px;"
              >{{ k }}</kbd>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 text-center" style="border-top:1px solid rgba(0,245,255,0.08);">
          <span class="text-xs font-mono" style="color:#304050;">Press <kbd class="px-1 py-0.5 rounded" style="background:rgba(0,245,255,0.08); color:#00f5ff; font-size:10px;">?</kbd> to toggle this panel</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Shortcut } from '~/composables/useKeyboardShortcuts'

defineProps<{
  show: boolean
  shortcuts: Shortcut[]
}>()

defineEmits<{ close: [] }>()

function formatKeys(s: Shortcut): string[] {
  const keys: string[] = []
  if (s.ctrl) keys.push('Ctrl')
  if (s.shift) keys.push('Shift')
  if (s.alt) keys.push('Alt')
  keys.push(s.key.toUpperCase())
  return keys
}
</script>
