import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface QuestionCardProps {
  question: string;
  type: 'text' | 'number' | 'radio' | 'gender';
  options?: { value: string; label: string }[];
  value?: string | number;
  onChange: (value: string | number) => void;
  onNext: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  clinicalNote?: string;
  nextButtonText?: string;
  disabled?: boolean;
  hideNextButton?: boolean;
}

const QuestionCard = ({
  question,
  type,
  options,
  value,
  onChange,
  onNext,
  onBack,
  showBackButton = false,
  clinicalNote,
  nextButtonText = "Continuar",
  disabled = false,
  hideNextButton = false
}: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && !disabled) {
      onNext();
    }
  };

  const handleButtonClick = () => {
    onNext();
  };

  const handleRadioChange = (newValue: string) => {
    setSelectedOption(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-background border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        {/* Question */}
        <h3 className="text-lg font-semibold text-foreground leading-tight">
          {question}
        </h3>
        
        {type === 'text' && (
          <Input
            value={value as string || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe aquí..."
            className="text-base h-12 rounded-xl border-border focus:border-primary focus:ring-1 focus:ring-primary bg-background transition-all"
            autoFocus
          />
        )}

        {type === 'number' && (
          <Input
            type="number"
            value={value as number || ''}
            onChange={(e) => onChange(parseInt(e.target.value))}
            onKeyPress={handleKeyPress}
            placeholder="Tu edad..."
            className="text-base h-12 rounded-xl border-border focus:border-primary focus:ring-1 focus:ring-primary bg-background transition-all"
            autoFocus
            min={18}
            max={120}
          />
        )}

        {type === 'gender' && (
          <RadioGroup
            value={value as string}
            onValueChange={handleRadioChange}
            className="space-y-2"
          >
            {[
              { value: 'male', label: 'Masculino' },
              { value: 'female', label: 'Femenino' },
              { value: 'other', label: 'Otro' },
            ].map((option) => (
              <div 
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  "hover:border-primary/50 hover:bg-muted/30",
                  selectedOption === option.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value} 
                  className="border-2 data-[state=checked]:border-primary data-[state=checked]:text-primary" 
                />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium text-foreground">
                  {option.label}
                </Label>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all duration-200",
                  selectedOption === option.value ? "text-primary" : "text-muted-foreground/50"
                )} />
              </div>
            ))}
          </RadioGroup>
        )}

        {type === 'radio' && options && (
          <RadioGroup
            value={value as string}
            onValueChange={handleRadioChange}
            className="space-y-2"
          >
            {options.map((option) => (
              <div 
                key={option.value}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                  "hover:border-primary/50 hover:bg-muted/30",
                  selectedOption === option.value 
                    ? "border-primary bg-primary/5" 
                    : "border-border"
                )}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={option.value} 
                  className="border-2 data-[state=checked]:border-primary data-[state=checked]:text-primary" 
                />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer font-medium text-foreground">
                  {option.label}
                </Label>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all duration-200",
                  selectedOption === option.value ? "text-primary" : "text-muted-foreground/50"
                )} />
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {clinicalNote && (
        <Alert className="border-primary/20 bg-primary/5 rounded-xl">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm text-muted-foreground">
            <strong className="text-primary">Dato clínico:</strong> {clinicalNote}
          </AlertDescription>
        </Alert>
      )}

      {/* Back button */}
      {showBackButton && onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full h-10 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
          size="sm"
        >
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver a la pregunta anterior
        </Button>
      )}

      {(type === 'text' || type === 'number') && !hideNextButton && (
        <Button
          onClick={handleButtonClick}
          disabled={!value || disabled}
          className="w-full h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 group"
          size="lg"
        >
          {nextButtonText}
          <ChevronRight className="ml-2 w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
        </Button>
      )}
    </div>
  );
};

export default QuestionCard;