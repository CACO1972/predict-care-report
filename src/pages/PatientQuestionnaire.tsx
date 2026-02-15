import RioConversational from "@/components/RioConversational";
import AnswersSummary from "@/components/AnswersSummary";
import IRPProcessingScreen from "@/components/IRPProcessingScreen";
import IRPResultScreen from "@/components/IRPResultScreen";
import UpsellPremiumScreen from "@/components/UpsellPremiumScreen";
import QuestionnaireLayout from "@/components/questionnaire/QuestionnaireLayout";
import { useQuestionnaireFlow } from "@/hooks/useQuestionnaireFlow";
import { useAudioPreload, usePreloadNextAudios } from "@/hooks/useAudioPreload";
import { triggerConfetti } from "@/utils/confetti";
import { calculateRiskAssessment } from "@/utils/riskCalculation";
import { DensityProAnswers, ImplantXAnswers } from "@/types/questionnaire";

import {
  WelcomeStep,
  NameStep,
  DemographicsStep,
  DensityIntroStep,
  DensityQ1Step,
  DensityQ2Step,
  DensityQ3Step,
  DensityQ4Step,
  DensityQ5Step,
  DensityCompleteStep,
  SmokingStep,
  BruxismStep,
  BruxismGuardStep,
  DiabetesStep,
  ImplantHistoryStep,
  ToothLossStep,
  ToothLossTimeStep,
  TeethCountStep,
  GumHealthStep,
  OdontogramStep,
  ProcessingStep,
  ResultsStep
} from "@/components/questionnaire/steps";

interface PatientQuestionnaireProps {
  mode?: 'free' | 'paid';
}

