import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1";

// ============================================================
//  ImplantX PDF Report Generator v3.0 - pdf-lib Adapter
//  Adapts v3.0 data format to existing pdf-lib renderer
// ============================================================

const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedPatterns = [
    'https://implantx.cl',
    'https://www.implantx.cl',
    'https://app.implantx.cl',
    'https://implantx.lovable.app',
    'https://predict-care-report.lovable.app',
    /^https:\/\/.*\.lovableproject\.com$/,
    /^https:\/\/.*\.lovable\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
  ];
  if (!requestOrigin) return '*';
  for (const pattern of allowedPatterns) {
    if (typeof pattern === 'string' && requestOrigin === pattern) return requestOrigin;
    if (pattern instanceof RegExp && pattern.test(requestOrigin)) return requestOrigin;
  }
  return 'https://implantx.cl';
};

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(origin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// ============================================================
//  V3 TYPES (from INSTRUCCIONES-LOVABLE.md)
// ============================================================
type PlanType = 'FREE' | 'BASE' | 'COMPLETE';

interface BiologicalMechanism {
  title: string;
  points: string[];
}

interface RiskFactorV3 {
  factorName: string;
  yourSituation: string;
  relativeRisk: number;
  realWorldComparison: string;
  biologicalMechanisms: BiologicalMechanism[];
  requiredActions: string[];
  adherenceBenefit: {
    riskReduction: string;
    successIncrease: string;
    complicationsReduction: string;
  };
  supportResources: string[];
  evidenceLevel: 'A' | 'B' | 'C';
  scientificReference: string;
}

interface TimelineAction {
  category: 'CRÍTICO' | 'IMPORTANTE' | 'RECOMENDADO';
  action: string;
}

interface PreparationTimeline {
  week: string;
  weekLabel: string;
  actions: TimelineAction[];
  controlAppointments?: string[];
}

interface PostOpPhase {
  period: string;
  actions: string[];
}

interface FactorSynergy {
  factorsCombined: string[];
  multiplicationEffect: number;
  actualMultiplier: number;
  biologicalSynergies: BiologicalMechanism[];
  scientificEvidence: string;
  prioritizedInterventions: {
    priority: number;
    action: string;
    impact: string;
    resultIfCompletes: string;
  }[];
  finalRiskReduction: {
    currentRisk: string;
    optimizedRisk: string;
    totalReduction: string;
  };
}

interface AnatomicalSector {
  sectorName: string;
  teeth: string;
  sacClassification: "S" | "A" | "C";
  riskLevel: "BAJO" | "MODERADO-BAJO" | "MODERADO" | "MODERADO-ALTO" | "ALTO";
  anatomicalChallenges: { challenge: string; impact: string; }[];
  specificProtocol: { phase: string; timing: string; details: string; duration: string; }[];
  totalTimeline: string;
  specificRisks: { riskType: string; probabilityRange: string; }[];
  estimatedCost: string;
}

interface AdherenceScenario {
  scenarioName: string;
  adherenceLevel: "100%" | "PARCIAL" | "NULA";
  icon: string;
  actions: string[];
  results: {
    successProbabilityOverall: string;
    healingTime: string;
    complicationsMinor: string;
    complicationsMajor: string;
    qualityOfLife: {
      masticatoryFunction: string;
      esthetics: string;
      phonetics: string;
      comfort: string;
      maintenance: string;
      expectedDurability: string;
    };
    totalEstimatedCost: {
      initialTreatment: string;
      averageComplications: string;
      total: string;
      percentageVsOptimal: string;
    };
  };
  specialWarning?: string;
}

interface ReportDataV3 {
  reportId: string;
  patientName: string;
  patientEmail: string;
  age?: number;
  city?: string;
  evaluationDate: string;
  plan: PlanType;
  
  classification: "FAVORABLE" | "FAVORABLE CON CONDICIONES" | "DUDOSO" | "DESFAVORABLE";
  successProbability: number;
  riskIndex: number;
  globalRiskMultiplier: number;
  
  riskFactors: RiskFactorV3[];
  mainAffectingFactors: string[];
  preparationTimeline: PreparationTimeline[];
  postOpProtocol: PostOpPhase[];
  
  // PREMIUM tier
  factorSynergies?: FactorSynergy[];
  anatomicalSectors?: AnatomicalSector[];
  adherenceScenarios?: AdherenceScenario[];
}

// ============================================================
//  COLORS
// ============================================================
const C = {
  DARK_BG:     rgb(10/255, 10/255, 10/255),
  GOLD:        rgb(201/255, 168/255, 108/255),
  GOLD_LIGHT:  rgb(232/255, 213/255, 168/255),
  GOLD_DARK:   rgb(139/255, 115/255, 64/255),
  WHITE:       rgb(1, 1, 1),
  LIGHT_GRAY:  rgb(0.95, 0.95, 0.95),
  MED_GRAY:    rgb(0.6, 0.6, 0.6),
  DARK_GRAY:   rgb(0.3, 0.3, 0.3),
  TEXT:        rgb(0.2, 0.2, 0.2),
  BEIGE_BG:    rgb(248/255, 246/255, 240/255),
  CREAM_BG:    rgb(251/255, 248/255, 240/255),
  GREEN_OK:    rgb(46/255, 125/255, 50/255),
  YELLOW_WARN: rgb(245/255, 127/255, 23/255),
  RED_ALERT:   rgb(198/255, 40/255, 40/255),
  ORANGE_MED:  rgb(230/255, 81/255, 0/255),
  BLUE_ACCENT: rgb(30/255, 58/255, 95/255),
  BLUE_LIGHT:  rgb(245/255, 248/255, 252/255),
  PINK_LIGHT:  rgb(255/255, 245/255, 245/255),
  PURPLE_LIGHT: rgb(248/255, 245/255, 255/255),
  PURPLE:      rgb(128/255, 90/255, 213/255),
};

// ============================================================
//  LAYOUT CONSTANTS
// ============================================================
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M_LEFT = 45;
const M_RIGHT = 45;
const M_TOP = 60;
const M_BOTTOM = 60;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;
const HEADER_H = 52;
const FOOTER_H = 40;

// ============================================================
//  PDF HELPER CLASS
// ============================================================
class PDFBuilderV3 {
  doc!: PDFDocument;
  page!: PDFPage;
  fontRegular!: PDFFont;
  fontBold!: PDFFont;
  fontItalic!: PDFFont;
  y: number = 0;
  pageNum: number = 0;
  plan: PlanType = 'FREE';
  currentSubtitle = '';

  async init(plan: PlanType) {
    this.doc = await PDFDocument.create();
    this.fontRegular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.fontItalic = await this.doc.embedFont(StandardFonts.HelveticaOblique);
    this.plan = plan;
    this.newPage();
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pageNum++;
    this.y = PAGE_H - M_TOP;
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.WHITE });
  }

  drawHeader(subtitle: string) {
    const p = this.page;
    p.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: C.DARK_BG });
    p.drawText("IMPLANTX", {
      x: M_LEFT, y: PAGE_H - HEADER_H + 18, size: 18, font: this.fontBold, color: C.GOLD,
    });
    const subW = this.fontRegular.widthOfTextAtSize(subtitle, 8);
    p.drawText(subtitle, {
      x: PAGE_W - M_RIGHT - subW, y: PAGE_H - HEADER_H + 22, size: 8, font: this.fontRegular, color: C.GOLD_LIGHT,
    });
    p.drawText("by Clinica Miro | v3.0", {
      x: M_LEFT, y: PAGE_H - HEADER_H + 7, size: 7, font: this.fontItalic, color: C.MED_GRAY,
    });
    this.y = PAGE_H - HEADER_H - 20;
  }

  drawFooterAllPages(tierLabel: string) {
    const pages = this.doc.getPages();
    const totalPages = pages.length;
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      p.drawRectangle({ x: M_LEFT, y: FOOTER_H + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
      p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
        x: M_LEFT, y: FOOTER_H, size: 6.5, font: this.fontRegular, color: C.MED_GRAY,
      });
      const tw = this.fontBold.widthOfTextAtSize(tierLabel, 6.5);
      p.drawText(tierLabel, { x: (PAGE_W - tw) / 2, y: FOOTER_H, size: 6.5, font: this.fontBold, color: C.GOLD });
      const pgText = `${i + 1} / ${totalPages}`;
      const pgW = this.fontRegular.widthOfTextAtSize(pgText, 6.5);
      p.drawText(pgText, { x: PAGE_W - M_RIGHT - pgW, y: FOOTER_H, size: 6.5, font: this.fontRegular, color: C.MED_GRAY });
    }
  }

  drawText(text: string, opts: {
    x?: number; size?: number; font?: PDFFont; color?: any;
    maxWidth?: number; lineHeight?: number;
  } = {}) {
    const {
      x = M_LEFT, size = 10, font = this.fontRegular,
      color = C.TEXT, maxWidth = CONTENT_W, lineHeight = size * 1.4,
    } = opts;

    const words = text.split(' ');
    let line = '';
    const lines: string[] = [];

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    for (const l of lines) {
      if (this.y < M_BOTTOM + FOOTER_H + 20) {
        this.newPage();
        this.drawHeader(this.currentSubtitle);
      }
      this.page.drawText(l, { x, y: this.y, size, font, color });
      this.y -= lineHeight;
    }
  }

  drawSectionTitle(text: string) {
    this.y -= 8;
    if (this.y < M_BOTTOM + FOOTER_H + 40) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.page.drawRectangle({ x: M_LEFT, y: this.y - 2, width: 3, height: 14, color: C.GOLD });
    this.page.drawText(text.toUpperCase(), {
      x: M_LEFT + 10, y: this.y, size: 11, font: this.fontBold, color: C.DARK_BG,
    });
    this.y -= 20;
  }

  drawGoldDivider() {
    this.y -= 4;
    this.page.drawRectangle({ x: M_LEFT, y: this.y, width: CONTENT_W, height: 0.5, color: C.GOLD });
    this.y -= 10;
  }

  space(h: number) {
    this.y -= h;
    if (this.y < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
  }

  drawBox(opts: { x?: number; width?: number; height: number; bgColor: any; borderColor?: any; borderWidth?: number }) {
    const { x = M_LEFT, width = CONTENT_W, height, bgColor, borderColor, borderWidth = 0 } = opts;
    this.page.drawRectangle({
      x, y: this.y - height, width, height,
      color: bgColor, borderColor: borderColor || bgColor, borderWidth,
    });
  }

  drawTable(headers: string[], rows: string[][], opts: {
    colWidths?: number[];
    headerBg?: any;
    headerColor?: any;
    altRowBg?: any;
    fontSize?: number;
  } = {}) {
    const {
      colWidths = headers.map(() => CONTENT_W / headers.length),
      headerBg = C.DARK_BG,
      headerColor = C.GOLD_LIGHT,
      altRowBg = C.BEIGE_BG,
      fontSize = 8,
    } = opts;

    const rowH = 20;
    const headerH = 22;

    if (this.y < M_BOTTOM + FOOTER_H + 60) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    let xPos = M_LEFT;
    this.page.drawRectangle({
      x: M_LEFT, y: this.y - headerH + 6, width: CONTENT_W, height: headerH, color: headerBg
    });

    for (let i = 0; i < headers.length; i++) {
      const truncated = this.truncateText(headers[i], colWidths[i] - 6, fontSize, this.fontBold);
      this.page.drawText(truncated, {
        x: xPos + 4, y: this.y - 8, size: fontSize, font: this.fontBold, color: headerColor,
      });
      xPos += colWidths[i];
    }
    this.y -= headerH;

    for (let r = 0; r < rows.length; r++) {
      if (this.y < M_BOTTOM + FOOTER_H + 20) {
        this.newPage();
        this.drawHeader(this.currentSubtitle);
      }
      if (r % 2 === 1) {
        this.page.drawRectangle({
          x: M_LEFT, y: this.y - rowH + 6, width: CONTENT_W, height: rowH, color: altRowBg
        });
      }
      xPos = M_LEFT;
      for (let i = 0; i < rows[r].length; i++) {
        const cellText = rows[r][i] || '';
        const truncated = this.truncateText(cellText, (colWidths[i] || 80) - 6, fontSize, this.fontRegular);
        this.page.drawText(truncated, {
          x: xPos + 4, y: this.y - 8, size: fontSize, font: this.fontRegular, color: C.TEXT,
        });
        xPos += (colWidths[i] || 80);
      }
      this.y -= rowH;
    }
    this.page.drawRectangle({ x: M_LEFT, y: this.y + 6, width: CONTENT_W, height: 0.5, color: C.MED_GRAY });
    this.y -= 6;
  }

  truncateText(text: string, maxW: number, size: number, font: PDFFont): string {
    if (font.widthOfTextAtSize(text, size) <= maxW) return text;
    let t = text;
    while (t.length > 0 && font.widthOfTextAtSize(t + '...', size) > maxW) {
      t = t.slice(0, -1);
    }
    return t + '...';
  }

  getClassificationColor(classification: string) {
    if (classification === 'FAVORABLE') return C.GREEN_OK;
    if (classification === 'DESFAVORABLE') return C.RED_ALERT;
    return C.YELLOW_WARN;
  }

  drawResultBoxV3(data: ReportDataV3, showProbability: boolean) {
    const boxH = showProbability ? 85 : 75;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    const classColor = this.getClassificationColor(data.classification);
    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1 });
    const boxTop = this.y;

    this.page.drawText("RESULTADO DE LA EVALUACION v3.0", {
      x: M_LEFT + 10, y: boxTop - 16, size: 8, font: this.fontBold, color: C.GOLD_DARK,
    });

    if (showProbability) {
      const probText = `${data.successProbability}%`;
      const probW = this.fontBold.widthOfTextAtSize(probText, 42);
      this.page.drawText(probText, {
        x: M_LEFT + 10, y: boxTop - 58, size: 42, font: this.fontBold, color: C.GOLD,
      });
      this.page.drawText("probabilidad de exito", {
        x: M_LEFT + probW + 16, y: boxTop - 42, size: 9, font: this.fontItalic, color: C.MED_GRAY,
      });
    } else {
      this.page.drawText("- - %", {
        x: M_LEFT + 10, y: boxTop - 52, size: 36, font: this.fontBold, color: C.LIGHT_GRAY,
      });
      this.page.drawText("Disponible en Plan de Accion", {
        x: M_LEFT + 110, y: boxTop - 40, size: 8, font: this.fontItalic, color: C.MED_GRAY,
      });
    }

    const classW = this.fontBold.widthOfTextAtSize(data.classification, 10);
    this.page.drawText(data.classification, {
      x: PAGE_W - M_RIGHT - classW - 10, y: boxTop - 35,
      size: 10, font: this.fontBold, color: classColor,
    });

    const riskLabel = `Multiplicador: ${data.globalRiskMultiplier.toFixed(1)}x`;
    const riskW = this.fontRegular.widthOfTextAtSize(riskLabel, 8);
    this.page.drawText(riskLabel, {
      x: PAGE_W - M_RIGHT - riskW - 10, y: boxTop - 50,
      size: 8, font: this.fontRegular, color: C.MED_GRAY,
    });

    this.y -= boxH + 8;
  }

  drawRiskGauge(probability: number) {
    if (this.y < M_BOTTOM + FOOTER_H + 50) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    const gaugeY = this.y - 10;
    const gaugeW = CONTENT_W;
    const gaugeH = 14;
    const segmentW = gaugeW / 5;
    const colors = [C.RED_ALERT, C.ORANGE_MED, C.YELLOW_WARN, rgb(0.5, 0.75, 0.2), C.GREEN_OK];
    const labels = ['<60%', '60-69%', '70-79%', '80-89%', '90%+'];

    for (let i = 0; i < 5; i++) {
      this.page.drawRectangle({
        x: M_LEFT + i * segmentW, y: gaugeY - gaugeH, width: segmentW - 1, height: gaugeH, color: colors[i],
      });
      const lw = this.fontRegular.widthOfTextAtSize(labels[i], 6);
      this.page.drawText(labels[i], {
        x: M_LEFT + i * segmentW + (segmentW - lw) / 2, y: gaugeY - gaugeH - 10,
        size: 6, font: this.fontRegular, color: C.MED_GRAY,
      });
    }

    const pct = Math.max(0, Math.min(100, probability));
    const pointerX = M_LEFT + (pct / 100) * gaugeW;
    this.page.drawText("v", { x: pointerX - 3, y: gaugeY + 4, size: 10, font: this.fontBold, color: C.DARK_BG });
    this.y -= 45;
  }

  drawDisclaimer() {
    this.space(10);
    this.drawGoldDivider();
    const disclaimerText = "AVISO LEGAL: Este informe v3.0 es una herramienta de orientacion basada en inteligencia artificial y no reemplaza la evaluacion clinica presencial. Los resultados son estimaciones basadas en la informacion proporcionada y literatura cientifica disponible (meta-analisis con n>50,000 pacientes). Consulte siempre con su implantologo antes de tomar decisiones de tratamiento.";
    this.drawText(disclaimerText, { size: 6.5, color: C.MED_GRAY, font: this.fontItalic, lineHeight: 9 });
    this.space(6);
    this.drawText("Dr. Carlos Montoya | Director Clinico | 11,000+ implantes | 27 anos de experiencia", {
      size: 7, color: C.GOLD_DARK, font: this.fontBold,
    });
  }

  drawUpsellBox(targetPlan: 'BASE' | 'COMPLETE', price: string) {
    const boxH = 90;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.drawBox({ height: boxH, bgColor: C.CREAM_BG, borderColor: C.GOLD, borderWidth: 1.5 });
    const bTop = this.y + boxH;

    const title = targetPlan === 'BASE' ? 'DESBLOQUEA TU PLAN DE ACCION' : 'ACCEDE A LA EVALUACION CLINICA AVANZADA';
    this.page.drawText(title, {
      x: M_LEFT + 10, y: bTop - 18, size: 11, font: this.fontBold, color: C.GOLD_DARK,
    });

    const features = targetPlan === 'BASE'
      ? [
          '>> Probabilidad de exito exacta con gauge visual',
          '>> Factores de riesgo detallados con RR',
          '>> Timeline de preparacion 4-6 semanas',
          '>> Protocolo post-operatorio completo',
        ]
      : [
          '>> Todo lo del Plan de Accion PLUS:',
          '>> Analisis de sinergias de factores',
          '>> Planificacion por sector anatomico',
          '>> Escenarios de adherencia y costos',
        ];

    let fY = bTop - 34;
    for (const f of features) {
      this.page.drawText(f, { x: M_LEFT + 14, y: fY, size: 7.5, font: this.fontRegular, color: C.TEXT });
      fY -= 12;
    }

    const priceW = this.fontBold.widthOfTextAtSize(price, 14);
    this.page.drawText(price, {
      x: PAGE_W - M_RIGHT - priceW - 15, y: bTop - 55, size: 14, font: this.fontBold, color: C.GOLD,
    });
    this.y -= boxH + 8;
  }

  drawPriorityBadge(priority: string, x: number, y: number) {
    const bgColor = priority === 'CRÍTICO' ? C.RED_ALERT : priority === 'IMPORTANTE' ? C.ORANGE_MED : C.GREEN_OK;
    const badgeW = this.fontBold.widthOfTextAtSize(priority, 6) + 8;
    this.page.drawRectangle({ x, y: y - 3, width: badgeW, height: 12, color: bgColor });
    this.page.drawText(priority, { x: x + 4, y, size: 6, font: this.fontBold, color: C.WHITE });
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}

