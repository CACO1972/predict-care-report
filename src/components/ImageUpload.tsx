import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, Image, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageSelect: (file: File | null, preview: string | null, analysis: string | null) => void;
  onContinue: () => void;
  showSkip?: boolean;
  patientName?: string;
}

const ImageUpload = ({ onImageSelect, onContinue, showSkip = true, patientName }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-dental-image', {
        body: { imageBase64, patientName }
      });

      if (error) {
        console.error('Error analyzing image:', error);
        toast.error("No se pudo analizar la imagen, pero puedes continuar");
        return null;
      }

      if (data?.success && data?.analysis) {
        setAnalysis(data.analysis);
        toast.success("Imagen analizada exitosamente");
        return data.analysis;
      }
      
      return null;
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error al analizar la imagen");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor selecciona una imagen válida");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("La imagen es muy grande. Máximo 50MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setPreview(result);
      
      // Analyze the image with AI
      const analysisResult = await analyzeImage(result);
      onImageSelect(file, result, analysisResult);
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
    onImageSelect(null, null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-background border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">
          Sube una foto o radiografía de la zona
        </h3>
        <p className="text-sm text-muted-foreground">
          Nuestra IA analizará tu imagen para darte información preliminar útil para tu especialista.
        </p>

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
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
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
                  Arrastra tu imagen aquí
                </p>
                <p className="text-sm text-muted-foreground">
                  o haz clic para seleccionar
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
                  Foto o RX
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
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
                    <span className="text-sm font-medium">Analizando con IA...</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Result */}
            {analysis && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">Análisis de IA</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {analysis}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  * Este análisis es orientativo y no reemplaza la evaluación de un especialista.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick tips */}
        {!preview && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-medium text-foreground">Consejos para una mejor imagen:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Buena iluminación para fotos de la boca</li>
              <li>• Radiografías panorámicas o periapicales son ideales</li>
              <li>• Asegúrate que la imagen sea clara y enfocada</li>
            </ul>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {preview && !isAnalyzing && (
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all group"
          >
            Continuar con imagen
            <ChevronRight className="ml-2 w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </Button>
        )}
        
        {showSkip && !preview && (
          <Button
            onClick={onContinue}
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium rounded-xl border-border hover:bg-muted/50 transition-all"
          >
            Continuar sin imagen
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;