"use client"

import { useState } from "react"
import { Button } from "@/registry/proto-lab/ui/button"
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireError,
  QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress, QuestionnaireSkip,
  QuestionnaireSubmit, QuestionnaireTitle,
} from "@/registry/proto-lab/ui/questionnaire"

export default function QuestionnaireDemo() {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="flex w-full max-w-sm flex-col items-start gap-3 text-sm">
        <p>Thanks. Your workshop feedback is saved.</p>
        <Button variant="outline" onClick={() => setDone(false)}>Start again</Button>
      </div>
    )
  }

  return (
    <Questionnaire shortcuts="letters" className="max-w-sm" onSubmit={(e) => { e.preventDefault(); setDone(true) }}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="useful" required>
        <QuestionnaireTitle>How useful was the discovery workshop?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="very">Very useful</QuestionnaireChoice>
          <QuestionnaireChoice value="somewhat">Somewhat useful</QuestionnaireChoice>
          <QuestionnaireChoice value="not">Not useful</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="next" multiple>
        <QuestionnaireTitle>What should the next session cover?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="journeys">Customer journeys</QuestionnaireChoice>
          <QuestionnaireChoice value="data">Data readiness</QuestionnaireChoice>
          <QuestionnaireChoice value="roadmap">Delivery roadmap</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  )
}
