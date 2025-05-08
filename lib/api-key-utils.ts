"use client"

// API 키 관련 상수
export const API_KEY_STORAGE_KEY = "openai-api-key"
export const API_KEY_TEST_VALUE = "test-mode-activated"

/**
 * 로컬 스토리지에서 API 키를 가져옵니다.
 * @returns API 키 또는 null (키가 없거나 브라우저 환경이 아닌 경우)
 */
export function getApiKey(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch (error) {
    console.error("API 키를 가져오는 중 오류 발생:", error)
    return null
  }
}

/**
 * 로컬 스토리지에 API 키를 저장합니다.
 * @param apiKey 저장할 API 키
 * @returns 저장 성공 여부
 */
export function saveApiKey(apiKey: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
    return true
  } catch (error) {
    console.error("API 키를 저장하는 중 오류 발생:", error)
    return false
  }
}

/**
 * API 키가 유효한지 확인합니다.
 * @param apiKey 확인할 API 키
 * @returns 유효 여부
 */
export function isApiKeyValid(apiKey: string | null): boolean {
  if (!apiKey) return false

  // 테스트 모드 확인
  if (apiKey === API_KEY_TEST_VALUE) return true

  // 실제 OpenAI API 키 형식 확인 (sk-로 시작하고 길이가 충분한지)
  return apiKey.startsWith("sk-") && apiKey.length > 20
}

/**
 * API 키가 필요한지 확인합니다.
 * @returns 필요 여부
 */
export function isApiKeyRequired(): boolean {
  const apiKey = getApiKey()
  return !isApiKeyValid(apiKey)
}
