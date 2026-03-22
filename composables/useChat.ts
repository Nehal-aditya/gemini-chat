// composables/useChat.ts
// Tauri build: calls Gemini SDK directly from the client — no server/api needed
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory
} from '@google/generative-ai'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens?: number
  model?: string
  error?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatSettings {
  temperature: number
  maxTokens: number
  topP: number
  topK: number
  systemPrompt: string
  streamingEnabled: boolean
}

export const MODELS = [
  { id: 'gemini-3.1-pro-preview',  name: 'Gemini 3.1 Pro',       badge: 'PREVIEW', description: 'Most powerful — advanced reasoning & agentic tasks' },
  { id: 'gemini-3-flash-preview',  name: 'Gemini 3 Flash',        badge: 'PREVIEW', description: 'Frontier-class performance at Flash speed & price' },
  { id: 'gemini-2.5-pro',          name: 'Gemini 2.5 Pro',        badge: 'STABLE',  description: 'Best-in-class thinking model for complex tasks' },
  { id: 'gemini-2.5-flash',        name: 'Gemini 2.5 Flash',      badge: 'STABLE',  description: 'Best price-performance with built-in reasoning' },
  { id: 'gemini-2.0-flash',        name: 'Gemini 2.0 Flash',      badge: 'STABLE',  description: 'Multimodal powerhouse, fast & capable' },
  { id: 'gemini-2.0-flash-lite',   name: 'Gemini 2.0 Flash Lite', badge: 'LITE',    description: 'Lightweight, optimized for speed & volume' },
  { id: 'gemini-1.5-pro',          name: 'Gemini 1.5 Pro',        badge: 'STABLE',  description: 'Long context, complex reasoning tasks' },
  { id: 'gemini-1.5-flash',        name: 'Gemini 1.5 Flash',      badge: 'STABLE',  description: 'Fast and versatile, great for most tasks' },
]

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
]

