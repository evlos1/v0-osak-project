"use client"

// API 키 관련 상수
export const API_KEY_STORAGE_KEY = "google-gemini-api-key" // 스토리지 키 이름을 좀 더 명확하게 변경
export const API_KEY_TEST_VALUE = "test-mode-activated"

/**
 * 로컬 스토리지에서 API 키를 가져옵니다.
 * @returns API 키 또는 null (키가 없거나 브라우저 환경이 아닌 경우)
 */
export function getApiKey(): string | null {
  if (typeof window === "undefined") {
    // 브라우저 환경이 아니면 (SSR 등) 접근 불가
    return null
  }

  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY)
  } catch (error) {
    // localStorage 접근 중 예외 발생 시 (예: Private Mode에서 접근 제한)
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
    // 브라우저 환경이 아니면 저장 불가
    return false
  }

  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey)
    return true
  } catch (error) {
    // localStorage 접근 중 예외 발생 시 (예: Private Mode에서 접근 제한)
    console.error("API 키를 저장하는 중 오류 발생:", error)
    return false
  }
}

/**
 * API 키가 유효한지 확인합니다.
 * Google Gemini API 키 형식을 기준으로 검사합니다.
 * @param apiKey 확인할 API 키
 * @returns 유효 여부
 */
export function isApiKeyValid(apiKey: string | null): boolean {
  if (!apiKey) {
    // 키가 null이거나 빈 문자열이면 유효하지 않음
    return false
  }

  // 테스트 모드 값이라면 유효함
  if (apiKey === API_KEY_TEST_VALUE) {
    return true
  }

  // 실제 Google Gemini API 키 형식 확인 (AIza로 시작하고 길이가 39자인 경우가 많음)
  // 이 정규식은 Google Cloud API 키의 일반적인 패턴을 따릅니다.
  // 정확한 패턴은 Google 문서에서 확인하는 것이 가장 좋습니다.
  const googleApiKeyPattern = /^AIza[0-9A-Za-z-_]{35}$/;
  
  // 시작 부분만 확인하거나, 최소 길이만 확인하는 등 유연하게 조정할 수 있습니다.
  // 예: return apiKey.startsWith("AIza") && apiKey.length >= 39;
  return googleApiKeyPattern.test(apiKey);
}

/**
 * 애플리케이션에 API 키가 필요한지 확인합니다.
 * 저장된 키가 없거나 유효하지 않으면 필요하다고 판단합니다.
 * @returns API 키 필요 여부 (true: 필요함, false: 필요 없음)
 */
export function isApiKeyRequired(): boolean {
  const apiKey = getApiKey();
  // 저장된 API 키가 없거나 유효하지 않으면 API 키가 필요하다고 판단
  return !isApiKeyValid(apiKey);
}