import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Phone, Loader2, Shield, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onSubmit: (data: { email: string; phone: string }) => void;
  patientName?: string;
}

const LeadCaptureModal = ({ isOpen, onSubmit, patientName }: LeadCaptureModalProps) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    // Chilean phone format: +56 9 XXXX XXXX or 9 XXXX XXXX
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length >= 8;
  };

  const handleSubmit = async () => {
    const newErrors: { email?: string; phone?: string } = {};
    
    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!phone) {
      newErrors.phone = "El teléfono es requerido";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Teléfono inválido";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save lead to database
      const { error } = await supabase.from('leads').insert({
        email: email.trim(),
        phone: phone.trim(),
        patient_name: patientName || null,
        source: 'questionnaire'
      });
      
      if (error) {
        console.error('Error saving lead:', error);
        toast.error('Error al guardar tus datos. Por favor intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }
      
      onSubmit({ email, phone });
    } catch (err) {
      console.error('Error saving lead:', err);
      toast.error('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            ¡{patientName ? `${patientName}, tu` : 'Tu'} resultado está listo! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Value proposition */}
          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              Ingresa tus datos para ver tu evaluación personalizada
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-primary" />
                100% Confidencial
              </span>
              <span className="flex items-center gap-1">
                <Gift className="w-3 h-3 text-primary" />
                Resultado Gratis
              </span>
            </div>
          </div>
          
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  className={cn(
                    "pl-10",
                    errors.email && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Teléfono (WhatsApp)
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors(prev => ({ ...prev, phone: undefined }));
                  }}
                  className={cn(
                    "pl-10",
                    errors.phone && "border-destructive focus-visible:ring-destructive"
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
          
          {/* Submit button */}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              "Ver mi resultado"
            )}
          </Button>
          
          {/* Privacy note */}
          <p className="text-[10px] text-center text-muted-foreground">
            Al continuar, aceptas recibir información sobre tu evaluación. 
            Tus datos están protegidos y no serán compartidos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