// ============================================================
//  REPORT GENERATORS V3
// ============================================================

async function generateFreeReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('FREE');
  b.currentSubtitle = 'EVALUACION INICIAL';

  b.drawHeader('EVALUACION INICIAL - IMPLANTX v3.0');

  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.age || '-'} anos`],
      ['Ciudad', data.city || '-', 'Fecha', data.evaluationDate || '-'],
      ['Codigo', data.reportId || '-', 'Plan', 'EVALUACION INICIAL'],
    ],
    { colWidths: [80, 145, 80, CONTENT_W - 305], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);
  b.drawResultBoxV3(data, false);

  b.drawSectionTitle('Resumen Orientativo');
  const topFactors = data.mainAffectingFactors?.slice(0, 3).join(', ') || 'Multiples factores identificados';
  const summaryText = `Se han identificado ${data.riskFactors.length} factores clinicos relevantes en su evaluacion. Los principales son: ${topFactors}. Su clasificacion global es ${data.classification}. Para obtener su probabilidad exacta de exito y plan de accion personalizado, consulte el Plan de Accion.`;
  b.drawText(summaryText, { size: 9, lineHeight: 13, color: C.DARK_GRAY });

  b.space(6);
  b.drawSectionTitle('Que Incluye Esta Evaluacion');
  const includes = ['Clasificacion de riesgo global', 'Top 3 factores de riesgo identificados', 'Multiplicador de riesgo combinado'];
  for (const item of includes) {
    b.drawText(`  + ${item}`, { size: 8, color: C.GREEN_OK, font: b.fontRegular });
  }

  b.space(4);
  b.drawText('No incluye:', { size: 8, color: C.RED_ALERT, font: b.fontBold });
  const notIncludes = ['Probabilidad de exito exacta', 'Detalle de factores con RR y mecanismos', 'Timeline de preparacion 4-6 semanas', 'Protocolo post-operatorio'];
  for (const item of notIncludes) {
    b.drawText(`  x ${item}`, { size: 8, color: C.MED_GRAY, font: b.fontRegular });
  }

  b.space(8);
  b.drawUpsellBox('BASE', '$14.900 CLP');
  b.drawDisclaimer();
  b.drawFooterAllPages('EVALUACION INICIAL (GRATIS)');

  return b.save();
}

async function generateBaseReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('BASE');
  b.currentSubtitle = 'PLAN DE ACCION';

  // PAGE 1
  b.drawHeader('PLAN DE ACCION - IMPLANTX v3.0');

  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.age || '-'} anos`],
      ['Ciudad', data.city || '-', 'Fecha', data.evaluationDate || '-'],
      ['Codigo', data.reportId || '-', 'Plan', 'PLAN DE ACCION'],
    ],
    { colWidths: [80, 145, 80, CONTENT_W - 305], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);
  b.drawResultBoxV3(data, true);

  if (data.successProbability) {
    b.drawText('Escala visual de riesgo:', { size: 8, color: C.MED_GRAY, font: b.fontItalic });
    b.drawRiskGauge(data.successProbability);
  }

  // Risk Factors with RR
  if (data.riskFactors && data.riskFactors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo Detallados');
    const factorRows = data.riskFactors.map(f => [
      f.factorName,
      f.yourSituation,
      `${f.relativeRisk.toFixed(1)}x`,
      f.relativeRisk > 1.5 ? 'ALTO' : f.relativeRisk > 1.2 ? 'MODERADO' : 'BAJO',
    ]);
    b.drawTable(['Factor Clinico', 'Su Situacion', 'RR', 'Nivel'], factorRows, {
      colWidths: [140, 170, 55, CONTENT_W - 365]
    });
    b.space(2);
    b.drawText('RR = Riesgo Relativo. Un RR de 2.0x indica el doble de riesgo respecto a la poblacion base.', {
      size: 6.5, color: C.MED_GRAY, font: b.fontItalic,
    });
  }

  // PAGE 2 - Timeline
  b.newPage();
  b.drawHeader('PLAN DE ACCION - IMPLANTX v3.0');

  if (data.preparationTimeline && data.preparationTimeline.length > 0) {
    b.drawSectionTitle('Timeline de Preparacion');
    for (const week of data.preparationTimeline) {
      b.drawText(`${week.weekLabel}`, { size: 10, font: b.fontBold, color: C.GOLD_DARK });
      for (const action of week.actions) {
        b.drawPriorityBadge(action.category, M_LEFT + 10, b.y);
        const badgeW = b.fontBold.widthOfTextAtSize(action.category, 6) + 18;
        b.drawText(action.action, {
          x: M_LEFT + badgeW, size: 8, color: C.TEXT, maxWidth: CONTENT_W - badgeW,
        });
        b.space(4);
      }
      b.space(6);
    }
  }

  // Post-Op Protocol
  if (data.postOpProtocol && data.postOpProtocol.length > 0) {
    b.drawSectionTitle('Protocolo Post-Operatorio');
    for (const phase of data.postOpProtocol) {
      b.drawText(`${phase.period}:`, { size: 9, font: b.fontBold, color: C.BLUE_ACCENT });
      for (const action of phase.actions) {
        b.drawText(`  - ${action}`, { size: 8, color: C.TEXT });
      }
      b.space(4);
    }
  }

  b.space(10);
  b.drawUpsellBox('COMPLETE', '$29.990 CLP');

  b.drawDisclaimer();
  b.drawFooterAllPages('PLAN DE ACCION');

  return b.save();
}

