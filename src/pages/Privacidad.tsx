import LandingNavbar from "@/components/LandingNavbar";
import { Shield, Lock, Eye, Trash2, Mail } from "lucide-react";

const Privacidad = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-16 max-w-3xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold">Política de Privacidad</h1>
          </div>
          <p className="text-muted-foreground">Última actualización: 13 de febrero de 2026</p>
        </div>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">1. Información que recopilamos</h2>
            </div>
            <p>
              ImplantX™ recopila únicamente la información que tú proporcionas voluntariamente durante la evaluación:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
              <li>Nombre (opcional)</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Respuestas del cuestionario de salud oral</li>
              <li>Imágenes dentales (si las subes voluntariamente)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">2. Cómo usamos tu información</h2>
            </div>
            <p>Tu información se utiliza exclusivamente para:</p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
              <li>Generar tu reporte personalizado de evaluación implantológica</li>
              <li>Enviarte el reporte por correo electrónico</li>
              <li>Facilitar la coordinación con tu profesional dental</li>
              <li>Procesar pagos de planes premium (a través de Flow.cl)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              <strong>No vendemos, compartimos ni transferimos</strong> tu información personal a terceros con fines comerciales.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">3. Seguridad de los datos</h2>
            </div>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
              <li>Cifrado en tránsito (HTTPS/TLS)</li>
              <li>Almacenamiento seguro con acceso restringido</li>
              <li>Procesamiento anónimo de evaluaciones</li>
              <li>Cumplimiento con estándares de protección de datos</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">4. Tus derechos</h2>
            </div>
            <p>De acuerdo con la legislación chilena (Ley 19.628), tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-1 pl-4 text-muted-foreground">
              <li>Acceder a tus datos personales</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Revocar tu consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">5. Pagos</h2>
            </div>
            <p>
              Los pagos son procesados de forma segura por <strong>Flow.cl</strong>, un procesador de pagos certificado en Chile. 
              ImplantX no almacena datos de tarjetas de crédito ni información financiera sensible.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">6. Cookies</h2>
            </div>
            <p>
              Utilizamos almacenamiento local del navegador (localStorage) únicamente para mantener el progreso de tu evaluación durante la sesión. 
              No utilizamos cookies de seguimiento ni de publicidad.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-xl font-semibold">7. Contacto</h2>
            </div>
            <p>
              Para ejercer tus derechos o realizar consultas sobre privacidad, puedes contactarnos en:
            </p>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="font-medium">ImplantX™ — Clínica Miró</p>
              <p className="text-muted-foreground text-sm">contacto@humanaia.cl</p>
            </div>
          </section>

          <section className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2024–2026 ImplantX™. Propiedad intelectual registrada en SafeCreative®. Todos los derechos reservados.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacidad;
