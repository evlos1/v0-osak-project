"use client"

import type { EtymologyTimeline } from "@/app/actions/dictionary"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { History, ArrowRight } from "lucide-react"

interface EtymologyTimelineProps {
  timeline: EtymologyTimeline
}

export function EtymologyTimelineVisual({ timeline }: EtymologyTimelineProps) {
  const { t } = useTranslation()

  if (!timeline || !timeline.stages || timeline.stages.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>{t("no_etymology_timeline")}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* 타임라인 선 */}
        <div className="absolute left-4 top-6 h-[calc(100%-2rem)] w-0.5 bg-primary/20"></div>

        {/* 타임라인 단계들 */}
        <div className="space-y-8 relative">
          {timeline.stages.map((stage, index) => (
            <div key={index} className="relative pl-10">
              {/* 타임라인 원 */}
              <div className="absolute left-[0.9rem] top-1.5 -translate-x-1/2 h-6 w-6 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                <History className="h-3 w-3 text-primary" />
              </div>

              {/* 단계 내용 */}
              <div className="bg-muted p-3 rounded-md">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-primary/5">
                    {stage.period || t("unknown_period")}
                  </Badge>
                  {stage.year && (
                    <Badge variant="outline" className="bg-primary/5">
                      {stage.year}
                    </Badge>
                  )}
                  {stage.language && (
                    <Badge variant="outline" className="bg-primary/5">
                      {stage.language}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{stage.word}</span>
                  {stage.meaning && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{stage.meaning}</span>
                    </>
                  )}
                </div>
              </div>

              {/* 연결선 (마지막 항목 제외) */}
              {index < timeline.stages.length - 1 && timeline.connections && timeline.connections[index] && (
                <div className="ml-3 mt-2 mb-2 text-xs text-muted-foreground italic">{timeline.connections[index]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EtymologyTimelineVisual
