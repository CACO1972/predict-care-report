import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  id: string;
  date: string;
  patientName?: string;
  pronosticoLabel: string;
  pronosticoMessage: string;
  successRange: string;
  factors: Array<{ name: string; value: string; impact: number }>;
  recommendations: Array<{ text: string; evidence: string }>;
  synergies?: string[];
  methodology?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    console.log('Generating PDF for report:', reportData.id);

    // Generate HTML content for the report
    const htmlContent = generateReportHTML(reportData);
    
    // For now, we'll return the HTML that can be printed/saved as PDF
    // In production, you could use a service like Puppeteer/Playwright
    return new Response(
      JSON.stringify({ 
        success: true, 
        html: htmlContent,
        downloadName: `ImplantX_Reporte_${reportData.patientName?.replace(/\s/g, '_') || 'Paciente'}_${reportData.id}.html`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating PDF:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateReportHTML(data: ReportData): string {
  const factorsHTML = data.factors.map(f => `
    <div class="factor">
      <div class="factor-header">
        <span class="factor-name">${f.name}</span>
        <span class="factor-value ${f.value.toLowerCase()}">${f.value}</span>
      </div>
      <div class="factor-bar">
        <div class="factor-fill" style="width: ${f.impact * 6}%"></div>
      </div>
    </div>
  `).join('');

  const recommendationsHTML = data.recommendations.map(r => `
    <div class="recommendation">
      <div class="rec-icon">✓</div>
      <div class="rec-content">
        <strong>${r.text}</strong>
        <p>${r.evidence}</p>
      </div>
    </div>
  `).join('');

  const synergiesHTML = data.synergies?.length ? `
    <div class="section">
      <h3>Factores Combinados Identificados</h3>
      <ul class="synergies">
        ${data.synergies.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte ImplantX - ${data.patientName || 'Paciente'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0a0a0a;
      color: #fafafa;
      line-height: 1.6;
      padding: 40px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: linear-gradient(165deg, #0d0d0d 0%, #1a1510 50%, #0d0d0d 100%);
      border: 1px solid rgba(201, 168, 124, 0.3);
      border-radius: 24px;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, rgba(201, 168, 124, 0.15) 0%, transparent 100%);
      padding: 40px;
      text-align: center;
      border-bottom: 1px solid rgba(201, 168, 124, 0.2);
    }
    
    .logo {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .logo span { color: #c9a87c; }
    
    .subtitle {
      color: #888;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .patient-info {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .patient-info span {
      color: #888;
      font-size: 13px;
    }
    
    .patient-info strong {
      color: #fafafa;
    }
    
    .main-result {
      padding: 50px 40px;
      text-align: center;
      background: radial-gradient(circle at center, rgba(201, 168, 124, 0.1) 0%, transparent 70%);
    }
    
    .gauge {
      width: 200px;
      height: 100px;
      margin: 0 auto 24px;
      position: relative;
    }
    
    .success-range {
      font-size: 48px;
      font-weight: 700;
      color: #c9a87c;
      margin-bottom: 8px;
    }
    
    .success-label {
      font-size: 14px;
      color: #888;
      margin-bottom: 16px;
    }
    
    .pronostico-badge {
      display: inline-block;
      background: rgba(201, 168, 124, 0.2);
      color: #c9a87c;
      padding: 8px 24px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .pronostico-message {
      color: #aaa;
      max-width: 500px;
      margin: 0 auto;
      font-size: 15px;
    }
    
    .content {
      padding: 40px;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h3 {
      font-size: 18px;
      color: #c9a87c;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(201, 168, 124, 0.2);
    }
    
    .factor {
      margin-bottom: 16px;
    }
    
    .factor-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    
    .factor-name {
      font-weight: 500;
    }
    
    .factor-value {
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 10px;
    }
    
    .factor-value.alto { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .factor-value.medio { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .factor-value.bajo { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    
    .factor-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .factor-fill {
      height: 100%;
      background: linear-gradient(90deg, #c9a87c, #e0c9a8);
      border-radius: 3px;
    }
    
    .recommendation {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: rgba(201, 168, 124, 0.08);
      border: 1px solid rgba(201, 168, 124, 0.2);
      border-radius: 12px;
      margin-bottom: 12px;
    }
    
    .rec-icon {
      width: 28px;
      height: 28px;
      background: rgba(201, 168, 124, 0.2);
      color: #c9a87c;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .rec-content strong {
      display: block;
      margin-bottom: 4px;
    }
    
    .rec-content p {
      font-size: 13px;
      color: #888;
    }
    
    .synergies {
      list-style: none;
    }
    
    .synergies li {
      padding: 12px 16px;
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid #f59e0b;
      margin-bottom: 8px;
      border-radius: 0 8px 8px 0;
    }
    
    .methodology {
      background: rgba(201, 168, 124, 0.05);
      border: 1px solid rgba(201, 168, 124, 0.15);
      border-radius: 16px;
      padding: 24px;
    }
    
    .methodology h4 {
      color: #c9a87c;
      margin-bottom: 12px;
      font-size: 14px;
    }
    
    .methodology p {
      font-size: 13px;
      color: #888;
      margin-bottom: 12px;
    }
    
    .methodology .highlight {
      color: #fafafa;
      font-weight: 500;
    }
    
    .footer {
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid rgba(201, 168, 124, 0.2);
      background: rgba(0,0,0,0.3);
    }
    
    .footer-logo {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .footer-logo span { color: #c9a87c; }
    
    .footer p {
      font-size: 11px;
      color: #666;
    }
    
    .footer a {
      color: #c9a87c;
      text-decoration: none;
    }
    
    @media print {
      body { padding: 0; background: white; color: #1a1a1a; }
      .container { border: none; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Implant<span>X</span>™</div>
      <div class="subtitle">Reporte de Evaluación Clínica</div>
      <div class="patient-info">
        <span><strong>${data.patientName || 'Paciente'}</strong></span>
        <span>ID: <strong>${data.id}</strong></span>
        <span>Fecha: <strong>${data.date}</strong></span>
      </div>
    </div>
    
    <div class="main-result">
      <div class="success-range">${data.successRange}</div>
      <div class="success-label">Rango de éxito estimado*</div>
      <div class="pronostico-badge">${data.pronosticoLabel}</div>
      <p class="pronostico-message">${data.pronosticoMessage}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h3>Factores de Riesgo Evaluados</h3>
        ${factorsHTML}
      </div>
      
      ${synergiesHTML}
      
      <div class="section">
        <h3>Recomendaciones Personalizadas</h3>
        ${recommendationsHTML}
      </div>
      
      <div class="section methodology">
        <h4>📊 Metodología del Algoritmo ImplantX</h4>
        <p>
          Esta evaluación utiliza el <span class="highlight">algoritmo sinérgico ImplantX</span>, 
          desarrollado a partir del análisis de <span class="highlight">17,025 implantes documentados</span> 
          en estudios longitudinales con seguimiento de hasta 22 años.
        </p>
        <p>
          <span class="highlight">Fuentes científicas:</span> University of British Columbia Cohort (PMC8359846), 
          Meta-análisis de Howe et al. 2019 (PMID:30904559), 20-Year Survival Meta-Analysis 2024 (PMC11416373).
        </p>
        <p style="font-size: 11px; color: #666; margin-top: 16px;">
          *Los rangos de probabilidad reflejan la variabilidad inherente documentada en la literatura científica (IC 95% ±1.2-2.5%).
        </p>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-logo">Implant<span>X</span>™</div>
      <p>Powered by <a href="https://humanaia.cl">humana.ia</a></p>
      <p style="margin-top: 8px;">© 2025 ImplantX · Este reporte es orientativo. La evaluación final debe ser realizada por un especialista.</p>
    </div>
  </div>
  
  <script>
    // Auto-trigger print dialog for easy PDF save
    // window.print();
  </script>
</body>
</html>
  `;
}
