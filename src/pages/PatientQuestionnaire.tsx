import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import RioAvatar from "@/components/RioAvatar";
import RioConversational from "@/components/RioConversational";
import RioAvatarExpressive from "@/components/RioAvatarExpressive";
import RioWelcomeAvatar from "@/components/RioWelcomeAvatar";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import ReportPreview from "@/components/ReportPreview";
import ImageUpload from "@/components/ImageUpload";
import AnswersSummary from "@/components/AnswersSummary";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import IRPProcessingScreen from "@/components/IRPProcessingScreen";
import IRPResultScreen from "@/components/IRPResultScreen";
import UpsellPremiumScreen from "@/components/UpsellPremiumScreen";
import { UserProfile, DensityProAnswers, ImplantXAnswers, QuestionnaireStep, PurchaseLevel } from "@/types/questionnaire";
import { calculateRiskAssessment, EnhancedAssessmentResult } from "@/utils/riskCalculation";
import { calculateIRP, IRPResult } from "@/utils/irpCalculation";
import { getQuestionConfig } from "@/utils/questionConfig";
import { useRioFeedback } from "@/hooks/useRioFeedback";
import { useRioExpression, RioExpression, getFeedbackTypeFromAnswer } from "@/hooks/useRioExpression";
import { Loader2, Sparkles, Shield, Clock, Award, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import logoMiro from "@/assets/logo-miro-largo-blanco.png";
import { triggerConfetti } from "@/utils/confetti";

// Map question IDs to their labels for Rio's context
const getAnswerLabel = (questionId: string, value: string): string => {
  const labelMaps: Record<string, Record<string, string>> = {
    fractures: { no: 'No', once: 'Sí, una vez', multiple: 'Sí, más de una vez' },
    heightLoss: { no: 'No', yes: 'Sí, he perdido un poco de altura', unsure: 'No estoy seguro/a' },
    familyHistory: { no: 'No', yes: 'Sí', unknown: 'No lo sé' },
    corticosteroids: { no: 'No', yes: 'Sí', unsure: 'No estoy seguro/a' },
    alcohol: { no: 'No', yes: 'Sí' },
    smoking: { no: 'No', 'less-10': 'Sí, menos de 10 cigarrillos al día', '10-plus': 'Sí, 10 o más cigarrillos al día' },
    bruxism: { no: 'No', unsure: 'No estoy seguro/a', yes: 'Sí' },
    bruxismGuard: { no: 'No', yes: 'Sí' },
    diabetes: { no: 'No', controlled: 'Sí, y está controlada', uncontrolled: 'Sí, y no está bien controlada' },
    implantHistory: { no: 'No, este sería mi primer implante', success: 'Sí, y siguen funcionando bien', failed: 'Sí, pero fracasaron' },
    toothLossCause: { cavity: 'Por una caries', periodontitis: 'Por enfermedad de las encías', trauma: 'Por un golpe o accidente', other: 'Otra razón' },
    toothLossTime: { 'less-1': 'Menos de 1 año', '1-3': 'Entre 1 y 3 años', 'more-3': 'Más de 3 años' },
    gumBleeding: { never: 'Nunca o casi nunca', sometimes: 'A veces', frequently: 'Frecuentemente' },
    oralHygiene: { 'less-once': 'Menos de una vez', once: 'Una vez', 'twice-plus': 'Dos o más veces' },
    implantZones: { 'anterior-superior': 'Zona anterior superior', 'posterior-superior': 'Zona posterior superior', 'anterior-inferior': 'Zona anterior inferior', 'posterior-inferior': 'Zona posterior inferior' },
  };
  return labelMaps[questionId]?.[value] || value;
};

// Map question IDs to their question text
const getQuestionText = (questionId: string): string => {
  const questionTexts: Record<string, string> = {
    fractures: '¿Alguna vez has tenido una fractura de hueso después de una caída o golpe menor como adulto?',
    heightLoss: '¿Has notado una disminución en tu estatura en los últimos años?',
    familyHistory: '¿Alguno de tus padres fue diagnosticado con osteoporosis o sufrió una fractura de cadera?',
    corticosteroids: '¿Has tomado medicamentos corticoides de forma regular por más de 3 meses?',
    alcohol: '¿Consumes más de dos bebidas alcohólicas al día de forma habitual?',
    smoking: '¿Fumas actualmente?',
    bruxism: '¿Aprietas o rechinas los dientes?',
    bruxismGuard: '¿Usas una férula de descarga nocturna?',
    diabetes: '¿Tienes diabetes?',
    implantHistory: '¿Has tenido implantes dentales anteriormente?',
    toothLossCause: '¿Cuál fue el motivo principal de la pérdida del diente?',
    toothLossTime: '¿Hace cuánto tiempo perdiste el diente o dientes?',
    gumBleeding: '¿Sangran tus encías cuando te cepillas los dientes?',
    oralHygiene: '¿Cuántas veces al día te cepillas los dientes?',
    implantZones: '¿En qué zona de la boca necesitas el implante?',
  };
  return questionTexts[questionId] || questionId;
};

const PatientQuestionnaire = () => {
  const [step, setStep] = useState<QuestionnaireStep>('welcome');
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [densityAnswers, setDensityAnswers] = useState<Partial<DensityProAnswers>>({});
  const [implantAnswers, setImplantAnswers] = useState<Partial<ImplantXAnswers>>({});
  const [assessmentResult, setAssessmentResult] = useState<EnhancedAssessmentResult | null>(null);
  const [irpResult, setIrpResult] = useState<IRPResult | null>(null);
  const [purchaseLevel, setPurchaseLevel] = useState<PurchaseLevel>('free');
  const [showRioResponse, setShowRioResponse] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<(() => void) | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [currentExpression, setCurrentExpression] = useState<RioExpression>('encouraging');
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [leadData, setLeadData] = useState<{ email: string; phone: string } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const welcomeVideoRef = useRef<HTMLVideoElement>(null);
  const [feedbackAudioUrl, setFeedbackAudioUrl] = useState<string | undefined>(undefined);

  const { feedback, isLoading, generateFeedback, clearFeedback } = useRioFeedback();
  const { getExpressionFromFeedback } = useRioExpression();

  const requiresDensityPro = userProfile.gender === 'female' && (userProfile.age || 0) > 45;

  // Get previous step for back navigation
  const getPreviousStep = (): QuestionnaireStep | null => {
    const baseSteps: QuestionnaireStep[] = ['welcome', 'name', 'demographics'];
    const densitySteps: QuestionnaireStep[] = ['density-intro', 'density-q1', 'density-q2', 'density-q3', 'density-q4', 'density-q5', 'density-complete'];
    const healthSteps: QuestionnaireStep[] = ['smoking', 'bruxism', 'bruxism-guard', 'diabetes'];
    const irpSteps: QuestionnaireStep[] = ['gum-health', 'irp-processing', 'irp-result'];
    const oralSteps: QuestionnaireStep[] = ['implant-history', 'tooth-loss', 'tooth-loss-time', 'teeth-count', 'odontogram', 'summary'];
    
    let allSteps = [...baseSteps];
    if (requiresDensityPro) {
      allSteps = [...allSteps, ...densitySteps];
    }
    allSteps = [...allSteps, ...healthSteps, ...irpSteps, ...oralSteps];
    
    // Handle bruxism-guard conditional step
    if (step === 'diabetes' && implantAnswers.bruxism !== 'yes') {
      return 'bruxism';
    }
    
    const currentIndex = allSteps.indexOf(step);
    if (currentIndex <= 0) return null;
    
    const prevStep = allSteps[currentIndex - 1];
    
    // Skip bruxism-guard if bruxism is not 'yes'
    if (prevStep === 'bruxism-guard' && implantAnswers.bruxism !== 'yes') {
      return 'bruxism';
    }
    
    // No volver atrás desde IRP result
    if (step === 'irp-result' || step === 'irp-processing') {
      return null;
    }
    
    return prevStep;
  };

  const handleBack = () => {
    setShowRioResponse(false);
    clearFeedback();
    const prevStep = getPreviousStep();
    if (prevStep) {
      setStep(prevStep);
    }
  };

  const canGoBack = (): boolean => {
    const noBackSteps: QuestionnaireStep[] = ['welcome', 'processing', 'results', 'irp-processing', 'irp-result'];
    return !noBackSteps.includes(step) && getPreviousStep() !== null;
  };

  const getStepNumber = (): number => {
    const steps: QuestionnaireStep[] = ['welcome', 'name', 'demographics'];
    if (requiresDensityPro) {
      steps.push('density-intro', 'density-q1', 'density-q2', 'density-q3', 'density-q4', 'density-q5', 'density-complete');
    }
    steps.push('smoking', 'bruxism', 'bruxism-guard', 'diabetes', 'gum-health', 'irp-processing', 'irp-result', 'implant-history', 'tooth-loss', 'tooth-loss-time', 'teeth-count', 'odontogram', 'summary', 'processing', 'results');
    return steps.indexOf(step) + 1;
  };

  const getTotalSteps = (): number => {
    return requiresDensityPro ? 24 : 18;
  };

  const getCurrentPhase = (): 'base' | 'density' | 'health' | 'irp' | 'oral' | 'mapping' | 'complete' => {
    if (['welcome', 'name', 'demographics'].includes(step)) return 'base';
    if (step.startsWith('density')) return 'density';
    if (['smoking', 'bruxism', 'bruxism-guard', 'diabetes'].includes(step)) return 'health';
    if (['gum-health', 'irp-processing', 'irp-result'].includes(step)) return 'irp';
    if (['implant-history', 'tooth-loss', 'tooth-loss-time', 'teeth-count'].includes(step)) return 'oral';
    if (step === 'odontogram' || step === 'summary') return 'mapping';
    return 'complete';
  };

  const handleContinueFromRio = () => {
    setShowRioResponse(false);
    clearFeedback();
    if (pendingNextStep) {
      pendingNextStep();
      setPendingNextStep(null);
    }
  };

  // Get custom audio URL for specific question answers
  const getCustomAudioForFeedback = (questionId: string, value: string): string | undefined => {
    if (questionId === 'smoking') {
      if (value === 'no') return '/audio/rio-nofuma.mp3';
      if (value === 'less-10') return '/audio/rio-menosde10.mp3';
      if (value === '10-plus') return '/audio/rio-masde10.mp3';
    }
    if (questionId === 'bruxism') {
      if (value === 'no') return '/audio/rio-nobruxa.mp3';
      if (value === 'yes' || value === 'unsure') return '/audio/rio-sibruxa.mp3';
    }
    if (questionId === 'diabetes') {
      if (value === 'no') return '/audio/rio-nodiabetes.mp3';
      if (value === 'controlled') return '/audio/rio-diabetes-controlada.mp3';
      if (value === 'uncontrolled') return '/audio/rio-diabetes-nocontrolada.mp3';
    }
    if (questionId === 'implantHistory') {
      if (value === 'no') return '/audio/rio-primer-implante.mp3';
      if (value === 'success') return '/audio/rio-implante-bien.mp3';
      if (value === 'failed') return '/audio/rio-implante-fallaron.mp3';
    }
    if (questionId === 'toothLossCause') {
      if (value === 'cavity') return '/audio/rio-causa-caries.mp3';
      if (value === 'periodontitis') return '/audio/rio-causa-periodontitis.mp3';
      if (value === 'trauma') return '/audio/rio-causa-trauma.mp3';
    }
    if (questionId === 'toothLossTime') {
      if (value === 'less-1') return '/audio/rio-tiempo-menos1.mp3';
      if (value === '1-3') return '/audio/rio-tiempo-1a3.mp3';
      if (value === 'more-3') return '/audio/rio-tiempo-masde3.mp3';
    }
    if (questionId === 'teethCount') {
      if (value === '1-2') return '/audio/rio-feedback-1a2.mp3';
      if (value === '3-8') return '/audio/rio-feedback-puente.mp3';
      if (value === 'all') return '/audio/rio-feedback-todos.mp3';
    }
    return undefined;
  };

  const handleAnswerWithRioFeedback = async (
    questionId: string,
    value: string,
    nextStepFn: () => void
  ) => {
    const config = getQuestionConfig(questionId);
    const patientName = userProfile.name || 'Paciente';
    
    // Set expression based on answer feedback type
    const feedbackType = getFeedbackTypeFromAnswer(questionId, value);
    setCurrentExpression(getExpressionFromFeedback(feedbackType));
    
    // Set custom audio URL if available for this question/answer
    const customAudio = getCustomAudioForFeedback(questionId, value);
    setFeedbackAudioUrl(customAudio);
    
    setShowRioResponse(true);
    setPendingNextStep(() => nextStepFn);

    await generateFeedback({
      questionId,
      questionText: getQuestionText(questionId),
      answerValue: value,
      answerLabel: getAnswerLabel(questionId, value),
      patientName,
      questionComplexity: config.complexity,
      clinicalContext: config.clinicalContext,
    });
  };

  const handleNext = () => {
    setShowRioResponse(false);
    clearFeedback();
    
    if (step === 'name') {
      setStep('demographics');
      return;
    }
    
    if (step === 'demographics' && requiresDensityPro) {
      setStep('density-intro');
      return;
    } else if (step === 'demographics') {
      setStep('smoking');
      return;
    }

    if (step === 'density-intro') setStep('density-q1');
    else if (step === 'density-q1') setStep('density-q2');
    else if (step === 'density-q2') setStep('density-q3');
    else if (step === 'density-q3') setStep('density-q4');
    else if (step === 'density-q4') setStep('density-q5');
    else if (step === 'density-q5') {
      setStep('density-complete');
      setTimeout(() => triggerConfetti(), 300);
    }
    else if (step === 'density-complete') setStep('smoking');
    else if (step === 'smoking') setStep('bruxism');
    else if (step === 'bruxism') {
      // Si tiene bruxismo, preguntar por férula; si no, saltar a diabetes
      if (implantAnswers.bruxism === 'yes') {
        setStep('bruxism-guard');
      } else {
        setImplantAnswers({ ...implantAnswers, bruxismGuard: 'not-applicable' });
        setStep('diabetes');
      }
    }
    else if (step === 'bruxism-guard') setStep('diabetes');
    else if (step === 'diabetes') setStep('gum-health');
    else if (step === 'gum-health') setStep('irp-processing');
    else if (step === 'irp-result') setStep('implant-history');
    else if (step === 'implant-history') setStep('tooth-loss');
    else if (step === 'tooth-loss') setStep('tooth-loss-time');
    else if (step === 'tooth-loss-time') setStep('teeth-count');
    else if (step === 'teeth-count') setStep('odontogram');
    else if (step === 'odontogram') {
      setStep('processing');
      triggerConfetti();
      setTimeout(() => {
        const result = calculateRiskAssessment(
          requiresDensityPro ? densityAnswers as DensityProAnswers : null,
          implantAnswers as ImplantXAnswers,
          userProfile.age
        );
        setAssessmentResult(result);
        // Show lead capture before results
        setShowLeadCapture(true);
      }, 3000);
    }
  };

  // Create step transition functions
  const getNextStepFunction = (currentStep: QuestionnaireStep): () => void => {
    const transitions: Record<string, () => void> = {
      'density-q1': () => setStep('density-q2'),
      'density-q2': () => setStep('density-q3'),
      'density-q3': () => setStep('density-q4'),
      'density-q4': () => setStep('density-q5'),
      'density-q5': () => { setStep('density-complete'); setTimeout(() => triggerConfetti(), 300); },
      'smoking': () => setStep('bruxism'),
      'bruxism': () => {
        // Si tiene bruxismo, preguntar por férula; si no, saltar a diabetes
        if (implantAnswers.bruxism === 'yes') {
          setStep('bruxism-guard');
        } else {
          setImplantAnswers(prev => ({ ...prev, bruxismGuard: 'not-applicable' }));
          setStep('diabetes');
        }
      },
      'bruxism-guard': () => setStep('diabetes'),
      'diabetes': () => setStep('gum-health'),
      'gum-health': () => setStep('irp-processing'),
      'irp-result': () => setStep('implant-history'),
      'implant-history': () => setStep('tooth-loss'),
      'tooth-loss': () => setStep('tooth-loss-time'),
      'tooth-loss-time': () => setStep('teeth-count'),
      'teeth-count': () => setStep('odontogram'),
      'odontogram': () => {
        setStep('processing');
        triggerConfetti();
        setTimeout(() => {
          const result = calculateRiskAssessment(
            requiresDensityPro ? densityAnswers as DensityProAnswers : null,
            implantAnswers as ImplantXAnswers,
            userProfile.age
          );
          setAssessmentResult(result);
          // Show lead capture before results
          setShowLeadCapture(true);
        }, 3000);
      },
    };
    return transitions[currentStep] || (() => {});
  };

  const renderContent = () => {
    // If showing Rio's response, render it prominently
    if (showRioResponse) {
      return (
        <RioConversational
          message={feedback}
          isLoading={isLoading}
          onContinue={handleContinueFromRio}
          showContinue={true}
          expression={currentExpression}
          customAudioUrl={feedbackAudioUrl}
        />
      );
    }

    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-8 animate-fade-in text-center">
            {/* Premium Welcome Card */}
            <div className="relative bg-gradient-to-b from-card to-card/80 border border-primary/20 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              
              {/* Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              {/* Video de bienvenida */}
              <div className="relative w-full max-w-sm mx-auto mb-6">
                <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl shadow-primary/10 bg-background aspect-[9/16]">
                  <video
                    ref={welcomeVideoRef}
                    src="/rio-consent-video.mp4"
                    autoPlay
                    playsInline
                    muted={isMuted}
                    loop
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Sound toggle button */}
                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (welcomeVideoRef.current) {
                        welcomeVideoRef.current.muted = !isMuted;
                      }
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-foreground/70" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-primary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Consent Section */}
              <div className="mt-6 p-4 bg-background/50 border border-border/50 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-4">
                  Al continuar, acepto que mis datos serán procesados de forma anónima y segura para generar mi evaluación personalizada.
                </p>
                <Button
                  onClick={() => setStep('name')}
                  className="w-full h-14 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Acepto y Continúo
                </Button>
              </div>

              {/* Trust badges - Premium */}
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">100% Privado</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">5 minutos</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/70">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Reporte PDF</span>
                </div>
              </div>
            </div>

          </div>
        );

      case 'name':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="Para empezar, por favor dime tu nombre." customAudioUrl="/audio/rio-nombre.mp3" />
            <QuestionCard
              question="¿Cuál es tu nombre?"
              type="text"
              value={userProfile.name}
              onChange={(value) => setUserProfile({ ...userProfile, name: value as string })}
              onNext={handleNext}
              nextButtonText="Continuar"
            />
          </div>
        );

      case 'demographics':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`¡Un gusto, ${userProfile.name}! Ahora necesito algunos datos básicos para personalizar tu evaluación.`}
              userName={userProfile.name}
              customAudioUrl="/audio/rio-edad.mp3"
            />
            <QuestionCard
              question="¿Cuál es tu edad?"
              type="number"
              value={userProfile.age}
              onChange={(value) => setUserProfile({ ...userProfile, age: value as number })}
              onNext={() => {}}
              hideNextButton={true}
              disabled={!userProfile.age}
            />
            {userProfile.age && (
              <QuestionCard
                question="¿Cuál es tu género?"
                type="gender"
                value={userProfile.gender}
                onChange={(value) => {
                  setUserProfile({ ...userProfile, gender: value as 'male' | 'female' | 'other' });
                }}
                onNext={() => {}}
                hideNextButton={true}
              />
            )}
            {userProfile.age && userProfile.gender && (
              <Button 
                onClick={handleNext}
                size="lg" 
                className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
              >
                Continuar →
              </Button>
            )}
          </div>
        );

      case 'density-intro':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`Hola {name}, he notado por tu edad y género que es importante evaluar tu salud ósea. Estas preguntas nos ayudarán a entender la calidad de tus huesos.`}
              userName={userProfile.name}
            />
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              Comenzar Evaluación Ósea
            </Button>
          </div>
        );

      case 'density-q1':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="Comencemos con tu historial médico." userName={userProfile.name} />
            <QuestionCard
              question="¿Alguna vez has tenido una fractura de hueso (ej. muñeca, cadera, columna) después de una caída o golpe menor como adulto?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'once', label: 'Sí, una vez' },
                { value: 'multiple', label: 'Sí, más de una vez' },
              ]}
              value={densityAnswers.fractures}
              onChange={(value) => {
                setDensityAnswers({ ...densityAnswers, fractures: value as any });
                handleAnswerWithRioFeedback('fractures', value as string, getNextStepFunction('density-q1'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'density-q2':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="Ahora, sobre algunos cambios que quizás hayas notado." userName={userProfile.name} />
            <QuestionCard
              question="¿Has notado una disminución en tu estatura en los últimos años?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Sí, he perdido un poco de altura' },
                { value: 'unsure', label: 'No estoy seguro/a' },
              ]}
              value={densityAnswers.heightLoss}
              onChange={(value) => {
                setDensityAnswers({ ...densityAnswers, heightLoss: value as any });
                handleAnswerWithRioFeedback('heightLoss', value as string, getNextStepFunction('density-q2'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'density-q3':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="La genética también juega un papel importante." userName={userProfile.name} />
            <QuestionCard
              question="¿Alguno de tus padres fue diagnosticado con osteoporosis o sufrió una fractura de cadera después de una caída leve?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Sí' },
                { value: 'unknown', label: 'No lo sé' },
              ]}
              value={densityAnswers.familyHistory}
              onChange={(value) => {
                setDensityAnswers({ ...densityAnswers, familyHistory: value as any });
                handleAnswerWithRioFeedback('familyHistory', value as string, getNextStepFunction('density-q3'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'density-q4':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="Ciertos medicamentos pueden afectar la salud de los huesos." userName={userProfile.name} />
            <QuestionCard
              question="¿Has tomado o tomas actualmente medicamentos corticoides (como prednisona o cortisona) de forma regular por más de 3 meses?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Sí' },
                { value: 'unsure', label: 'No estoy seguro/a' },
              ]}
              value={densityAnswers.corticosteroids}
              onChange={(value) => {
                setDensityAnswers({ ...densityAnswers, corticosteroids: value as any });
                handleAnswerWithRioFeedback('corticosteroids', value as string, getNextStepFunction('density-q4'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'density-q5':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar message="Finalmente, algunos hábitos de vida." userName={userProfile.name} />
            <QuestionCard
              question="¿Consumes más de dos bebidas alcohólicas al día de forma habitual?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Sí' },
              ]}
              value={densityAnswers.alcohol}
              onChange={(value) => {
                setDensityAnswers({ ...densityAnswers, alcohol: value as any });
                handleAnswerWithRioFeedback('alcohol', value as string, getNextStepFunction('density-q5'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'density-complete':
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-8 bg-background border border-border rounded-2xl shadow-sm">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Sección Completada</h3>
              <p className="text-muted-foreground">Evaluación ósea finalizada</p>
            </div>
            <RioAvatar 
              message="¡Gracias, {name}! He analizado tus respuestas. Continuemos con el cuestionario principal."
              userName={userProfile.name}
            />
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
              Continuar →
            </Button>
          </div>
        );

      case 'smoking':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`Perfecto, ${userProfile.name}. Hablemos ahora de algunos hábitos. Tu honestidad es clave para darte el mejor tratamiento posible.`}
              userName={userProfile.name}
              customAudioUrl="/audio/rio-fuma.mp3"
            />
            <QuestionCard
              question="¿Fumas actualmente?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'less-10', label: 'Sí, menos de 10 cigarrillos al día' },
                { value: '10-plus', label: 'Sí, 10 o más cigarrillos al día' },
              ]}
              value={implantAnswers.smoking}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, smoking: value as any });
                handleAnswerWithRioFeedback('smoking', value as string, getNextStepFunction('smoking'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'bruxism':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Algunas personas aprietan los dientes, a menudo sin darse cuenta. Es más común de lo que piensas."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-brux-pregunta.mp3"
            />
            <QuestionCard
              question={`¿Aprietas o rechinas los dientes, ${userProfile.name}?`}
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'unsure', label: 'No estoy seguro/a' },
                { value: 'yes', label: 'Sí' },
              ]}
              value={implantAnswers.bruxism}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, bruxism: value as any });
                handleAnswerWithRioFeedback('bruxism', value as string, getNextStepFunction('bruxism'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'bruxism-guard':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="El bruxismo puede manejarse muy bien. Una férula de descarga protege tanto tus dientes naturales como los implantes."
              userName={userProfile.name}
            />
            <QuestionCard
              question={`${userProfile.name}, ¿usas una férula de descarga nocturna?`}
              type="radio"
              options={[
                { value: 'no', label: 'No, no uso férula' },
                { value: 'yes', label: 'Sí, uso férula de descarga' },
              ]}
              value={implantAnswers.bruxismGuard}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, bruxismGuard: value as any });
                handleAnswerWithRioFeedback('bruxismGuard', value as string, getNextStepFunction('bruxism-guard'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'diabetes':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Tu salud general influye mucho en el éxito del tratamiento."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-diabetes-pregunta.mp3"
            />
            <QuestionCard
              question="¿Tienes diabetes?"
              type="radio"
              options={[
                { value: 'no', label: 'No' },
                { value: 'controlled', label: 'Sí, y está controlada' },
                { value: 'uncontrolled', label: 'Sí, y no está bien controlada' },
              ]}
              value={implantAnswers.diabetes}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, diabetes: value as any });
                handleAnswerWithRioFeedback('diabetes', value as string, getNextStepFunction('diabetes'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'implant-history':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Saber tu experiencia previa nos ayuda a entender mejor tu caso."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-implante-pregunta.mp3"
            />
            <QuestionCard
              question="¿Has tenido implantes dentales anteriormente?"
              type="radio"
              options={[
                { value: 'no', label: 'No, este sería mi primer implante' },
                { value: 'success', label: 'Sí, y siguen funcionando bien' },
                { value: 'failed', label: 'Sí, pero fracasaron' },
              ]}
              value={implantAnswers.implantHistory}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, implantHistory: value as any });
                handleAnswerWithRioFeedback('implantHistory', value as string, getNextStepFunction('implant-history'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'tooth-loss':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Entender por qué perdiste tus dientes nos da pistas importantes."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-causa-pregunta.mp3"
            />
            <QuestionCard
              question={`¿Cuál fue el motivo principal, ${userProfile.name}?`}
              type="radio"
              options={[
                { value: 'cavity', label: 'Por una caries' },
                { value: 'periodontitis', label: 'Por enfermedad de las encías (periodontitis)' },
                { value: 'trauma', label: 'Por un golpe o accidente' },
                { value: 'other', label: 'Otra razón' },
              ]}
              value={implantAnswers.toothLossCause}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, toothLossCause: value as any });
                handleAnswerWithRioFeedback('toothLossCause', value as string, getNextStepFunction('tooth-loss'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'tooth-loss-time':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Saber cuánto tiempo ha pasado nos ayuda a evaluar el hueso disponible."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-tiempo-pregunta.mp3"
            />
            <QuestionCard
              question={`¿Hace cuánto tiempo perdiste el diente, ${userProfile.name}?`}
              type="radio"
              options={[
                { value: 'less-1', label: 'Menos de 1 año' },
                { value: '1-3', label: 'Entre 1 y 3 años' },
                { value: 'more-3', label: 'Más de 3 años' },
              ]}
              value={implantAnswers.toothLossTime}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, toothLossTime: value as any });
                handleAnswerWithRioFeedback('toothLossTime', value as string, getNextStepFunction('tooth-loss-time'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'teeth-count':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`${userProfile.name}, ¿cuántos dientes necesitas reemplazar? Esto nos ayuda a orientar el tipo de tratamiento más adecuado para ti.`}
              userName={userProfile.name}
              customAudioUrl="/audio/rio-cuantos-dientes.mp3"
            />
            <QuestionCard
              question="¿Cuántos dientes te faltan o necesitas reemplazar?"
              type="radio"
              options={[
                { value: '1-2', label: '1 a 2 dientes' },
                { value: '3-8', label: '3 a 8 dientes' },
                { value: 'all', label: 'Todos los dientes' },
              ]}
              value={implantAnswers.teethToReplace}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, teethToReplace: value as any });
                handleAnswerWithRioFeedback('teethCount', value as string, getNextStepFunction('teeth-count'));
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
          </div>
        );

      case 'gum-health':
        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message="Veamos ahora la salud de tus encías."
              userName={userProfile.name}
              customAudioUrl="/audio/rio-pregunta-encias.mp3"
            />
            <QuestionCard
              question="1. ¿Sangran cuando te cepillas los dientes?"
              type="radio"
              options={[
                { value: 'never', label: 'Nunca o casi nunca' },
                { value: 'sometimes', label: 'A veces' },
                { value: 'frequently', label: 'Frecuentemente' },
              ]}
              value={implantAnswers.gumBleeding}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, gumBleeding: value as any });
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
            {implantAnswers.gumBleeding && (
              <QuestionCard
                question="2. ¿Has perdido algún diente porque se movía o se 'soltó' solo, sin causa aparente como un golpe o caries grande?"
                type="radio"
                options={[
                  { value: 'no', label: 'No' },
                  { value: '1-2', label: 'Sí, 1 o 2 dientes' },
                  { value: 'several', label: 'Sí, varios dientes' },
                ]}
                value={implantAnswers.looseTeethLoss}
                onChange={(value) => {
                  setImplantAnswers({ ...implantAnswers, looseTeethLoss: value as any });
                }}
                onNext={() => {}}
                hideNextButton={true}
              />
            )}
            {implantAnswers.looseTeethLoss && (
              <QuestionCard
                question="3. ¿Cuántas veces al día te cepillas los dientes?"
                type="radio"
                options={[
                  { value: 'less-once', label: 'Menos de una vez' },
                  { value: 'once', label: 'Una vez' },
                  { value: 'twice-plus', label: 'Dos o más veces' },
                ]}
                value={implantAnswers.oralHygiene}
                onChange={(value) => {
                  setImplantAnswers({ ...implantAnswers, oralHygiene: value as any });
                  // Ir a procesamiento IRP después de las 3 preguntas periodontales
                  setStep('irp-processing');
                }}
                onNext={() => {}}
                hideNextButton={true}
              />
            )}
          </div>
        );

      case 'irp-processing':
        return (
          <IRPProcessingScreen
            patientName={userProfile.name || 'Paciente'}
            onComplete={() => {
              // Calcular IRP basado en respuestas periodontales
              const result = calculateIRP({
                gumBleeding: implantAnswers.gumBleeding || 'never',
                looseTeethLoss: implantAnswers.looseTeethLoss || 'no',
                oralHygiene: implantAnswers.oralHygiene || 'twice-plus'
              });
              setIrpResult(result);
              setStep('irp-result');
            }}
          />
        );

      case 'irp-result':
        return irpResult ? (
          <IRPResultScreen
            irpResult={irpResult}
            patientName={userProfile.name || 'Paciente'}
            onContinueFree={() => {
              // Usuario elige opción gratuita
              setPurchaseLevel('free');
              setStep('implant-history');
            }}
            onPurchasePlan={() => {
              // Usuario compró Plan de Acción - mostrar upsell
              setPurchaseLevel('plan-accion');
              setStep('upsell-premium');
            }}
          />
        ) : null;

      case 'upsell-premium':
        return (
          <UpsellPremiumScreen
            patientName={userProfile.name || 'Paciente'}
            onUpgrade={() => {
              // Usuario compró Premium
              setPurchaseLevel('premium');
              triggerConfetti();
              setStep('implant-history');
            }}
            onSkip={() => {
              // Usuario rechazó upsell, continua con Plan de Acción
              setStep('implant-history');
            }}
          />
        );

      case 'odontogram':
        const handleImageContinue = () => {
          setStep('summary');
        };

        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`${userProfile.name}, ¿en qué zona de tu boca necesitas el implante?`}
              userName={userProfile.name}
            />
            <QuestionCard
              question="¿En qué zona necesitas el implante?"
              type="radio"
              options={[
                { value: 'frontal-superior', label: 'Frontal superior' },
                { value: 'frontal-inferior', label: 'Frontal inferior' },
                { value: 'lateral-superior-derecho', label: 'Lateral superior derecho' },
                { value: 'lateral-superior-izquierdo', label: 'Lateral superior izquierdo' },
                { value: 'lateral-inferior-derecho', label: 'Lateral inferior derecho' },
                { value: 'lateral-inferior-izquierdo', label: 'Lateral inferior izquierdo' },
              ]}
              value={implantAnswers.implantZones?.[0] || ''}
              onChange={(value) => {
                setImplantAnswers({ ...implantAnswers, implantZones: [value as string] });
              }}
              onNext={() => {}}
              hideNextButton={true}
            />
            {implantAnswers.implantZones?.length > 0 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">Si tienes una foto o radiografía de la zona, nuestra IA la analizará (opcional)</p>
                <ImageUpload
                  onImageSelect={(file, preview, analysis) => {
                    setUploadedImage(preview);
                    setImageAnalysis(analysis);
                  }}
                  onContinue={handleImageContinue}
                  showSkip={true}
                  patientName={userProfile.name}
                  isPremium={!!leadData}
                />
              </div>
            )}
          </div>
        );

      case 'summary':
        const handleConfirmAndProcess = () => {
          setStep('processing');
          triggerConfetti();
          setTimeout(() => {
            const result = calculateRiskAssessment(
              requiresDensityPro ? densityAnswers as DensityProAnswers : null,
              implantAnswers as ImplantXAnswers,
              userProfile.age
            );
            setAssessmentResult(result);
            // Show lead capture before results
            setShowLeadCapture(true);
          }, 3000);
        };

        return (
          <AnswersSummary
            userProfile={userProfile}
            densityAnswers={densityAnswers}
            implantAnswers={implantAnswers}
            requiresDensityPro={requiresDensityPro}
            uploadedImage={uploadedImage}
            onConfirm={handleConfirmAndProcess}
            onEdit={() => setStep('name')}
          />
        );

      case 'processing':
        return (
          <div className="space-y-6 animate-fade-in text-center py-6">
            <RioAvatar 
              message="¡Gracias, {name}! Estoy analizando tus respuestas para generar tu reporte personalizado..."
              userName={userProfile.name}
            />
            <div className="bg-background border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">Procesando evaluación</p>
                  <p className="text-sm text-muted-foreground">Analizando factores clínicos...</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'results':
        if (!assessmentResult) return null;
        
        // Calculate nTeeth from teethToReplace answer
        const getNTeethFromAnswer = (answer?: string): number => {
          const mapping: Record<string, number> = {
            '1': 1,
            '2-3': 3,
            '4-6': 5,
            '7-plus': 10,
            'all-upper': 14,
            'all-lower': 14,
            'all': 28
          };
          return mapping[answer || '1'] || 1;
        };

        const evaluationData = {
          id: `EV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          date: new Date().toLocaleDateString('es-ES'),
          patient: userProfile.name,
          pronosticoLabel: assessmentResult.pronosticoLabel,
          pronosticoMessage: assessmentResult.pronosticoMessage,
          pronosticoColor: assessmentResult.pronosticoColor,
          successProbability: assessmentResult.successProbability,
          factors: assessmentResult.riskFactors.map(rf => ({
            name: rf.name,
            value: rf.impact === 'high' ? 'Alto' : rf.impact === 'medium' ? 'Medio' : 'Bajo',
            impact: rf.impact === 'high' ? 15 : rf.impact === 'medium' ? 10 : 5
          })),
          recommendations: assessmentResult.recommendations.map(rec => ({
            text: rec.title,
            evidence: rec.description
          })),
          uploadedImage: uploadedImage,
          imageAnalysis: imageAnalysis,
          synergies: assessmentResult.synergies?.map(s => s.description) || [],
          nTeeth: getNTeethFromAnswer(implantAnswers.teethToReplace)
        };

        return (
          <div className="space-y-6 animate-fade-in">
            <RioAvatar 
              message={`¡Excelente, ${userProfile.name}! Hemos completado tu evaluación. Tu reporte personalizado está listo. Este documento será muy valioso para ti y tu especialista.`}
              userName={userProfile.name}
            />
            <ReportPreview evaluation={evaluationData} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ background: 'linear-gradient(165deg, #0a0a0a 0%, #0d0d0d 30%, #1a1510 70%, #0d0d0d 100%)' }}>
        {/* Premium Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(201, 168, 124, 0.15) 0%, transparent 60%)' }}
          />
        </div>

        {/* Header - Premium Dark con mejor branding */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20 bg-black/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg sm:text-xl text-foreground font-bold tracking-tight">
                Implant<span className="text-primary">X</span>
              </span>
              <span className="text-foreground/30 text-xs font-light">™</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] sm:text-xs font-medium text-primary tracking-wide">IA Activa</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 pt-20 pb-16">
          <div className="container mx-auto px-4 sm:px-6">
            {step !== 'welcome' && step !== 'results' && !showRioResponse && (
              <div className="mb-6 max-w-xl mx-auto">
                {/* Back Button */}
                {canGoBack() && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Volver</span>
                  </button>
                )}
                <ProgressBar
                  currentStep={getStepNumber()}
                  totalSteps={getTotalSteps()}
                  currentPhase={getCurrentPhase()}
                />
              </div>
            )}

            <div className="max-w-xl mx-auto">
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Footer - Premium Dark con mejor branding */}
        <footer className="border-t border-primary/10 py-6 bg-black/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col items-center gap-4">
              {/* Logo pequeño */}
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm text-foreground/60 font-medium">
                  Implant<span className="text-primary">X</span>
                </span>
                <span className="text-foreground/20 text-[10px]">™</span>
              </div>
              
              {/* Powered by */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                <span>Powered by</span>
                <a 
                  href="https://humanaia.cl" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  humana.ia
                </a>
              </div>
              
              {/* Copyright */}
              <p className="text-[10px] text-muted-foreground/40">
                © 2025 ImplantX · Todos los derechos reservados
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadCapture}
        onSubmit={(data) => {
          setLeadData(data);
          setShowLeadCapture(false);
          setStep('results');
          triggerConfetti();
        }}
        patientName={userProfile.name}
      />
    </>
  );
};

export default PatientQuestionnaire;