const PatientQuestionnaire = ({ mode = 'free' }: PatientQuestionnaireProps) => {
  const flow = useQuestionnaireFlow(mode);
  
  // Preload all questionnaire audio files on mount
  useAudioPreload();
  
  // Preload next step's audio based on current step
  usePreloadNextAudios(flow.step);

  const renderContent = () => {
    if (flow.showRioResponse) {
      return (
        <RioConversational
          message={flow.feedback}
          isLoading={flow.isLoading}
          onContinue={flow.handleContinueFromRio}
          showContinue={true}
          expression={flow.currentExpression}
          customAudioUrl={flow.feedbackAudioUrl}
        />
      );
    }

    switch (flow.step) {
      case 'welcome':
        return (
          <WelcomeStep
            isMuted={flow.isMuted}
            setIsMuted={flow.setIsMuted}
            welcomeVideoRef={flow.welcomeVideoRef}
            onContinue={() => flow.setStep('name')}
          />
        );

      case 'name':
        return (
          <NameStep
            userProfile={flow.userProfile}
            setUserProfile={flow.setUserProfile}
            onNext={flow.handleNext}
          />
        );

      case 'demographics':
        return (
          <DemographicsStep
            userProfile={flow.userProfile}
            setUserProfile={flow.setUserProfile}
            onNext={flow.handleNext}
          />
        );

      case 'density-intro':
        return <DensityIntroStep userName={flow.userProfile.name} onNext={flow.handleNext} />;

      case 'density-q1':
        return (
          <DensityQ1Step
            densityAnswers={flow.densityAnswers}
            setDensityAnswers={flow.setDensityAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'density-q2':
        return (
          <DensityQ2Step
            densityAnswers={flow.densityAnswers}
            setDensityAnswers={flow.setDensityAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'density-q3':
        return (
          <DensityQ3Step
            densityAnswers={flow.densityAnswers}
            setDensityAnswers={flow.setDensityAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'density-q4':
        return (
          <DensityQ4Step
            densityAnswers={flow.densityAnswers}
            setDensityAnswers={flow.setDensityAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'density-q5':
        return (
          <DensityQ5Step
            densityAnswers={flow.densityAnswers}
            setDensityAnswers={flow.setDensityAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'density-complete':
        return <DensityCompleteStep userName={flow.userProfile.name} onNext={flow.handleNext} />;

      case 'smoking':
        return (
          <SmokingStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'bruxism':
        return (
          <BruxismStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'bruxism-guard':
        return (
          <BruxismGuardStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'diabetes':
        return (
          <DiabetesStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'gum-health':
        return (
          <GumHealthStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            setStep={flow.setStep}
          />
        );

      case 'irp-processing':
        return (
          <IRPProcessingScreen
            patientName={flow.userProfile.name || 'Paciente'}
            onComplete={flow.handleIRPComplete}
          />
        );

      case 'irp-result':
        return flow.irpResult ? (
          <IRPResultScreen
            irpResult={flow.irpResult}
            patientName={flow.userProfile.name || 'Paciente'}
            patientEmail={flow.leadData?.email}
            onContinueFree={() => {
              triggerConfetti();
              flow.setStep('implant-history');
            }}
            onPurchasePlan={flow.handlePurchasePlan}
            onSaveStateForPayment={flow.saveStateForPayment}
            mode={mode}
          />
        ) : null;

      case 'upsell-premium':
        if (mode === 'free') {
          flow.setStep('implant-history');
          return null;
        }
        return (
          <UpsellPremiumScreen
            patientName={flow.userProfile.name || 'Paciente'}
            patientEmail={flow.leadData?.email}
            onUpgrade={flow.handleUpgradeToPremium}
            onSkip={flow.handleSkipUpsell}
            onSaveStateForPayment={flow.saveStateForPayment}
          />
        );

      case 'implant-history':
        return (
          <ImplantHistoryStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'tooth-loss':
        return (
          <ToothLossStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'tooth-loss-time':
        return (
          <ToothLossTimeStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'teeth-count':
        return (
          <TeethCountStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            onAnswer={flow.handleAnswerWithRioFeedback}
            getNextStepFunction={flow.getNextStepFunction}
          />
        );

      case 'odontogram':
        return (
          <OdontogramStep
            implantAnswers={flow.implantAnswers}
            setImplantAnswers={flow.setImplantAnswers}
            userName={flow.userProfile.name}
            purchaseLevel={flow.purchaseLevel}
            setUploadedImage={flow.setUploadedImage}
            setImageAnalysis={flow.setImageAnalysis}
            setStep={flow.setStep}
          />
        );

      case 'summary':
        return (
          <AnswersSummary
            userProfile={flow.userProfile}
            densityAnswers={flow.densityAnswers}
            implantAnswers={flow.implantAnswers}
            requiresDensityPro={flow.requiresDensityPro}
            uploadedImage={flow.uploadedImage}
            onConfirm={() => {
              flow.setStep('processing');
              triggerConfetti();
              setTimeout(() => {
                const result = calculateRiskAssessment(
                  flow.requiresDensityPro ? flow.densityAnswers as DensityProAnswers : null,
                  flow.implantAnswers as ImplantXAnswers,
                  flow.userProfile.age
                );
                flow.handleLeadSubmit({ email: '', phone: '' });
              }, 3000);
            }}
            onEdit={() => flow.setStep('name')}
          />
        );

      case 'processing':
        return <ProcessingStep userName={flow.userProfile.name} />;

      case 'results':
        if (!flow.assessmentResult) return null;
        return (
          <ResultsStep
            assessmentResult={flow.assessmentResult}
            userProfile={flow.userProfile}
            implantAnswers={flow.implantAnswers}
            densityAnswers={flow.densityAnswers}
            requiresDensityPro={flow.requiresDensityPro}
            irpResult={flow.irpResult}
            purchaseLevel={flow.purchaseLevel}
            uploadedImage={flow.uploadedImage}
            imageAnalysis={flow.imageAnalysis}
          />
        );

      default:
        return null;
    }
  };

  return (
    <QuestionnaireLayout
      step={flow.step}
      showRioResponse={flow.showRioResponse}
      canGoBack={flow.canGoBack()}
      onBack={flow.handleBack}
      getStepNumber={flow.getStepNumber}
      getTotalSteps={flow.getTotalSteps}
      getCurrentPhase={flow.getCurrentPhase}
      showLeadCapture={flow.showLeadCapture}
      onLeadSubmit={flow.handleLeadSubmit}
      patientName={flow.userProfile.name}
    >
      {renderContent()}
    </QuestionnaireLayout>
  );
};

export default PatientQuestionnaire;
