import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Image, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RioAvatar from "@/components/RioAvatar";
import { PurchaseLevel } from "@/types/questionnaire";

interface XrayUploadStepProps {
  userName?: string;
  purchaseLevel: PurchaseLevel;
  onImageSelect: (preview: string | null, analysis: string | null) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const XrayUploadStep = ({ 
  userName, 
  purchaseLevel, 
  onImageSelect, 
  onContinue, 
  onSkip 
}: XrayUploadStepProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const isPremium = purchaseLevel === 'premium';

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dental-image', {
        body: { imageBase64, patientName: userName, isPremium }
      });

      if (error) {
        console.error('Error analyzing image:', error);
        toast.error("No se pudo analizar la imagen", {
          description: "Puedes continuar de todas formas"
        });
        return null;
      }

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        toast.success("¡Imagen analizada!", {
          description: "Nuestra IA revisó tu radiografía"
        });
        return data.analysis;
      }
      
      return null;
    } catch (error) {
      console.error('Error en análisis:', error);
      toast.error("Error al analizar", {
        description: "Intenta de nuevo"
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("La imagen es muy grande. Máximo 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setPreview(result);
      
      const analysisResult = await analyzeImage(result);
      onImageSelect(result, analysisResult);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setPreview(null);
    setAnalysis(null);
    onImageSelect(null, null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Rio Avatar */}
      <RioAvatar 
        message={`${userName ? userName + ', si' : 'Si'} tienes una radiografía a mano, súbela. Nos ayuda a darte mejor información. Si no tienes, no pasa nada.`}
        expression="encouraging"
      />

      {/* Step indicator */}
      <div className="text-center">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
          Paso 2 de 3 · Opcional
        </span>
      </div>

      {/* Main card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            ¿Tienes una radiografía dental?
          </h3>
          <p className="text-sm text-muted-foreground">
            Si la tienes, súbela. Si no tienes, puedes seguir igual.
          </p>
        </div>

        {/* Premium notice */}
        {isPremium && (
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-600">Para el análisis Premium</p>
              <p className="text-muted-foreground">
                Después necesitarás tomar una foto de la zona con tu celular. Eso sí es obligatorio.
              </p>
            </div>
          </div>
        )}

        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
              isDragging 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
            onClick={() => document.getElementById('xray-input')?.click()}
          >
            <input
              id="xray-input"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Toca aquí para subir
                </p>
                <p className="text-sm text-muted-foreground">
                  o arrastra tu radiografía
                </p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  JPG, PNG
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  Foto de RX
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Tu radiografía"
                className="w-full h-48 object-cover rounded-xl border border-border"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-foreground/80 hover:bg-foreground text-background rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Analizando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Result */}
            {analysis && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Lo que vemos</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  * Esto es orientativo. El dentista confirma en consulta.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick tips */}
        {!preview && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">Tips:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Panorámicas son las mejores</li>
              <li>• Que se vea clara y enfocada</li>
              <li>• Puedes tomarle foto a la RX impresa</li>
            </ul>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {preview && !isAnalyzing ? (
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all group"
          >
            Subir rx
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        ) : null}
        
        {!preview && (
          <>
            <Button
              onClick={() => document.getElementById('xray-input')?.click()}
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Upload className="mr-2 w-5 h-5" />
              Subir rx
            </Button>
            
            <Button
              onClick={onSkip}
              variant="outline"
              size="lg"
              className="w-full h-14 text-base font-medium rounded-xl border-border hover:bg-muted/50 transition-all"
            >
              Seguir sin foto
            </Button>
          </>
        )}

        {preview && !isAnalyzing && (
          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            className="w-full h-12 text-sm text-muted-foreground hover:text-foreground transition-all"
          >
            Cambiar de opinión · Seguir sin foto
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground">
        Tu imagen es privada y solo se usa para tu guía.
      </p>
    </div>
  );
};

export default XrayUploadStep;
