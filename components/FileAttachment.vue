<template>
  <div>
    <!-- Attachment previews -->
    <div v-if="attachments.length" class="flex flex-wrap gap-2 mb-2 px-1">
      <div
        v-for="(att, i) in attachments"
        :key="i"
        class="relative rounded-lg overflow-hidden flex-shrink-0 group"
        style="border:1px solid rgba(0,245,255,0.2);"
      >
        <!-- Image preview -->
        <img
          v-if="att.mimeType.startsWith('image/')"
          :src="att.dataUrl"
          class="h-16 w-16 object-cover"
          :alt="att.name"
        />
        <!-- File preview -->
        <div
          v-else
          class="h-16 w-16 flex flex-col items-center justify-center gap-1"
          style="background:rgba(0,245,255,0.05);"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00f5ff" stroke-width="1.5"/>
            <polyline points="14 2 14 8 20 8" stroke="#00f5ff" stroke-width="1.5"/>
          </svg>
          <span class="text-xs font-mono text-center px-1" style="color:#00f5ff; font-size:8px; line-height:1.2; word-break:break-all;">
            {{ att.name.length > 8 ? att.name.substring(0, 8) + '…' : att.name }}
          </span>
        </div>

        <!-- Size badge -->
        <div class="absolute bottom-0 left-0 right-0 py-0.5 text-center" style="background:rgba(0,0,0,0.6); font-size:8px; color:#8090a0; font-family:'Space Mono',monospace;">
          {{ formatSize(att.size) }}
        </div>

        <!-- Remove button -->
        <button
          @click="$emit('remove', i)"
          class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style="background:rgba(255,60,80,0.8);"
        >
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Add more -->
      <label
        class="h-16 w-16 rounded-lg flex items-center justify-center cursor-pointer transition-all flex-shrink-0"
        style="border:1px dashed rgba(0,245,255,0.2); color:#304050;"
        @mouseenter="e => e.currentTarget.style.borderColor='rgba(0,245,255,0.4)'"
        @mouseleave="e => e.currentTarget.style.borderColor='rgba(0,245,255,0.2)'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input type="file" class="hidden" multiple :accept="acceptTypes" @change="handleFiles" />
      </label>
    </div>

    <!-- Upload button (when no attachments) -->
    <div v-else class="flex items-center gap-1">
      <label
        class="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-mono cursor-pointer transition-all"
        style="color:#405060; border:1px solid transparent;"
        @mouseenter="e => { e.currentTarget.style.color='#00f5ff'; e.currentTarget.style.borderColor='rgba(0,245,255,0.2)' }"
        @mouseleave="e => { e.currentTarget.style.color='#405060'; e.currentTarget.style.borderColor='transparent' }"
        title="Attach images or files"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        ATTACH
        <input type="file" class="hidden" multiple :accept="acceptTypes" @change="handleFiles" />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Attachment {
  name: string
  mimeType: string
  size: number
  dataUrl: string
  base64: string
}

defineProps<{
  attachments: Attachment[]
}>()

const emit = defineEmits<{
  add: [attachments: Attachment[]]
  remove: [index: number]
}>()

const acceptTypes = 'image/*,application/pdf,text/*,.json,.csv,.md,.txt'
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

async function handleFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''

  const newAttachments: Attachment[] = []

  for (const file of files) {
    if (file.size > MAX_SIZE) {
      alert(`File "${file.name}" is too large (max 20MB)`)
      continue
    }

    try {
      const { dataUrl, base64 } = await readFileAsBase64(file)
      newAttachments.push({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl,
        base64
      })
    } catch {
      console.error(`Failed to read file: ${file.name}`)
    }
  }

  if (newAttachments.length) emit('add', newAttachments)
}

function readFileAsBase64(file: File): Promise<{ dataUrl: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      resolve({ dataUrl, base64 })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}
</script>