export const useChat = () => {
  const conversations      = useState<Conversation[]>('conversations', () => [])
  const activeConversationId = useState<string | null>('activeConvId', () => null)
  const isLoading          = useState<boolean>('isLoading', () => false)
  const error              = useState<string | null>('chatError', () => null)
  const apiKey             = useState<string>('geminiApiKey', () => {
    if (process.client) return localStorage.getItem('gemini_api_key') || ''
    return ''
  })
  const selectedModel = useState<string>('selectedModel', () => 'gemini-2.5-flash')

  const chatSettings = useState<ChatSettings>('chatSettings', () => ({
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.95,
    topK: 40,
    systemPrompt: '',
    streamingEnabled: true
  }))

  const activeConversation = computed(() =>
    conversations.value.find(c => c.id === activeConversationId.value) || null
  )

  const totalTokensUsed = computed(() =>
    activeConversation.value?.messages.reduce((s, m) => s + (m.tokens || 0), 0) ?? 0
  )

  function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  function createConversation(model?: string) {
    const conv: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      model: model || selectedModel.value,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversations.value.unshift(conv)
    activeConversationId.value = conv.id
    saveToStorage()
    return conv
  }

  function deleteConversation(id: string) {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx > -1) {
      conversations.value.splice(idx, 1)
      if (activeConversationId.value === id) {
        activeConversationId.value = conversations.value[0]?.id || null
      }
      saveToStorage()
    }
  }

  function clearAllConversations() {
    conversations.value = []
    activeConversationId.value = null
    saveToStorage()
  }

  function autoTitleConversation(conv: Conversation, firstMessage: string) {
    if (conv.title !== 'New Conversation') return
    conv.title = firstMessage.length > 40
      ? firstMessage.substring(0, 40) + '...'
      : firstMessage
  }

  // Build Gemini SDK model instance
  function buildGeminiModel(key: string) {
    const genAI = new GoogleGenerativeAI(key)
    return genAI.getGenerativeModel({
      model: selectedModel.value,
      systemInstruction: chatSettings.value.systemPrompt || undefined,
      generationConfig: {
        temperature: chatSettings.value.temperature,
        maxOutputTokens: chatSettings.value.maxTokens,
        topP: chatSettings.value.topP,
        topK: chatSettings.value.topK,
      },
      safetySettings: SAFETY
    })
  }

  async function sendMessage(
    content: string,
    attachments: Array<{ name: string; mimeType: string; base64: string; size: number; dataUrl: string }> = []
  ) {
    if ((!content.trim() && !attachments.length) || isLoading.value) return
    if (!apiKey.value) {
      error.value = 'Please enter your Gemini API key in settings'
      return
    }

    error.value = null

    let conv = activeConversation.value
    if (!conv) conv = createConversation()

    const attachmentNote = attachments.length
      ? `\n\n_[${attachments.length} file(s): ${attachments.map(a => a.name).join(', ')}]_`
      : ''

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim() + attachmentNote,
      timestamp: new Date()
    }
    conv.messages.push(userMsg)
    autoTitleConversation(conv, content || attachments[0]?.name || 'File')
    conv.updatedAt = new Date()
    isLoading.value = true

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: selectedModel.value
    }
    conv.messages.push(assistantMsg)

    try {
      const geminiModel = buildGeminiModel(apiKey.value)

      // Build clean message history for API (strip attachment notes, exclude empty)
      const cleanHistory = conv.messages
        .filter(m => !m.error && m.content.trim())
        .slice(0, -1) // exclude the empty assistant placeholder
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user' as 'model' | 'user',
          parts: [{ text: m.content.replace(/\n\n_\[\d+ file\(s\):.*?\]_$/, '') }]
        }))

      const chat = geminiModel.startChat({ history: cleanHistory })

      // Build the user parts — text + optional inline images
      const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = []
      if (content.trim()) userParts.push({ text: content.trim() })
      for (const att of attachments) {
        userParts.push({ inlineData: { mimeType: att.mimeType, data: att.base64 } })
      }

      if (chatSettings.value.streamingEnabled) {
        // ── Streaming ────────────────────────────────────────────────────────
        const result = await chat.sendMessageStream(userParts.length === 1 && 'text' in userParts[0]
          ? (userParts[0] as { text: string }).text
          : userParts)

        for await (const chunk of result.stream) {
          const candidate = chunk.candidates?.[0]
          if (candidate?.finishReason === 'SAFETY') {
            throw new Error('Response blocked by safety filters. Try rephrasing.')
          }
          const text = chunk.text()
          if (text) assistantMsg.content += text
        }

        const finalResp = await result.response
        const finishReason = finalResp.candidates?.[0]?.finishReason
        if (!assistantMsg.content) {
          if (finishReason === 'SAFETY') throw new Error('Response blocked by safety filters. Try rephrasing.')
          throw new Error(`Empty response (finish reason: ${finishReason ?? 'unknown'}). Try a different model or rephrase.`)
        }

        // Capture token usage if available
        if (finalResp.usageMetadata?.totalTokenCount) {
          assistantMsg.tokens = finalResp.usageMetadata.totalTokenCount
        }

      } else {
        // ── Non-streaming ─────────────────────────────────────────────────────
        const result = await chat.sendMessage(userParts.length === 1 && 'text' in userParts[0]
          ? (userParts[0] as { text: string }).text
          : userParts)

        const resp = result.response
        const finishReason = resp.candidates?.[0]?.finishReason
        if (finishReason === 'SAFETY') throw new Error('Response blocked by safety filters. Try rephrasing.')

        const text = resp.text()
        if (!text) throw new Error(`Empty response (finish reason: ${finishReason ?? 'unknown'}). Try a different model or rephrase.`)

        assistantMsg.content = text
        if (resp.usageMetadata?.totalTokenCount) {
          assistantMsg.tokens = resp.usageMetadata.totalTokenCount
        }
      }

    } catch (err: unknown) {
      const e = err as { message?: string }
      let msg = e.message || 'An unexpected error occurred'
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        msg = 'Invalid API key. Please check your Gemini API key in settings.'
      } else if (msg.includes('quota') || msg.includes('RATE_LIMIT') || msg.includes('429')) {
        msg = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (msg.includes('404') || msg.includes('not found')) {
        msg = `Model "${selectedModel.value}" not found or not available with your API key.`
      }
      assistantMsg.content = `**Error:** ${msg}`
      assistantMsg.error = true
      error.value = msg
    } finally {
      isLoading.value = false
      conv.updatedAt = new Date()
      saveToStorage()
    }
  }

  function saveApiKey(key: string) {
    apiKey.value = key
    if (process.client) localStorage.setItem('gemini_api_key', key)
  }

  function saveToStorage() {
    if (!process.client) return
    try {
      const toSave = conversations.value.slice(0, 50).map(c => ({
        ...c,
        messages: c.messages.slice(-100)
      }))
      localStorage.setItem('gemini_conversations', JSON.stringify(toSave))
    } catch {}
  }

  function loadFromStorage() {
    if (!process.client) return
    try {
      const stored = localStorage.getItem('gemini_conversations')
      if (stored) {
        const parsed = JSON.parse(stored)
        conversations.value = parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }))
        if (conversations.value.length > 0 && !activeConversationId.value) {
          activeConversationId.value = conversations.value[0].id
        }
      }
    } catch {}

    const savedKey = localStorage.getItem('gemini_api_key')
    if (savedKey) apiKey.value = savedKey

    const savedModel = localStorage.getItem('gemini_model')
    if (savedModel) selectedModel.value = savedModel

    const savedSettings = localStorage.getItem('gemini_settings')
    if (savedSettings) {
      try { chatSettings.value = { ...chatSettings.value, ...JSON.parse(savedSettings) } } catch {}
    }
  }

  function saveSettings() {
    if (!process.client) return
    localStorage.setItem('gemini_settings', JSON.stringify(chatSettings.value))
    localStorage.setItem('gemini_model', selectedModel.value)
  }

  function setActiveConversation(id: string) { activeConversationId.value = id }

  function clearConversationMessages() {
    if (activeConversation.value) {
      activeConversation.value.messages = []
      saveToStorage()
    }
  }

  return {
    conversations, activeConversationId, activeConversation,
    isLoading, error, apiKey, selectedModel, chatSettings, totalTokensUsed,
    createConversation, deleteConversation, clearAllConversations,
    sendMessage, saveApiKey, loadFromStorage, saveSettings,
    setActiveConversation, clearConversationMessages,
    MODELS
  }
}
