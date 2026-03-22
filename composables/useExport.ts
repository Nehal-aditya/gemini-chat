// composables/useExport.ts
import type { Conversation } from './useChat'

export const useExport = () => {
  function exportAsMarkdown(conv: Conversation): void {
    const lines: string[] = [
      `# ${conv.title}`,
      `> Model: ${conv.model} | Messages: ${conv.messages.length} | Date: ${new Date(conv.createdAt).toLocaleDateString()}`,
      ''
    ]
    for (const msg of conv.messages) {
      const role = msg.role === 'user' ? '**You**' : `**Gemini** _(${msg.model || conv.model})_`
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      lines.push(`### ${role} — ${time}`)
      lines.push('')
      lines.push(msg.content)
      lines.push('')
      lines.push('---')
      lines.push('')
    }
    downloadText(lines.join('\n'), `${slugify(conv.title)}.md`, 'text/markdown')
  }

  function exportAsJSON(conv: Conversation): void {
    const data = {
      title: conv.title,
      model: conv.model,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages.length,
      messages: conv.messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        model: m.model,
        tokens: m.tokens
      }))
    }
    downloadText(JSON.stringify(data, null, 2), `${slugify(conv.title)}.json`, 'application/json')
  }

  function exportAsText(conv: Conversation): void {
    const lines: string[] = [
      `CONVERSATION: ${conv.title}`,
      `Model: ${conv.model} | Date: ${new Date(conv.createdAt).toLocaleDateString()}`,
      '='.repeat(60),
      ''
    ]
    for (const msg of conv.messages) {
      const role = msg.role === 'user' ? 'YOU' : 'GEMINI'
      const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      lines.push(`[${role}] ${time}`)
      lines.push(msg.content)
      lines.push('')
      lines.push('-'.repeat(40))
      lines.push('')
    }
    downloadText(lines.join('\n'), `${slugify(conv.title)}.txt`, 'text/plain')
  }

  function exportAllAsJSON(conversations: Conversation[]): void {
    const data = {
      exportedAt: new Date().toISOString(),
      conversationCount: conversations.length,
      conversations: conversations.map(conv => ({
        title: conv.title,
        model: conv.model,
        createdAt: conv.createdAt,
        messages: conv.messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp
        }))
      }))
    }
    downloadText(JSON.stringify(data, null, 2), `gemini-export-${Date.now()}.json`, 'application/json')
  }

  function downloadText(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function slugify(str: string): string {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 50) || 'conversation'
  }

  return { exportAsMarkdown, exportAsJSON, exportAsText, exportAllAsJSON }
}
