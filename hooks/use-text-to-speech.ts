"use client"

import { useState, useEffect, useCallback } from "react"

interface TextToSpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  // 음성 목록 로드
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // 초기 음성 목록 설정
      setVoices(window.speechSynthesis.getVoices())

      // 음성 목록이 변경될 때 업데이트
      const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices())
      }

      window.speechSynthesis.addEventListener("voiceschanged", handleVoicesChanged)

      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoicesChanged)
      }
    } else {
      setSupported(false)
    }
  }, [])

  // 음성 재생 중지
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [])

  // 텍스트 읽기
  const speak = useCallback(
    (text: string, customOptions?: TextToSpeechOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return false
      }

      // 이미 재생 중이면 중지
      stop()

      // 기본 옵션 설정 (speak 함수 내에서 정의)
      const defaultOptions = {
        rate: options.rate || 1,
        pitch: options.pitch || 1,
        volume: options.volume || 1,
        lang: options.lang || "en-US",
      }

      const mergedOptions = { ...defaultOptions, ...customOptions }
      const utterance = new SpeechSynthesisUtterance(text)

      // 옵션 설정
      utterance.rate = mergedOptions.rate
      utterance.pitch = mergedOptions.pitch
      utterance.volume = mergedOptions.volume
      utterance.lang = mergedOptions.lang

      // 선호하는 음성 선택 (영어 음성 중에서 선택)
      const englishVoices = voices.filter((voice) => voice.lang.includes("en-"))
      if (englishVoices.length > 0) {
        // 여성 음성을 선호 (일반적으로 더 명확함)
        const femaleVoice = englishVoices.find((voice) => voice.name.includes("Female"))
        utterance.voice = femaleVoice || englishVoices[0]
      }

      // 이벤트 핸들러
      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      // 음성 재생
      window.speechSynthesis.speak(utterance)
      return true
    },
    [voices, stop, options.rate, options.pitch, options.volume, options.lang],
  )

  return {
    speak,
    stop,
    speaking,
    supported,
    voices,
  }
}
