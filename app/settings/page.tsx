"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Make sure this is 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTranslation } from "@/app/i18n"
import { getApiKey, saveApiKey, API_KEY_TEST_VALUE } from "@/lib/api-key-utils"

// 학습자 레벨 평가 페이지의 올바른 경로
const ENGLISH_LEVEL_EVALUATION_PAGE_PATH = "/level-assessment";

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [testMode, setTestMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // 에러 메시지 상태
  const [redirecting, setRedirecting] = useState(false); // 리디렉션 중임을 나타내는 새 상태

  // 컴포넌트 마운트 시 API 키 로드 및 자동 리디렉션
  useEffect(() => {
    // 이펙트가 실행되는 횟수를 제한하고, 이미 리디렉션 중이거나 라우터가 준비되지 않았으면 아무것도 하지 않음
    if (redirecting) {
        return;
    }

    try {
      const storedApiKey = getApiKey();
      console.log("설정 페이지 - 저장된 API 키 로드:", storedApiKey ? "존재함" : "없음");

      if (storedApiKey) {
        // API 키가 존재하면 바로 다음 페이지로 이동
        console.log("저장된 API 키가 있어 바로 레벨 평가 페이지로 이동합니다.");
        setRedirecting(true); // 리디렉션 시작임을 표시
        router.replace(ENGLISH_LEVEL_EVALUATION_PAGE_PATH);
        // 리디렉션이 시작되었으므로, 여기서 더 이상 로딩 상태를 해제하지 않고 컴포넌트 렌더링을 멈춤
        return; // 이펙트의 나머지 부분을 실행하지 않음
      } else {
        // API 키가 없으면 로딩 상태를 해제하고 설정을 표시
        setIsLoading(false);
      }
    } catch (error) {
      console.error("API 키 로드 중 오류:", error);
      setErrorMessage(t("error_loading_api_key"));
      setIsLoading(false); // 오류 발생 시에도 로딩 해제
    }
  }, [router, t, redirecting]); // redirecting 상태를 의존성 배열에 추가

  // API 키 저장 처리
  const handleSave = () => {
    setErrorMessage(null);
    try {
      const keyToSave = testMode ? API_KEY_TEST_VALUE : apiKey.trim();

      if (!testMode && !keyToSave) {
        setErrorMessage(t("api_key_cannot_be_empty"));
        return;
      }

      const success = saveApiKey(keyToSave);

      if (success) {
        console.log("API 키 저장 성공:", testMode ? "TEST MODE" : "실제 키");
        setSaveSuccess(true);
        setErrorMessage(null);

        // 저장 성공 메시지를 잠시 보여준 후, 다음 페이지로 이동
        setRedirecting(true); // 리디렉션 시작임을 표시
        setTimeout(() => {
          router.push(ENGLISH_LEVEL_EVALUATION_PAGE_PATH);
        }, 1500);
      } else {
        console.error("API 키 저장 실패");
        setErrorMessage(t("error_saving_api_key"));
      }
    } catch (error) {
      console.error("API 키 저장 중 오류:", error);
      setErrorMessage(t("error_saving_api_key_generic"));
    }
  };

  // 테스트 모드 토글 처리
  const handleTestModeToggle = (checked: boolean) => {
    setTestMode(checked);
    if (checked) {
      setApiKey("");
    }
    setErrorMessage(null);
  };

  // 뒤로 가기 처리
  const handleBack = () => {
    router.back();
  };

  // 리디렉션 중이거나 로딩 중일 때 로딩 UI 표시
  if (isLoading || redirecting) {
    return <div className="flex justify-center items-center min-h-screen text-gray-700">로딩 중 설정 확인 또는 페이지 이동 중...</div>;
  }

  // API 키가 없어 설정 페이지가 렌더링될 경우
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{t("settings")}</CardTitle>
          <CardDescription>{t("settings_description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-mode">{t("test_mode")}</Label>
            <div className="flex items-center space-x-2">
              <Switch id="test-mode" checked={testMode} onCheckedChange={handleTestModeToggle} />
              <span>{testMode ? t("test_mode_on") : t("test_mode_off")}</span>
            </div>
            <p className="text-sm text-gray-500">{t("test_mode_description")}</p>
          </div>

          {!testMode && (
            <div className="space-y-2">
              <Label htmlFor="api-key">{t("api_key")}</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t("enter_api_key")}
                disabled={testMode}
              />
              <p className="text-sm text-gray-500">{t("api_key_description")}</p>
            </div>
          )}

          {saveSuccess && (
            <div className="bg-green-100 text-green-700 p-2 rounded text-center">
              {t("settings_saved_redirecting")}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-center">
              {errorMessage}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            {t("back")}
          </Button>
          <Button onClick={handleSave}>
            {t("save")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}