// composables/useKeyboardShortcuts.ts
export interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const showHelp = ref(false)

  function handleKeydown(e: KeyboardEvent) {
    // Toggle help with ?
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      const tag = (e.target as HTMLElement).tagName
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        showHelp.value = !showHelp.value
        return
      }
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey)
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
      const altMatch = shortcut.alt ? e.altKey : !e.altKey
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault()
        shortcut.action()
        return
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeydown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

  return { showHelp }
}
