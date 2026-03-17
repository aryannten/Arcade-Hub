import * as Haptics from 'expo-haptics'

class SoundManager {
  constructor() {
    this.enabled = true
  }

  async init() {
    try {
      const { storage } = await import('./storage')
      const s = await storage.getSettings()
      this.enabled = !!s.soundEnabled
    } catch {
      this.enabled = false
    }
  }

  async enable() {
    this.enabled = true
    try {
      const { storage } = await import('./storage')
      await storage.saveSettings({ soundEnabled: true })
    } catch (e) {}
  }

  async disable() {
    this.enabled = false
    try {
      const { storage } = await import('./storage')
      await storage.saveSettings({ soundEnabled: false })
    } catch (e) {}
  }

  trigger(feedback = 'light') {
    if (!this.enabled) return
    try {
      if (feedback === 'light') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      else if (feedback === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      else if (feedback === 'heavy') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      else if (feedback === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      else if (feedback === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      else if (feedback === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } catch (e) {}
  }

  playClick() {
    this.trigger('light')
  }

  playSuccess() {
    this.trigger('success')
  }

  playError() {
    this.trigger('error')
  }

  playMatch() {
    this.trigger('medium')
  }

  playFlip() {
    this.trigger('light')
  }

  playWin() {
    this.trigger('success')
  }

  playMove() {
    this.trigger('light')
  }
}

export const soundManager = new SoundManager()