async function generateCompleteReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('COMPLETE');
  b.currentSubtitle = 'EVALUACION CLINICA AVANZADA';

  // PAGE 1
  b.drawHeader('EVALUACION CLINICA AVANZADA - IMPLANTX v3.0');

  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.age || '-'} anos`],
      ['Ciudad', data.city || '-', 'Fecha', data.evaluationDate || '-'],
      ['Codigo', data.reportId || '-', 'Plan', 'PREMIUM'],
    ],
    { colWidths: [80, 145, 80, CONTENT_W - 305], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);
  b.drawResultBoxV3(data, true);

  if (data.successProbability) {
    b.drawRiskGauge(data.successProbability);
  }

  // Risk Factors with full detail
  if (data.riskFactors && data.riskFactors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo con Acciones');
    const factorRows = data.riskFactors.map(f => [
      f.factorName,
      f.yourSituation,
      `${f.relativeRisk.toFixed(1)}x`,
      f.requiredActions[0] || 'Monitorizar',
    ]);
    b.drawTable(['Factor', 'Su Situacion', 'RR', 'Accion Principal'], factorRows, {
      colWidths: [120, 135, 50, CONTENT_W - 305]
    });
  }

  // PAGE 2 - Timeline + Protocol
  b.newPage();
  b.drawHeader('EVALUACION CLINICA AVANZADA - IMPLANTX v3.0');

  if (data.preparationTimeline && data.preparationTimeline.length > 0) {
    b.drawSectionTitle('Timeline de Preparacion Detallado');
    for (const week of data.preparationTimeline) {
      b.drawText(`${week.weekLabel}`, { size: 10, font: b.fontBold, color: C.GOLD_DARK });
      for (const action of week.actions) {
        b.drawPriorityBadge(action.category, M_LEFT + 10, b.y);
        const badgeW = b.fontBold.widthOfTextAtSize(action.category, 6) + 18;
        b.drawText(action.action, {
          x: M_LEFT + badgeW, size: 8, color: C.TEXT, maxWidth: CONTENT_W - badgeW,
        });
        b.space(4);
      }
      b.space(6);
    }
  }

  // Post-Op Protocol
  if (data.postOpProtocol && data.postOpProtocol.length > 0) {
    b.drawSectionTitle('Protocolo Post-Operatorio');
    for (const phase of data.postOpProtocol) {
      b.drawText(`${phase.period}:`, { size: 9, font: b.fontBold, color: C.BLUE_ACCENT });
      for (const action of phase.actions) {
        b.drawText(`  - ${action}`, { size: 8, color: C.TEXT });
      }
      b.space(4);
    }
  }

  // PAGE 3 - Synergies (PREMIUM EXCLUSIVE)
  b.newPage();
  b.drawHeader('EVALUACION CLINICA AVANZADA - IMPLANTX v3.0');

  if (data.factorSynergies && data.factorSynergies.length > 0) {
    b.drawSectionTitle('Analisis de Sinergias de Factores (Exclusivo)');
    b.drawText('Las sinergias representan interacciones entre factores que multiplican el riesgo mas alla de la simple suma.', {
      size: 8, color: C.MED_GRAY, font: b.fontItalic,
    });
    b.space(6);
    const synergyRows = data.factorSynergies.map(s => [
      s.factorsCombined.join(' + '),
      `${s.actualMultiplier.toFixed(1)}x`,
      s.finalRiskReduction.totalReduction,
    ]);
    b.drawTable(['Combinacion de Factores', 'Multiplicador', 'Reduccion Posible'], synergyRows, {
      colWidths: [200, 80, CONTENT_W - 280], headerBg: C.RED_ALERT, headerColor: C.WHITE, altRowBg: C.PINK_LIGHT,
    });
  }

  // Anatomical Sectors (PREMIUM EXCLUSIVE)
  if (data.anatomicalSectors && data.anatomicalSectors.length > 0) {
    b.drawSectionTitle('Planificacion por Sector Anatomico (Exclusivo)');
    const sectorRows = data.anatomicalSectors.map(s => [
      s.sectorName,
      s.teeth,
      s.sacClassification,
      s.riskLevel,
      s.estimatedCost,
    ]);
    b.drawTable(['Sector', 'Dientes', 'SAC', 'Riesgo', 'Costo Est.'], sectorRows, {
      colWidths: [100, 90, 40, 90, CONTENT_W - 320], headerBg: C.BLUE_ACCENT, headerColor: C.WHITE, altRowBg: C.BLUE_LIGHT,
    });
  }

  // PAGE 4 - Scenarios (PREMIUM EXCLUSIVE)
  b.newPage();
  b.drawHeader('EVALUACION CLINICA AVANZADA - IMPLANTX v3.0');

  if (data.adherenceScenarios && data.adherenceScenarios.length > 0) {
    b.drawSectionTitle('Escenarios de Adherencia (Exclusivo)');
    for (const scenario of data.adherenceScenarios) {
      const bgColor = scenario.adherenceLevel === '100%' ? C.GREEN_OK :
                      scenario.adherenceLevel === 'PARCIAL' ? C.YELLOW_WARN : C.RED_ALERT;
      b.drawText(`${scenario.icon} ${scenario.scenarioName}`, { size: 10, font: b.fontBold, color: bgColor });
      b.drawText(`Exito: ${scenario.results.successProbabilityOverall} | Cicatrizacion: ${scenario.results.healingTime}`, {
        size: 8, color: C.TEXT,
      });
      b.drawText(`Costo total: ${scenario.results.totalEstimatedCost.total}`, {
        size: 8, color: C.MED_GRAY, font: b.fontItalic,
      });
      if (scenario.specialWarning) {
        b.drawText(`⚠️ ${scenario.specialWarning}`, { size: 7, color: C.RED_ALERT, font: b.fontBold });
      }
      b.space(8);
    }
  }

  // CTA
  b.space(8);
  b.drawSectionTitle('Proximos Pasos');
  const steps = [
    '1. Videoconferencia con el Dr. Montoya para revision del informe (incluida)',
    '2. Envio de imagenes radiograficas complementarias (panoramica o CBCT)',
    '3. El pago de $29.990 se abona integramente al tratamiento final',
    '4. Incluye 2 noches de estadia en Santiago durante el tratamiento',
  ];
  for (const s of steps) {
    b.drawText(s, { size: 8.5, color: C.TEXT });
    b.space(3);
  }

  b.drawDisclaimer();
  b.drawFooterAllPages('EVALUACION CLINICA AVANZADA (PREMIUM)');

  return b.save();
}

// ============================================================
//  HANDLER
// ============================================================
const handler = async (req: Request): Promise<Response> => {
  console.log("generate-pdf-report-v3 function invoked");
  const headers = corsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const data: ReportDataV3 = await req.json();
    const plan = data.plan || 'FREE';
    console.log('Generating v3 PDF report:', data.reportId, 'Plan:', plan);

    let pdfBytes: Uint8Array;

    switch (plan) {
      case 'COMPLETE':
        pdfBytes = await generateCompleteReportV3(data);
        break;
      case 'BASE':
        pdfBytes = await generateBaseReportV3(data);
        break;
      default:
        pdfBytes = await generateFreeReportV3(data);
        break;
    }

    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    const planSuffix = plan === 'COMPLETE' ? '_Premium'
      : plan === 'BASE' ? '_PlanAccion'
      : '_Inicial';

    const numPages = plan === 'COMPLETE' ? 4 : plan === 'BASE' ? 2 : 1;
    console.log('v3 PDF generated successfully, pages:', numPages);

    return new Response(
      JSON.stringify({
        success: true,
        pdf: base64Pdf,
        downloadName: `ImplantX_v3${planSuffix}_${data.reportId}.pdf`,
        contentType: 'application/pdf',
        plan: plan,
        pages: numPages,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...headers } }
    );
  } catch (error: any) {
    console.error("Error generating v3 PDF report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json", ...headers } }
    );
  }
};

serve(handler);
