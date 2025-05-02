"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface TextToSpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
  onEnd?: () => void
}

export function useTextToSpeech(options: TextToSpeechOptions = {}) {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const chunksRef = useRef<string[]>([])
  const currentChunkIndexRef = useRef<number>(0)
  const isCancelledRef = useRef<boolean>(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      stop()
    }
  }, [])

  // 음성 재생 중지
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      isCancelledRef.current = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setSpeaking(false)
    }
  }, [])

  // 텍스트를 청크로 나누는 함수
  const splitTextIntoChunks = (text: string, maxLength = 150): string[] => {
    // 텍스트가 짧으면 그대로 반환
    if (text.length <= maxLength) return [text]

    const chunks: string[] = []
    // 문장 단위로 나누기
    const sentences = text.match(/[^.!?]+[.!?]+/g) || []

    let currentChunk = ""

    for (const sentence of sentences) {
      // 현재 청크에 문장을 추가했을 때 최대 길이를 초과하는지 확인
      if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
        // 현재 청크를 배열에 추가하고 새 청크 시작
        chunks.push(currentChunk)
        currentChunk = sentence
      } else {
        // 현재 청크에 문장 추가
        currentChunk += sentence
      }
    }

    // 마지막 청크 추가
    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  // 다음 청크 재생 함수
  const speakNextChunk = useCallback(
    (mergedOptions: TextToSpeechOptions, selectedVoice: SpeechSynthesisVoice | null) => {
      if (isCancelledRef.current || currentChunkIndexRef.current >= chunksRef.current.length) {
        setSpeaking(false)
        if (mergedOptions.onEnd) {
          mergedOptions.onEnd()
        }
        return
      }

      const chunk = chunksRef.current[currentChunkIndexRef.current]
      const utterance = new SpeechSynthesisUtterance(chunk)
      utteranceRef.current = utterance

      // 옵션 설정
      utterance.rate = mergedOptions.rate || 1
      utterance.pitch = mergedOptions.pitch || 1
      utterance.volume = mergedOptions.volume || 1
      utterance.lang = mergedOptions.lang || "en-US"

      // 선택된 음성 설정
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      // 이벤트 핸들러
      utterance.onstart = () => {
        setSpeaking(true)
      }

      utterance.onend = () => {
        // 다음 청크로 이동
        currentChunkIndexRef.current++

        // 약간의 지연 후 다음 청크 재생 (자연스러운 흐름을 위해)
        timeoutRef.current = setTimeout(() => {
          speakNextChunk(mergedOptions, selectedVoice)
        }, 300)
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event)
        currentChunkIndexRef.current++
        speakNextChunk(mergedOptions, selectedVoice)
      }

      // 음성 재생
      window.speechSynthesis.speak(utterance)
    },
    [],
  )

  // 텍스트 읽기
  const speak = useCallback(
    (text: string, customOptions?: TextToSpeechOptions) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return false
      }

      // 이미 재생 중이면 중지
      stop()

      // 기본 옵션 설정
      const defaultOptions = {
        rate: options.rate || 1,
        pitch: options.pitch || 1,
        volume: options.volume || 1,
        lang: options.lang || "en-US",
      }

      const mergedOptions = { ...defaultOptions, ...customOptions }

      // 상태 초기화
      isCancelledRef.current = false
      currentChunkIndexRef.current = 0

      // 긴 텍스트 처리를 위해 청크로 나누기
      chunksRef.current = splitTextIntoChunks(text)

      // 선호하는 음성 선택 (영어 음성 중에서 선택)
      const englishVoices = voices.filter((voice) => voice.lang.includes("en-"))
      const selectedVoice =
        englishVoices.length > 0
          ? englishVoices.find((voice) => voice.name.includes("Female")) || englishVoices[0]
          : null

      // 첫 번째 청크 재생 시작
      speakNextChunk(mergedOptions, selectedVoice)
      setSpeaking(true)

      // 정리 함수 반환
      return () => {
        isCancelledRef.current = true
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
        window.speechSynthesis.cancel()
        setSpeaking(false)
      }
    },
    [voices, stop, options.rate, options.pitch, options.volume, options.lang, speakNextChunk],
  )

  return {
    speak,
    stop,
    speaking,
    supported,
    voices,
  }
}
