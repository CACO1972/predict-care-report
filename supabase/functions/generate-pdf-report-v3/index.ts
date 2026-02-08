import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1";

// ============================================================
//  ImplantX PDF Report Generator v3.0 - FULL 12-PAGE VERSION
//  Structure: FREE(3 pages) | BASE(7 pages) | COMPLETE(12 pages)
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
//  V3 TYPES
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
  title?: string;
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

// What-If Simulator types
interface WhatIfFactor {
  id: string;
  name: string;
  icon: string;
  currentState: string;
  currentRR: number;
  optimizedRR: number;
  improvement: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actionRequired: string;
}

interface WhatIfData {
  factors: WhatIfFactor[];
  currentSuccess: number;
  optimizedSuccess: number;
  currentCost: number;
  optimizedCost: number;
}

// Treatment Alternatives types
interface TreatmentOption {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  initialCost: number;
  maintenanceCost: number;
  lifespan: string;
  totalCost25Years: number;
  successRate: string;
  satisfaction: string;
  timeline: string;
  bestFor: string;
  warnings?: string[];
}

interface TreatmentAlternativesData {
  options: TreatmentOption[];
  recommendedId: string;
  patientProfile: string;
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
  
  // BASE + PREMIUM tier
  whatIfData?: WhatIfData;
  
  // PREMIUM tier only
  factorSynergies?: FactorSynergy[];
  anatomicalSectors?: AnatomicalSector[];
  adherenceScenarios?: AdherenceScenario[];
  treatmentAlternatives?: TreatmentAlternativesData;
}

// ============================================================
//  COLORS - Gold/Dark Premium Theme
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

  drawBulletPoint(text: string, opts: { size?: number; color?: any; indent?: number } = {}) {
    const { size = 9, color = C.TEXT, indent = 0 } = opts;
    this.drawText(`• ${text}`, { x: M_LEFT + 10 + indent, size, color, maxWidth: CONTENT_W - 20 - indent });
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

  drawSubsectionTitle(text: string) {
    this.y -= 4;
    this.page.drawText(text, {
      x: M_LEFT, y: this.y, size: 9, font: this.fontBold, color: C.GOLD_DARK,
    });
    this.y -= 14;
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

  drawInfoBox(title: string, content: string[], bgColor: any = C.BEIGE_BG, borderColor: any = C.GOLD) {
    const boxH = 20 + content.length * 14;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.drawBox({ height: boxH, bgColor, borderColor, borderWidth: 1 });
    const boxTop = this.y;
    this.page.drawText(title, {
      x: M_LEFT + 10, y: boxTop - 14, size: 9, font: this.fontBold, color: C.DARK_BG,
    });
    let yPos = boxTop - 28;
    for (const line of content) {
      this.page.drawText(`• ${line}`, {
        x: M_LEFT + 12, y: yPos, size: 8, font: this.fontRegular, color: C.TEXT,
      });
      yPos -= 14;
    }
    this.y -= boxH + 8;
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

  drawPriorityBadge(priority: string, x: number, y: number): number {
    const bgColor = priority === 'CRÍTICO' ? C.RED_ALERT : priority === 'IMPORTANTE' ? C.ORANGE_MED : C.GREEN_OK;
    const badgeW = this.fontBold.widthOfTextAtSize(priority, 6) + 10;
    this.page.drawRectangle({ x, y: y - 3, width: badgeW, height: 12, color: bgColor });
    this.page.drawText(priority, { x: x + 5, y, size: 6, font: this.fontBold, color: C.WHITE });
    return badgeW;
  }

  drawResultBoxV3(data: ReportDataV3, showProbability: boolean) {
    const boxH = showProbability ? 90 : 75;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    const classColor = this.getClassificationColor(data.classification);
    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1.5 });
    const boxTop = this.y;

    this.page.drawText("RESULTADO DE LA EVALUACION", {
      x: M_LEFT + 10, y: boxTop - 16, size: 9, font: this.fontBold, color: C.GOLD_DARK,
    });

    if (showProbability) {
      const probText = `${data.successProbability}%`;
      const probW = this.fontBold.widthOfTextAtSize(probText, 44);
      this.page.drawText(probText, {
        x: M_LEFT + 10, y: boxTop - 62, size: 44, font: this.fontBold, color: C.GOLD,
      });
      this.page.drawText("probabilidad de exito", {
        x: M_LEFT + probW + 18, y: boxTop - 46, size: 10, font: this.fontItalic, color: C.MED_GRAY,
      });
      
      // Draw progress bar for probability
      const barW = 180;
      const barH = 8;
      const barX = M_LEFT + probW + 18;
      const barY = boxTop - 70;
      this.page.drawRectangle({ x: barX, y: barY, width: barW, height: barH, color: C.LIGHT_GRAY });
      const fillW = (data.successProbability / 100) * barW;
      const fillColor = data.successProbability >= 90 ? C.GREEN_OK : data.successProbability >= 70 ? C.YELLOW_WARN : C.RED_ALERT;
      this.page.drawRectangle({ x: barX, y: barY, width: fillW, height: barH, color: fillColor });
    } else {
      this.page.drawText("- - %", {
        x: M_LEFT + 10, y: boxTop - 55, size: 38, font: this.fontBold, color: C.LIGHT_GRAY,
      });
      this.page.drawText("Disponible en Plan de Accion", {
        x: M_LEFT + 100, y: boxTop - 42, size: 8, font: this.fontItalic, color: C.MED_GRAY,
      });
    }

    const classW = this.fontBold.widthOfTextAtSize(data.classification, 11);
    this.page.drawText(data.classification, {
      x: PAGE_W - M_RIGHT - classW - 10, y: boxTop - 35,
      size: 11, font: this.fontBold, color: classColor,
    });

    const riskLabel = `Indice de Riesgo: ${data.globalRiskMultiplier.toFixed(2)}x`;
    const riskW = this.fontRegular.widthOfTextAtSize(riskLabel, 9);
    this.page.drawText(riskLabel, {
      x: PAGE_W - M_RIGHT - riskW - 10, y: boxTop - 52,
      size: 9, font: this.fontRegular, color: C.MED_GRAY,
    });

    this.y -= boxH + 10;
  }

  drawRiskGauge(probability: number) {
    if (this.y < M_BOTTOM + FOOTER_H + 50) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    const gaugeY = this.y - 10;
    const gaugeW = CONTENT_W;
    const gaugeH = 16;
    const segmentW = gaugeW / 5;
    const colors = [C.RED_ALERT, C.ORANGE_MED, C.YELLOW_WARN, rgb(0.5, 0.75, 0.2), C.GREEN_OK];
    const labels = ['<60%', '60-69%', '70-79%', '80-89%', '90%+'];

    for (let i = 0; i < 5; i++) {
      this.page.drawRectangle({
        x: M_LEFT + i * segmentW, y: gaugeY - gaugeH, width: segmentW - 1, height: gaugeH, color: colors[i],
      });
      const lw = this.fontRegular.widthOfTextAtSize(labels[i], 7);
      this.page.drawText(labels[i], {
        x: M_LEFT + i * segmentW + (segmentW - lw) / 2, y: gaugeY - gaugeH - 12,
        size: 7, font: this.fontRegular, color: C.MED_GRAY,
      });
    }

    const pct = Math.max(0, Math.min(100, probability));
    const pointerX = M_LEFT + (pct / 100) * gaugeW;
    // Draw pointer as simple "V" text (font doesn't support Unicode triangles)
    this.page.drawText("V", { x: pointerX - 4, y: gaugeY + 4, size: 12, font: this.fontBold, color: C.DARK_BG });
    this.y -= 50;
  }

  drawDisclaimer() {
    this.space(10);
    this.drawGoldDivider();
    const disclaimerText = "AVISO LEGAL: Este informe es una herramienta de orientacion basada en inteligencia artificial y NO reemplaza la evaluacion clinica presencial. Los resultados son estimaciones basadas en la informacion proporcionada y literatura cientifica disponible (meta-analisis con n>50,000 pacientes). Consulte SIEMPRE con su implantologo antes de tomar decisiones de tratamiento.";
    this.drawText(disclaimerText, { size: 6.5, color: C.MED_GRAY, font: this.fontItalic, lineHeight: 9 });
    this.space(6);
    this.drawText("Dr. Carlos Montoya | Director Clinico | 11,000+ implantes | 27 anos de experiencia", {
      size: 7, color: C.GOLD_DARK, font: this.fontBold,
    });
  }

  drawUpsellBox(targetPlan: 'BASE' | 'COMPLETE', price: string) {
    const boxH = 95;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.drawBox({ height: boxH, bgColor: C.CREAM_BG, borderColor: C.GOLD, borderWidth: 2 });
    const bTop = this.y + boxH;

    const title = targetPlan === 'BASE' ? 'DESBLOQUEA TU PLAN DE ACCION' : 'ACCEDE A LA EVALUACION CLINICA AVANZADA';
    this.page.drawText(title, {
      x: M_LEFT + 10, y: bTop - 18, size: 12, font: this.fontBold, color: C.GOLD_DARK,
    });

    const features = targetPlan === 'BASE'
      ? [
          '>> Probabilidad de exito exacta con gauge visual',
          '>> 3 factores de riesgo detallados (1 pagina cada uno)',
          '>> Timeline de preparacion 4-6 semanas',
          '>> Protocolo post-operatorio completo',
        ]
      : [
          '>> Todo lo del Plan de Accion PLUS:',
          '>> Analisis de sinergias de factores (2 paginas)',
          '>> Planificacion por sector anatomico',
          '>> Escenarios de adherencia con costos',
          '>> Proximos pasos personalizados',
        ];

    let fY = bTop - 36;
    for (const f of features) {
      this.page.drawText(f, { x: M_LEFT + 14, y: fY, size: 8, font: this.fontRegular, color: C.TEXT });
      fY -= 12;
    }

    const priceW = this.fontBold.widthOfTextAtSize(price, 16);
    this.page.drawText(price, {
      x: PAGE_W - M_RIGHT - priceW - 15, y: bTop - 55, size: 16, font: this.fontBold, color: C.GOLD,
    });
    this.y -= boxH + 8;
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}

// ============================================================
//  PAGE GENERATORS
// ============================================================

// ----- PORTADA (Cover Page) -----
function drawCoverPage(b: PDFBuilderV3, data: ReportDataV3) {
  b.newPage();
  const p = b.page;
  
  // Full dark background
  p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.DARK_BG });
  
  // Gold decorative lines
  p.drawRectangle({ x: 50, y: PAGE_H - 100, width: PAGE_W - 100, height: 2, color: C.GOLD });
  p.drawRectangle({ x: 50, y: 180, width: PAGE_W - 100, height: 2, color: C.GOLD });
  
  // Title
  const title = "IMPLANTX";
  const titleW = b.fontBold.widthOfTextAtSize(title, 48);
  p.drawText(title, { x: (PAGE_W - titleW) / 2, y: PAGE_H - 200, size: 48, font: b.fontBold, color: C.GOLD });
  
  const subtitle = "Evaluacion Inteligente de Implantes Dentales";
  const subW = b.fontRegular.widthOfTextAtSize(subtitle, 14);
  p.drawText(subtitle, { x: (PAGE_W - subW) / 2, y: PAGE_H - 230, size: 14, font: b.fontRegular, color: C.GOLD_LIGHT });
  
  const report = "Informe Clinico Personalizado";
  const repW = b.fontItalic.widthOfTextAtSize(report, 16);
  p.drawText(report, { x: (PAGE_W - repW) / 2, y: PAGE_H - 290, size: 16, font: b.fontItalic, color: C.WHITE });
  
  // Patient info block
  const infoY = PAGE_H - 380;
  const planLabel = data.plan === 'COMPLETE' ? 'PREMIUM - $29.990 CLP' : data.plan === 'BASE' ? 'PLAN DE ACCION - $14.900 CLP' : 'EVALUACION INICIAL';
  const numPages = data.plan === 'COMPLETE' ? '12' : data.plan === 'BASE' ? '7' : '3';
  
  const infos = [
    ['Paciente:', data.patientName || '-'],
    ['Edad:', `${data.age || '-'} anos`],
    ['Ciudad:', data.city || '-'],
    ['ID Reporte:', data.reportId || '-'],
    ['Fecha de Evaluacion:', data.evaluationDate || '-'],
  ];
  
  let yPos = infoY;
  for (const [label, value] of infos) {
    p.drawText(label, { x: M_LEFT + 100, y: yPos, size: 11, font: b.fontRegular, color: C.MED_GRAY });
    p.drawText(value, { x: M_LEFT + 240, y: yPos, size: 11, font: b.fontBold, color: C.WHITE });
    yPos -= 24;
  }
  
  // Plan badge
  const badgeY = 280;
  const badgeW = b.fontBold.widthOfTextAtSize(`[${planLabel}]`, 14);
  p.drawText(`[${planLabel}]`, { x: (PAGE_W - badgeW) / 2, y: badgeY, size: 14, font: b.fontBold, color: C.GOLD });
  
  // Footer text
  const footerText = `Este reporte contiene ${numPages} paginas de analisis clinico personalizado`;
  const footerW = b.fontRegular.widthOfTextAtSize(footerText, 10);
  p.drawText(footerText, { x: (PAGE_W - footerW) / 2, y: 220, size: 10, font: b.fontRegular, color: C.GOLD_LIGHT });
  
  const footerText2 = "basado en evidencia cientifica de nivel internacional";
  const footerW2 = b.fontRegular.widthOfTextAtSize(footerText2, 10);
  p.drawText(footerText2, { x: (PAGE_W - footerW2) / 2, y: 205, size: 10, font: b.fontRegular, color: C.GOLD_LIGHT });
}

// ----- RESUMEN EJECUTIVO (Executive Summary) -----
function drawExecutiveSummaryPage(b: PDFBuilderV3, data: ReportDataV3, showProbability: boolean) {
  b.newPage();
  b.drawHeader('RESUMEN EJECUTIVO');
  
  b.drawSectionTitle('Resumen Ejecutivo');
  b.drawResultBoxV3(data, showProbability);
  
  if (showProbability) {
    b.drawRiskGauge(data.successProbability);
  }
  
  // Top 3 factors
  b.drawSectionTitle('Top 3 Factores que Mas Afectan');
  const topFactors = data.riskFactors.slice(0, 3);
  for (let i = 0; i < topFactors.length; i++) {
    const f = topFactors[i];
    const icon = i === 0 ? '1' : i === 1 ? '2' : '3';
    b.drawText(`${icon}. ${f.factorName} ----------- Impacto: ${f.relativeRisk.toFixed(1)}x`, {
      size: 10, font: b.fontBold, color: f.relativeRisk > 1.5 ? C.RED_ALERT : C.YELLOW_WARN,
    });
    b.space(6);
  }
  
  // Critical alert box
  b.space(10);
  const alertBgColor = data.classification === 'DESFAVORABLE' ? C.PINK_LIGHT : C.CREAM_BG;
  b.drawInfoBox(
    '⚠️ ALERTA CRITICA',
    [
      'Su perfil de riesgo requiere optimizacion ANTES de proceder con cirugia.',
      'La preparacion adecuada puede reducir el riesgo hasta en un 60-70%.',
      'Siga el protocolo de preparacion incluido en este informe.',
    ],
    alertBgColor,
    data.classification === 'DESFAVORABLE' ? C.RED_ALERT : C.GOLD
  );
}

// ----- FACTOR DE RIESGO (1 page per factor) -----
function drawRiskFactorPage(b: PDFBuilderV3, factor: RiskFactorV3, index: number, total: number) {
  b.newPage();
  b.drawHeader(`FACTOR ${index + 1} DE ${total}`);
  
  // Title box
  const titleBoxH = 45;
  b.drawBox({ height: titleBoxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1.5 });
  const boxTop = b.y + titleBoxH;
  b.page.drawText(factor.factorName.toUpperCase(), {
    x: M_LEFT + 15, y: boxTop - 22, size: 16, font: b.fontBold, color: C.DARK_BG,
  });
  const rrText = `[RR: ${factor.relativeRisk.toFixed(1)}x]`;
  const rrW = b.fontBold.widthOfTextAtSize(rrText, 14);
  b.page.drawText(rrText, {
    x: PAGE_W - M_RIGHT - rrW - 15, y: boxTop - 20, size: 14, font: b.fontBold, color: C.RED_ALERT,
  });
  const riskLevel = factor.relativeRisk > 1.8 ? 'RIESGO ALTO' : factor.relativeRisk > 1.3 ? 'RIESGO MODERADO' : 'RIESGO BAJO';
  b.page.drawText(`(${riskLevel})`, {
    x: M_LEFT + 15, y: boxTop - 36, size: 9, font: b.fontItalic, color: C.MED_GRAY,
  });
  b.y -= titleBoxH + 12;
  
  // SU SITUACIÓN
  b.drawSubsectionTitle('📍 SU SITUACION');
  b.drawText(factor.yourSituation, { size: 10, color: C.TEXT });
  b.drawGoldDivider();
  
  // ¿QUÉ SIGNIFICA PARA USTED?
  b.drawSubsectionTitle('📊 ¿QUE SIGNIFICA PARA USTED?');
  b.drawText(factor.realWorldComparison, { size: 9, color: C.TEXT, lineHeight: 13 });
  b.drawGoldDivider();
  
  // ¿POR QUÉ AFECTA LOS IMPLANTES? - Biological Mechanisms
  b.drawSubsectionTitle('🔬 ¿POR QUE AFECTA LOS IMPLANTES?');
  for (const mech of factor.biologicalMechanisms.slice(0, 3)) {
    b.drawInfoBox(mech.title, mech.points, C.BLUE_LIGHT, C.BLUE_ACCENT);
  }
  
  // ACCIÓN REQUERIDA
  b.drawSubsectionTitle('✅ ACCION REQUERIDA');
  for (const action of factor.requiredActions) {
    b.drawBulletPoint(action, { size: 9 });
  }
  b.space(6);
  
  // BENEFICIO SI SIGUE EL PROTOCOLO
  b.drawSubsectionTitle('🎯 BENEFICIO SI SIGUE EL PROTOCOLO');
  b.drawBulletPoint(`Reduccion de riesgo: ${factor.adherenceBenefit.riskReduction}`, { size: 9, color: C.GREEN_OK });
  b.drawBulletPoint(`Aumento de exito: ${factor.adherenceBenefit.successIncrease}`, { size: 9, color: C.GREEN_OK });
  b.drawBulletPoint(`Menos complicaciones: ${factor.adherenceBenefit.complicationsReduction}`, { size: 9, color: C.GREEN_OK });
  b.space(6);
  
  // RECURSOS DE APOYO
  if (factor.supportResources && factor.supportResources.length > 0) {
    b.drawSubsectionTitle('🆘 RECURSOS DE APOYO');
    for (const res of factor.supportResources.slice(0, 4)) {
      b.drawBulletPoint(res, { size: 8, color: C.BLUE_ACCENT });
    }
    b.space(4);
  }
  
  // EVIDENCIA CIENTÍFICA
  b.drawGoldDivider();
  const evidenceLabel = factor.evidenceLevel === 'A' ? 'Nivel A (Maxima evidencia)' :
                        factor.evidenceLevel === 'B' ? 'Nivel B (Buena evidencia)' : 'Nivel C (Evidencia moderada)';
  b.drawText(`📚 EVIDENCIA CIENTIFICA: ${evidenceLabel}`, { size: 8, font: b.fontBold, color: C.GOLD_DARK });
  b.drawText(factor.scientificReference, { size: 7, color: C.MED_GRAY, font: b.fontItalic });
}

// ----- TIMELINE DE PREPARACIÓN -----
function drawTimelinePage(b: PDFBuilderV3, data: ReportDataV3) {
  b.newPage();
  b.drawHeader('PROTOCOLO DE PREPARACION');
  
  b.drawSectionTitle('📅 Protocolo de Preparacion Pre-operatoria');
  b.drawText('Periodo: 4-6 semanas antes de la cirugia', { size: 10, font: b.fontItalic, color: C.GOLD_DARK });
  b.space(4);
  b.drawText('Este protocolo personalizado optimiza su organismo para maximizar las probabilidades de exito. Cada accion tiene impacto directo y cuantificable en el resultado final.', {
    size: 9, color: C.TEXT, lineHeight: 13,
  });
  b.drawGoldDivider();
  
  for (const week of data.preparationTimeline) {
    b.drawSubsectionTitle(`🗓️ ${week.weekLabel}`);
    for (const action of week.actions) {
      const badgeW = b.drawPriorityBadge(action.category, M_LEFT + 5, b.y);
      b.drawText(action.action, {
        x: M_LEFT + badgeW + 12, size: 8.5, color: C.TEXT, maxWidth: CONTENT_W - badgeW - 20,
      });
      b.space(6);
    }
    b.space(8);
  }
}

// ----- PROTOCOLO POST-OPERATORIO -----
function drawPostOpPage(b: PDFBuilderV3, data: ReportDataV3) {
  b.newPage();
  b.drawHeader('PROTOCOLO POST-OPERATORIO');
  
  b.drawSectionTitle('🏥 Protocolo Post-Operatorio');
  
  for (const phase of data.postOpProtocol) {
    b.drawSubsectionTitle(`⏰ ${phase.period}${phase.title ? ` - ${phase.title}` : ''}`);
    for (const action of phase.actions) {
      b.drawBulletPoint(action, { size: 9 });
    }
    b.space(8);
  }
  
  // Alert box
  b.space(10);
  b.drawInfoBox(
    '⚠️ SENALES DE ALARMA - CONTACTAR INMEDIATAMENTE',
    [
      'Sangrado abundante NO cede despues de 2 horas',
      'Fiebre >38.5°C despues de 48 horas',
      'Dolor severo NO responde a analgesicos',
      'Inflamacion AUMENTA despues del dia 4',
      'Pus o secrecion con mal olor',
      'Movilidad del implante',
      '📞 Urgencias 24/7: +56 9 7415 7966',
    ],
    C.PINK_LIGHT,
    C.RED_ALERT
  );
}

// ----- ANÁLISIS DE SINERGIAS (PREMIUM) - 2 pages -----
function drawSynergiesPages(b: PDFBuilderV3, data: ReportDataV3) {
  if (!data.factorSynergies || data.factorSynergies.length === 0) return;
  
  // PAGE 1: Mechanisms
  b.newPage();
  b.drawHeader('ANALISIS DE SINERGIAS');
  
  b.drawSectionTitle('🔗 Analisis de Sinergias de Riesgo');
  
  for (const synergy of data.factorSynergies.slice(0, 2)) {
    b.drawSubsectionTitle(`SINERGIA: ${synergy.factorsCombined.join(' × ')}`);
    
    // Show multiplication effect
    b.drawText('TU PERFIL:', { size: 9, font: b.fontBold, color: C.TEXT });
    b.space(2);
    for (let i = 0; i < synergy.factorsCombined.length; i++) {
      b.drawText(`  ${synergy.factorsCombined[i]}`, { size: 8, color: C.MED_GRAY });
    }
    b.space(4);
    
    b.drawText(`❌ SUMA SIMPLE (incorrecto): Suma individual`, { size: 8, color: C.MED_GRAY });
    b.drawText(`✓ EFECTO MULTIPLICATIVO (real): ${synergy.actualMultiplier.toFixed(2)}x`, { size: 9, font: b.fontBold, color: C.RED_ALERT });
    b.space(6);
    
    b.drawText('¿POR QUE SE MULTIPLICA EN LUGAR DE SUMAR?', { size: 9, font: b.fontBold, color: C.GOLD_DARK });
    b.space(4);
    
    for (const mech of synergy.biologicalSynergies.slice(0, 3)) {
      b.drawInfoBox(mech.title, mech.points, C.PINK_LIGHT, C.RED_ALERT);
    }
    
    b.space(4);
    b.drawText('EVIDENCIA CIENTIFICA:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
    b.drawText(synergy.scientificEvidence, { size: 7, color: C.MED_GRAY, font: b.fontItalic });
    b.drawGoldDivider();
  }
  
  // PAGE 2: Intervention Strategy
  b.newPage();
  b.drawHeader('ESTRATEGIA DE INTERVENCION');
  
  b.drawSectionTitle('🎯 Estrategia de Intervencion Priorizada');
  
  for (const synergy of data.factorSynergies.slice(0, 1)) {
    for (const intervention of synergy.prioritizedInterventions) {
      b.drawSubsectionTitle(`PRIORIDAD #${intervention.priority}: ${intervention.action}`);
      b.drawText(`Impacto: ${intervention.impact}`, { size: 9, color: C.TEXT });
      b.drawText(`Si completa protocolo: ${intervention.resultIfCompletes}`, { size: 9, color: C.GREEN_OK, font: b.fontBold });
      b.space(8);
    }
    
    // Final optimization result
    b.drawGoldDivider();
    b.drawSectionTitle('Resultado Final de Optimizacion');
    b.drawText(`Actual: ${synergy.finalRiskReduction.currentRisk} → Optimizado: ${synergy.finalRiskReduction.optimizedRisk}`, {
      size: 11, font: b.fontBold, color: C.GOLD_DARK,
    });
    b.drawText(`REDUCCION TOTAL: ${synergy.finalRiskReduction.totalReduction}`, {
      size: 12, font: b.fontBold, color: C.GREEN_OK,
    });
  }
}

// ----- SECTORES ANATÓMICOS (PREMIUM) -----
function drawAnatomicalSectorPage(b: PDFBuilderV3, data: ReportDataV3) {
  if (!data.anatomicalSectors || data.anatomicalSectors.length === 0) return;
  
  b.newPage();
  b.drawHeader('PLANIFICACION ANATOMICA');
  
  b.drawSectionTitle('🦷 Planificacion por Sector Anatomico');
  
  for (const sector of data.anatomicalSectors.slice(0, 2)) {
    b.drawSubsectionTitle(`SECTOR: ${sector.sectorName} (${sector.teeth})`);
    
    const sacLabel = sector.sacClassification === 'S' ? 'SIMPLE' : sector.sacClassification === 'A' ? 'AVANZADO' : 'COMPLEJO';
    b.drawText(`Clasificacion ITI-SAC: ${sacLabel} | Nivel de Riesgo: ${sector.riskLevel}`, {
      size: 9, font: b.fontBold, color: sector.riskLevel === 'ALTO' ? C.RED_ALERT : C.YELLOW_WARN,
    });
    b.space(6);
    
    // Anatomical challenges
    b.drawText('DESAFIOS ANATOMICOS:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
    for (const challenge of sector.anatomicalChallenges.slice(0, 3)) {
      b.drawBulletPoint(`${challenge.challenge} → ${challenge.impact}`, { size: 8 });
    }
    b.space(6);
    
    // Protocol table
    if (sector.specificProtocol.length > 0) {
      b.drawText('PROTOCOLO ESPECIFICO:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
      b.space(4);
      const rows = sector.specificProtocol.map(p => [p.phase, p.timing, p.details, p.duration]);
      b.drawTable(['Fase', 'Timing', 'Detalles', 'Duracion'], rows, {
        colWidths: [90, 70, 180, CONTENT_W - 340],
        fontSize: 7,
      });
    }
    
    b.drawText(`TIMELINE TOTAL: ${sector.totalTimeline}`, { size: 9, font: b.fontBold, color: C.BLUE_ACCENT });
    b.space(4);
    
    // Specific risks
    b.drawText('RIESGOS ESPECIFICOS:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
    for (const risk of sector.specificRisks.slice(0, 3)) {
      b.drawBulletPoint(`${risk.riskType}: ${risk.probabilityRange}`, { size: 8, color: C.RED_ALERT });
    }
    b.space(4);
    
    // Cost
    b.drawText(`COSTO ESTIMADO: ${sector.estimatedCost}`, { size: 10, font: b.fontBold, color: C.GOLD });
    b.drawGoldDivider();
  }
}

// ----- ESCENARIOS DE ADHERENCIA (PREMIUM) -----
function drawAdherenceScenariosPage(b: PDFBuilderV3, data: ReportDataV3) {
  if (!data.adherenceScenarios || data.adherenceScenarios.length === 0) return;
  
  b.newPage();
  b.drawHeader('ESCENARIOS DE ADHERENCIA');
  
  b.drawSectionTitle('📊 Comparacion de Escenarios de Adherencia');
  
  for (const scenario of data.adherenceScenarios) {
    const bgColor = scenario.adherenceLevel === '100%' ? C.BLUE_LIGHT :
                    scenario.adherenceLevel === 'PARCIAL' ? C.CREAM_BG : C.PINK_LIGHT;
    const borderColor = scenario.adherenceLevel === '100%' ? C.GREEN_OK :
                        scenario.adherenceLevel === 'PARCIAL' ? C.YELLOW_WARN : C.RED_ALERT;
    
    // Scenario header
    b.drawSubsectionTitle(`${scenario.icon} ESCENARIO: ${scenario.scenarioName}`);
    
    // Actions
    b.drawText('ACCIONES:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
    for (const action of scenario.actions.slice(0, 4)) {
      b.drawBulletPoint(action, { size: 8 });
    }
    b.space(4);
    
    // Results
    b.drawText('RESULTADOS:', { size: 8, font: b.fontBold, color: C.GOLD_DARK });
    b.drawText(`  Exito global: ${scenario.results.successProbabilityOverall}`, { size: 8, color: borderColor, font: b.fontBold });
    b.drawText(`  Oseointegracion: ${scenario.results.healingTime}`, { size: 8, color: C.TEXT });
    b.drawText(`  Complicaciones menores: ${scenario.results.complicationsMinor} | Mayores: ${scenario.results.complicationsMajor}`, { size: 8, color: C.TEXT });
    b.drawText(`  Vida util esperada: ${scenario.results.qualityOfLife.expectedDurability}`, { size: 8, color: C.TEXT });
    b.drawText(`  Costo total: ${scenario.results.totalEstimatedCost.total}`, { size: 9, font: b.fontBold, color: C.GOLD_DARK });
    
    if (scenario.results.totalEstimatedCost.percentageVsOptimal !== '0%') {
      b.drawText(`  (${scenario.results.totalEstimatedCost.percentageVsOptimal} vs Escenario Optimo)`, { size: 7, color: C.RED_ALERT, font: b.fontItalic });
    }
    
    if (scenario.specialWarning) {
      b.space(4);
      b.drawText(`⚠️ ${scenario.specialWarning}`, { size: 8, font: b.fontBold, color: C.RED_ALERT });
    }
    
    b.drawGoldDivider();
  }
  
  // Conclusion
  b.space(6);
  b.drawSectionTitle('Conclusion Comparativa');
  b.drawText('LA ADHERENCIA AL PROTOCOLO ES TAN IMPORTANTE COMO LA CIRUGIA MISMA.', {
    size: 11, font: b.fontBold, color: C.GOLD_DARK,
  });
}

// ----- WHAT-IF SIMULATOR (BASE + PREMIUM) -----
function drawWhatIfSimulatorPage(b: PDFBuilderV3, data: ReportDataV3) {
  // Generate default What-If data from risk factors if not provided
  const whatIfData = data.whatIfData || generateDefaultWhatIfData(data);
  if (!whatIfData || whatIfData.factors.length === 0) return;
  
  b.newPage();
  b.drawHeader('SIMULADOR WHAT-IF');
  
  // Header section
  b.drawSectionTitle('🔮 Simulador What-If');
  b.drawText('Descubre como mejoraria tu resultado optimizando cada factor de riesgo', {
    size: 10, color: C.MED_GRAY, font: b.fontItalic,
  });
  b.space(8);
  
  // Individual factors
  for (const factor of whatIfData.factors.slice(0, 4)) {
    const priorityColor = factor.priority === 'CRITICAL' ? C.RED_ALERT :
                          factor.priority === 'HIGH' ? C.ORANGE_MED :
                          factor.priority === 'MEDIUM' ? C.YELLOW_WARN : C.BLUE_ACCENT;
    
    // Factor box
    const boxH = 70;
    if (b.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      b.newPage();
      b.drawHeader('SIMULADOR WHAT-IF');
    }
    
    // Left border colored by priority
    b.page.drawRectangle({
      x: M_LEFT, y: b.y - boxH, width: 4, height: boxH, color: priorityColor
    });
    b.page.drawRectangle({
      x: M_LEFT + 4, y: b.y - boxH, width: CONTENT_W - 4, height: boxH, 
      color: C.BEIGE_BG, borderColor: C.LIGHT_GRAY, borderWidth: 0.5
    });
    
    const boxTop = b.y;
    
    // Header with icon and name
    b.page.drawText(`${factor.icon} ${factor.name}`, {
      x: M_LEFT + 12, y: boxTop - 14, size: 11, font: b.fontBold, color: C.DARK_BG
    });
    
    // Priority badge
    const badgeW = b.fontBold.widthOfTextAtSize(factor.priority, 7) + 8;
    b.page.drawRectangle({
      x: PAGE_W - M_RIGHT - badgeW - 10, y: boxTop - 18, width: badgeW, height: 14, color: priorityColor
    });
    b.page.drawText(factor.priority, {
      x: PAGE_W - M_RIGHT - badgeW - 6, y: boxTop - 14, size: 7, font: b.fontBold, color: C.WHITE
    });
    
    // Current state
    b.page.drawText(factor.currentState, {
      x: M_LEFT + 12, y: boxTop - 28, size: 8, font: b.fontRegular, color: C.MED_GRAY
    });
    
    // RR comparison
    b.page.drawText(`ACTUAL: ${factor.currentRR}x`, {
      x: M_LEFT + 12, y: boxTop - 44, size: 9, font: b.fontBold, color: C.RED_ALERT
    });
    b.page.drawText('→', {
      x: M_LEFT + 90, y: boxTop - 44, size: 10, font: b.fontBold, color: C.GOLD
    });
    b.page.drawText(`OPTIMIZADO: ${factor.optimizedRR}x`, {
      x: M_LEFT + 105, y: boxTop - 44, size: 9, font: b.fontBold, color: C.GREEN_OK
    });
    
    // Improvement text
    b.page.drawText(`Impacto: ${factor.improvement}`, {
      x: M_LEFT + 220, y: boxTop - 44, size: 8, font: b.fontRegular, color: C.GREEN_OK
    });
    
    // Action required
    b.page.drawText(`✓ ${factor.actionRequired}`, {
      x: M_LEFT + 12, y: boxTop - 60, size: 8, font: b.fontRegular, color: C.BLUE_ACCENT
    });
    
    b.y -= boxH + 8;
  }
  
  // Global simulation result
  b.space(10);
  const resultBoxH = 100;
  if (b.y - resultBoxH < M_BOTTOM + FOOTER_H + 20) {
    b.newPage();
    b.drawHeader('SIMULADOR WHAT-IF');
  }
  
  // Gradient effect simulation with dark background
  b.page.drawRectangle({
    x: M_LEFT, y: b.y - resultBoxH, width: CONTENT_W, height: resultBoxH, 
    color: C.DARK_BG, borderColor: C.GOLD, borderWidth: 2
  });
  
  const resTop = b.y;
  
  b.page.drawText('📊 RESULTADO DE TU SIMULACION', {
    x: M_LEFT + (CONTENT_W - b.fontBold.widthOfTextAtSize('RESULTADO DE TU SIMULACION', 12)) / 2 + 10,
    y: resTop - 18, size: 12, font: b.fontBold, color: C.GOLD
  });
  
  // Current vs Optimized columns
  const colW = (CONTENT_W - 40) / 3;
  
  // Current
  b.page.drawRectangle({
    x: M_LEFT + 15, y: resTop - 85, width: colW, height: 55, color: C.WHITE
  });
  b.page.drawText('ACTUAL', {
    x: M_LEFT + 15 + (colW - b.fontBold.widthOfTextAtSize('ACTUAL', 8)) / 2,
    y: resTop - 40, size: 8, font: b.fontBold, color: C.MED_GRAY
  });
  b.page.drawText(`${whatIfData.currentSuccess}%`, {
    x: M_LEFT + 15 + (colW - b.fontBold.widthOfTextAtSize(`${whatIfData.currentSuccess}%`, 20)) / 2,
    y: resTop - 60, size: 20, font: b.fontBold, color: C.RED_ALERT
  });
  b.page.drawText(`$${(whatIfData.currentCost / 1000000).toFixed(1)}M`, {
    x: M_LEFT + 15 + (colW - b.fontRegular.widthOfTextAtSize(`$${(whatIfData.currentCost / 1000000).toFixed(1)}M`, 9)) / 2,
    y: resTop - 78, size: 9, font: b.fontRegular, color: C.TEXT
  });
  
  // Arrow/Improvement
  const improvement = whatIfData.optimizedSuccess - whatIfData.currentSuccess;
  const costSavings = whatIfData.currentCost - whatIfData.optimizedCost;
  b.page.drawText(`+${improvement}%`, {
    x: M_LEFT + 15 + colW + (colW - b.fontBold.widthOfTextAtSize(`+${improvement}%`, 16)) / 2,
    y: resTop - 55, size: 16, font: b.fontBold, color: C.GOLD
  });
  b.page.drawText(`-$${(costSavings / 1000).toFixed(0)}K`, {
    x: M_LEFT + 15 + colW + (colW - b.fontRegular.widthOfTextAtSize(`-$${(costSavings / 1000).toFixed(0)}K`, 10)) / 2,
    y: resTop - 72, size: 10, font: b.fontRegular, color: C.GREEN_OK
  });
  
  // Optimized
  b.page.drawRectangle({
    x: M_LEFT + 25 + colW * 2, y: resTop - 85, width: colW, height: 55, color: C.WHITE
  });
  b.page.drawText('OPTIMIZADO', {
    x: M_LEFT + 25 + colW * 2 + (colW - b.fontBold.widthOfTextAtSize('OPTIMIZADO', 8)) / 2,
    y: resTop - 40, size: 8, font: b.fontBold, color: C.MED_GRAY
  });
  b.page.drawText(`${whatIfData.optimizedSuccess}%`, {
    x: M_LEFT + 25 + colW * 2 + (colW - b.fontBold.widthOfTextAtSize(`${whatIfData.optimizedSuccess}%`, 20)) / 2,
    y: resTop - 60, size: 20, font: b.fontBold, color: C.GREEN_OK
  });
  b.page.drawText(`$${(whatIfData.optimizedCost / 1000000).toFixed(1)}M`, {
    x: M_LEFT + 25 + colW * 2 + (colW - b.fontRegular.widthOfTextAtSize(`$${(whatIfData.optimizedCost / 1000000).toFixed(1)}M`, 9)) / 2,
    y: resTop - 78, size: 9, font: b.fontRegular, color: C.TEXT
  });
  
  b.y -= resultBoxH + 10;
  
  // Disclaimer
  b.drawText('* Las mejoras mostradas asumen adherencia completa al protocolo de optimizacion.', {
    size: 7, color: C.MED_GRAY, font: b.fontItalic
  });
}

// Helper to generate default What-If data from risk factors
function generateDefaultWhatIfData(data: ReportDataV3): WhatIfData {
  const factors: WhatIfFactor[] = data.riskFactors.slice(0, 4).map((rf, idx) => {
    const priority = rf.relativeRisk > 1.8 ? 'CRITICAL' :
                     rf.relativeRisk > 1.4 ? 'HIGH' :
                     rf.relativeRisk > 1.2 ? 'MEDIUM' : 'LOW';
    const optimizedRR = Math.max(1.0, rf.relativeRisk * 0.5);
    const reductionPct = Math.round((1 - optimizedRR / rf.relativeRisk) * 100);
    
    return {
      id: `factor-${idx}`,
      name: rf.factorName.toUpperCase(),
      icon: idx === 0 ? '🚬' : idx === 1 ? '💉' : idx === 2 ? '🦷' : '⚠️',
      currentState: rf.yourSituation,
      currentRR: rf.relativeRisk,
      optimizedRR: Math.round(optimizedRR * 10) / 10,
      improvement: `RR ${rf.relativeRisk.toFixed(1)}x → ${optimizedRR.toFixed(1)}x (-${reductionPct}% de riesgo)`,
      priority: priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      actionRequired: rf.requiredActions[0] || 'Consultar con especialista'
    };
  });
  
  const currentSuccess = data.successProbability;
  const optimizedSuccess = Math.min(98, currentSuccess + 15);
  
  return {
    factors,
    currentSuccess,
    optimizedSuccess,
    currentCost: 4200000,
    optimizedCost: 3300000
  };
}

// ----- TREATMENT ALTERNATIVES (PREMIUM ONLY) - 2 pages -----
function drawTreatmentAlternativesPages(b: PDFBuilderV3, data: ReportDataV3) {
  // Generate default alternatives if not provided
  const altData = data.treatmentAlternatives || generateDefaultAlternatives();
  if (!altData || altData.options.length === 0) return;
  
  // PAGE 1: Detailed options
  b.newPage();
  b.drawHeader('ALTERNATIVAS DE TRATAMIENTO');
  
  b.drawSectionTitle('🔀 Alternativas de Tratamiento');
  b.drawText(`Compara ${altData.options.length} opciones viables para tu caso. Analiza pros, contras, costos y resultados esperados.`, {
    size: 9, color: C.MED_GRAY, font: b.fontItalic
  });
  b.space(8);
  
  for (const option of altData.options.slice(0, 2)) {
    const isRecommended = option.id === altData.recommendedId;
    const borderColor = isRecommended ? C.GOLD : C.LIGHT_GRAY;
    const boxH = 150;
    
    if (b.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      b.newPage();
      b.drawHeader('ALTERNATIVAS DE TRATAMIENTO');
    }
    
    // Box
    b.page.drawRectangle({
      x: M_LEFT, y: b.y - boxH, width: CONTENT_W, height: boxH,
      color: C.WHITE, borderColor, borderWidth: isRecommended ? 3 : 1
    });
    
    const boxTop = b.y;
    
    // Recommended badge
    if (isRecommended) {
      const badgeText = '🏆 RECOMENDADO';
      const badgeW = b.fontBold.widthOfTextAtSize(badgeText, 9) + 16;
      b.page.drawRectangle({
        x: M_LEFT + (CONTENT_W - badgeW) / 2, y: boxTop + 2, width: badgeW, height: 18, color: C.GOLD
      });
      b.page.drawText(badgeText, {
        x: M_LEFT + (CONTENT_W - b.fontBold.widthOfTextAtSize(badgeText, 9)) / 2,
        y: boxTop + 6, size: 9, font: b.fontBold, color: C.WHITE
      });
    }
    
    // Title
    b.page.drawText(option.name, {
      x: M_LEFT + 12, y: boxTop - 18, size: 14, font: b.fontBold, color: C.DARK_BG
    });
    b.page.drawText(option.description, {
      x: M_LEFT + 12, y: boxTop - 32, size: 8, font: b.fontRegular, color: C.MED_GRAY
    });
    
    // Pros column
    const colW = (CONTENT_W - 30) / 2;
    b.page.drawRectangle({
      x: M_LEFT + 8, y: boxTop - 95, width: colW, height: 55, color: rgb(0.95, 1, 0.95)
    });
    b.page.drawText('✓ PROS', {
      x: M_LEFT + 12, y: boxTop - 48, size: 8, font: b.fontBold, color: C.GREEN_OK
    });
    let proY = boxTop - 60;
    for (const pro of option.pros.slice(0, 3)) {
      const truncPro = pro.length > 40 ? pro.substring(0, 37) + '...' : pro;
      b.page.drawText(`• ${truncPro}`, {
        x: M_LEFT + 12, y: proY, size: 7, font: b.fontRegular, color: C.TEXT
      });
      proY -= 11;
    }
    
    // Cons column
    b.page.drawRectangle({
      x: M_LEFT + 18 + colW, y: boxTop - 95, width: colW, height: 55, color: rgb(1, 0.95, 0.95)
    });
    b.page.drawText('✗ CONTRAS', {
      x: M_LEFT + 22 + colW, y: boxTop - 48, size: 8, font: b.fontBold, color: C.RED_ALERT
    });
    let conY = boxTop - 60;
    for (const con of option.cons.slice(0, 3)) {
      const truncCon = con.length > 40 ? con.substring(0, 37) + '...' : con;
      b.page.drawText(`• ${truncCon}`, {
        x: M_LEFT + 22 + colW, y: conY, size: 7, font: b.fontRegular, color: C.TEXT
      });
      conY -= 11;
    }
    
    // Cost row
    b.page.drawText(`💰 Inicial: $${(option.initialCost / 1000000).toFixed(1)}M`, {
      x: M_LEFT + 12, y: boxTop - 110, size: 9, font: b.fontBold, color: C.BLUE_ACCENT
    });
    b.page.drawText(`Anual: $${(option.maintenanceCost / 1000).toFixed(0)}K`, {
      x: M_LEFT + 130, y: boxTop - 110, size: 8, font: b.fontRegular, color: C.TEXT
    });
    b.page.drawText(`Total 25 años: $${(option.totalCost25Years / 1000000).toFixed(1)}M`, {
      x: M_LEFT + 230, y: boxTop - 110, size: 9, font: b.fontBold, color: C.GOLD
    });
    
    // Stats row
    b.page.drawText(`Éxito: ${option.successRate}`, {
      x: M_LEFT + 12, y: boxTop - 125, size: 8, font: b.fontRegular, color: C.TEXT
    });
    b.page.drawText(`Durabilidad: ${option.lifespan}`, {
      x: M_LEFT + 130, y: boxTop - 125, size: 8, font: b.fontRegular, color: C.TEXT
    });
    b.page.drawText(`Tiempo: ${option.timeline}`, {
      x: M_LEFT + 280, y: boxTop - 125, size: 8, font: b.fontRegular, color: C.TEXT
    });
    
    // Best for
    b.page.drawText(`🎯 Mejor para: ${option.bestFor.substring(0, 60)}${option.bestFor.length > 60 ? '...' : ''}`, {
      x: M_LEFT + 12, y: boxTop - 142, size: 7, font: b.fontItalic, color: C.GOLD_DARK
    });
    
    b.y -= boxH + 12;
  }
  
  // PAGE 2: Comparison table + third option + recommendation
  if (altData.options.length > 2) {
    b.newPage();
    b.drawHeader('ALTERNATIVAS DE TRATAMIENTO');
    
    // Third option (compact)
    const opt3 = altData.options[2];
    if (opt3) {
      b.drawSubsectionTitle(`OPCION C: ${opt3.name}`);
      b.drawText(opt3.description, { size: 8, color: C.MED_GRAY });
      b.space(4);
      b.drawText(`💰 Total 25 años: $${(opt3.totalCost25Years / 1000000).toFixed(1)}M | Éxito: ${opt3.successRate} | Durabilidad: ${opt3.lifespan}`, {
        size: 9, color: C.TEXT
      });
      if (opt3.warnings && opt3.warnings.length > 0) {
        b.space(4);
        b.drawText(`⚠️ ${opt3.warnings[0]}`, { size: 8, color: C.YELLOW_WARN, font: b.fontBold });
      }
      b.drawGoldDivider();
    }
  }
  
  // Comparison table
  b.drawSectionTitle('📊 Tabla Comparativa');
  
  const headers = ['Criterio', ...altData.options.slice(0, 3).map((_, i) => `Opcion ${String.fromCharCode(65 + i)}`)];
  const rows = [
    ['Durabilidad', ...altData.options.slice(0, 3).map(o => o.lifespan)],
    ['Éxito', ...altData.options.slice(0, 3).map(o => o.successRate)],
    ['Satisfaccion', ...altData.options.slice(0, 3).map(o => o.satisfaction)],
    ['Total 25 años', ...altData.options.slice(0, 3).map(o => `$${(o.totalCost25Years / 1000000).toFixed(1)}M`)],
  ];
  
  const numCols = headers.length;
  b.drawTable(headers, rows, {
    colWidths: [120, ...Array(numCols - 1).fill((CONTENT_W - 120) / (numCols - 1))],
    fontSize: 8
  });
  
  // Final recommendation box
  b.space(10);
  const recommended = altData.options.find(o => o.id === altData.recommendedId);
  if (recommended) {
    const recBoxH = 70;
    b.page.drawRectangle({
      x: M_LEFT, y: b.y - recBoxH, width: CONTENT_W, height: recBoxH,
      color: C.DARK_BG, borderColor: C.GOLD, borderWidth: 2
    });
    
    const recTop = b.y;
    b.page.drawText('🏆 RECOMENDACION PARA SU CASO', {
      x: M_LEFT + 15, y: recTop - 20, size: 12, font: b.fontBold, color: C.GOLD
    });
    b.page.drawText(recommended.name, {
      x: M_LEFT + 15, y: recTop - 40, size: 14, font: b.fontBold, color: C.WHITE
    });
    b.page.drawText(recommended.bestFor.substring(0, 80), {
      x: M_LEFT + 15, y: recTop - 55, size: 8, font: b.fontRegular, color: C.GOLD_LIGHT
    });
    b.page.drawText('⚠️ Decision final en consulta con su cirujano', {
      x: M_LEFT + 15, y: recTop - 68, size: 7, font: b.fontItalic, color: C.MED_GRAY
    });
    
    b.y -= recBoxH + 10;
  }
}

// Helper to generate default treatment alternatives
function generateDefaultAlternatives(): TreatmentAlternativesData {
  return {
    options: [
      {
        id: 'implante',
        name: 'IMPLANTE DENTAL',
        description: 'Raiz artificial de titanio con corona de porcelana',
        pros: ['Preserva hueso alveolar', 'No dania dientes adyacentes', 'Sensacion natural al masticar', 'Durabilidad excepcional'],
        cons: ['Mayor inversion inicial', 'Requiere cirugia', 'Tiempo de oseointegracion 3-6 meses'],
        initialCost: 2500000,
        maintenanceCost: 50000,
        lifespan: '25+ años',
        totalCost25Years: 3750000,
        successRate: '95-98%',
        satisfaction: '96%',
        timeline: '4-6 meses',
        bestFor: 'Pacientes que buscan solucion definitiva con minimo impacto en dientes adyacentes'
      },
      {
        id: 'puente',
        name: 'PUENTE FIJO',
        description: 'Protesis fija que usa dientes adyacentes como pilares',
        pros: ['Sin cirugia', 'Resultado inmediato', 'Menor costo inicial'],
        cons: ['Desgasta dientes sanos adyacentes', 'No previene perdida osea', 'Vida util limitada'],
        initialCost: 1200000,
        maintenanceCost: 80000,
        lifespan: '10-15 años',
        totalCost25Years: 4200000,
        successRate: '85-90%',
        satisfaction: '78%',
        timeline: '2-4 semanas',
        bestFor: 'Pacientes que prefieren evitar cirugia o tienen contraindicaciones',
        warnings: ['Requiere desgastar dientes sanos', 'Puede necesitar reemplazo cada 10-15 años']
      },
      {
        id: 'removible',
        name: 'PROTESIS REMOVIBLE',
        description: 'Protesis parcial removible con ganchos metalicos',
        pros: ['Bajo costo', 'No invasivo', 'Facil reparacion'],
        cons: ['Incomodidad al comer', 'Se mueve', 'Acelera perdida osea', 'Requiere ajustes frecuentes'],
        initialCost: 400000,
        maintenanceCost: 120000,
        lifespan: '5-8 años',
        totalCost25Years: 4400000,
        successRate: '70-80%',
        satisfaction: '52%',
        timeline: '1-2 semanas',
        bestFor: 'Solucion temporal o pacientes con limitaciones economicas',
        warnings: ['Menor calidad de vida', 'Acelera reabsorcion osea', 'Puede dañar dientes pilares']
      }
    ],
    recommendedId: 'implante',
    patientProfile: 'Candidato a implante con factores modificables'
  };
}

// ----- PRÓXIMOS PASOS (PREMIUM) -----
function drawNextStepsPage(b: PDFBuilderV3, data: ReportDataV3) {
  b.newPage();
  b.drawHeader('PROXIMOS PASOS');
  
  b.drawSectionTitle('➡️ Proximos Pasos');
  
  // Step 1
  b.drawSubsectionTitle('1️⃣ VIDEOCONFERENCIA CON DR. MONTOYA');
  b.drawText('Revision personalizada de su reporte (INCLUIDA)', { size: 9, color: C.TEXT });
  b.drawText('Duracion: 30-45 minutos', { size: 9, color: C.TEXT });
  b.space(4);
  b.drawText('Agende aqui: clinicamiro.cl/videoconsulta', { size: 9, color: C.BLUE_ACCENT, font: b.fontBold });
  b.drawText('WhatsApp: +56 9 7415 7966', { size: 9, color: C.BLUE_ACCENT });
  b.drawGoldDivider();
  
  // Step 2
  b.drawSubsectionTitle('2️⃣ EXAMENES COMPLEMENTARIOS');
  b.drawBulletPoint('Radiografia panoramica digital', { size: 9 });
  b.drawBulletPoint('CBCT (tomografia 3D) si complejidad anatomica', { size: 9 });
  b.drawBulletPoint('Fotografias clinicas intraorales', { size: 9 });
  b.space(4);
  b.drawText('Puede enviarnos imagenes previas por WhatsApp', { size: 8, color: C.MED_GRAY, font: b.fontItalic });
  b.drawGoldDivider();
  
  // Step 3
  b.drawSubsectionTitle('3️⃣ BENEFICIO ECONOMICO');
  const price = data.plan === 'COMPLETE' ? '$29.990' : '$14.900';
  b.drawText(`El pago de ${price} de este reporte se ABONA`, { size: 10, font: b.fontBold, color: C.GREEN_OK });
  b.drawText('INTEGRAMENTE al tratamiento final.', { size: 10, font: b.fontBold, color: C.GREEN_OK });
  b.space(6);
  if (data.plan === 'COMPLETE') {
    b.drawText('Incluye: 2 noches de estadia en Santiago durante', { size: 9, color: C.TEXT });
    b.drawText('el tratamiento (para pacientes de regiones)', { size: 9, color: C.TEXT });
  }
  b.drawGoldDivider();
  
  // Step 4
  b.drawSubsectionTitle('4️⃣ COORDINACION DE AGENDA');
  b.drawText('Una vez confirmado el plan de tratamiento:', { size: 9, color: C.TEXT });
  b.drawBulletPoint('Programacion quirurgica personalizada', { size: 9 });
  b.drawBulletPoint('Coordinacion con laboratorio', { size: 9 });
  b.drawBulletPoint('Gestion de pagos fraccionados (sin interes)', { size: 9 });
  
  // Disclaimer at bottom
  b.space(20);
  b.drawDisclaimer();
  
  // Clinic info
  b.space(10);
  b.drawText('Dr. Carlos Montoya', { size: 10, font: b.fontBold, color: C.GOLD_DARK });
  b.drawText('Director Clinico | 11,000+ implantes | 27 anos de experiencia', { size: 8, color: C.MED_GRAY });
  b.drawText('Ex-Director Postgrado Implantes, Universidad Mayor (2006-2020)', { size: 8, color: C.MED_GRAY });
  b.space(6);
  b.drawText('Clinica Miro', { size: 9, font: b.fontBold, color: C.TEXT });
  b.drawText('Av. Nueva Providencia 2214 Of. 189, Providencia, Santiago', { size: 8, color: C.MED_GRAY });
  b.drawText('+56 9 7415 7966 | clinicamiro.cl | implantx.cl', { size: 8, color: C.BLUE_ACCENT });
}

// ============================================================
//  REPORT GENERATORS - FULL STRUCTURE
// ============================================================

// FREE: 3 pages
async function generateFreeReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('FREE');
  b.currentSubtitle = 'EVALUACION INICIAL';
  
  // Page 1: Cover
  drawCoverPage(b, data);
  
  // Page 2: Executive Summary (without exact probability)
  drawExecutiveSummaryPage(b, data, false);
  
  // Page 3: Upsell
  b.newPage();
  b.drawHeader('EVALUACION INICIAL');
  
  b.drawSectionTitle('Contenido de Esta Evaluacion');
  b.drawText('✓ Clasificacion de riesgo global', { size: 10, color: C.GREEN_OK });
  b.drawText('✓ Top 3 factores de riesgo identificados', { size: 10, color: C.GREEN_OK });
  b.drawText('✓ Multiplicador de riesgo combinado', { size: 10, color: C.GREEN_OK });
  b.space(10);
  
  b.drawText('✗ Probabilidad de exito exacta', { size: 10, color: C.MED_GRAY });
  b.drawText('✗ Detalle de factores con RR y mecanismos biologicos', { size: 10, color: C.MED_GRAY });
  b.drawText('✗ Timeline de preparacion 4-6 semanas', { size: 10, color: C.MED_GRAY });
  b.drawText('✗ Protocolo post-operatorio completo', { size: 10, color: C.MED_GRAY });
  b.space(15);
  
  b.drawUpsellBox('BASE', '$14.900 CLP');
  b.drawDisclaimer();
  
  b.drawFooterAllPages('EVALUACION INICIAL (GRATIS)');
  return b.save();
}

// BASE: 8 pages (was 7, now includes What-If)
async function generateBaseReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('BASE');
  b.currentSubtitle = 'PLAN DE ACCION';
  
  // Page 1: Cover
  drawCoverPage(b, data);
  
  // Page 2: Executive Summary (with probability)
  drawExecutiveSummaryPage(b, data, true);
  
  // Pages 3-5: Risk Factors (1 full page each, up to 3 factors)
  const topFactors = data.riskFactors.slice(0, 3);
  for (let i = 0; i < topFactors.length; i++) {
    drawRiskFactorPage(b, topFactors[i], i, topFactors.length);
  }
  
  // Page 6: Timeline
  drawTimelinePage(b, data);
  
  // Page 7: Post-Op Protocol
  drawPostOpPage(b, data);
  
  // Page 8: What-If Simulator (NEW)
  drawWhatIfSimulatorPage(b, data);
  b.space(10);
  b.drawUpsellBox('COMPLETE', '$29.990 CLP');
  
  b.drawFooterAllPages('PLAN DE ACCION');
  return b.save();
}

// COMPLETE: 15 pages (was 12, now includes What-If + Treatment Alternatives)
async function generateCompleteReportV3(data: ReportDataV3): Promise<Uint8Array> {
  const b = new PDFBuilderV3();
  await b.init('COMPLETE');
  b.currentSubtitle = 'EVALUACION CLINICA AVANZADA';
  
  // Page 1: Cover
  drawCoverPage(b, data);
  
  // Page 2: Executive Summary
  drawExecutiveSummaryPage(b, data, true);
  
  // Pages 3-5: Risk Factors (1 full page each)
  const topFactors = data.riskFactors.slice(0, 3);
  for (let i = 0; i < topFactors.length; i++) {
    drawRiskFactorPage(b, topFactors[i], i, topFactors.length);
  }
  
  // Page 6: Timeline
  drawTimelinePage(b, data);
  
  // Page 7: Post-Op Protocol
  drawPostOpPage(b, data);
  
  // Page 8: What-If Simulator (NEW - shared with BASE)
  drawWhatIfSimulatorPage(b, data);
  
  // Pages 9-10: Synergies Analysis (PREMIUM EXCLUSIVE)
  drawSynergiesPages(b, data);
  
  // Pages 11-12: Treatment Alternatives (NEW - PREMIUM EXCLUSIVE)
  drawTreatmentAlternativesPages(b, data);
  
  // Page 13: Anatomical Sectors (PREMIUM EXCLUSIVE)
  drawAnatomicalSectorPage(b, data);
  
  // Page 14: Adherence Scenarios (PREMIUM EXCLUSIVE)
  drawAdherenceScenariosPage(b, data);
  
  // Page 15: Next Steps (PREMIUM EXCLUSIVE)
  drawNextStepsPage(b, data);
  
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
    let numPages: number;

    switch (plan) {
      case 'COMPLETE':
        pdfBytes = await generateCompleteReportV3(data);
        numPages = 15; // Updated: was 12, now includes What-If + Alternatives
        break;
      case 'BASE':
        pdfBytes = await generateBaseReportV3(data);
        numPages = 8; // Updated: was 7, now includes What-If
        break;
      default:
        pdfBytes = await generateFreeReportV3(data);
        numPages = 3;
        break;
    }

    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    const planSuffix = plan === 'COMPLETE' ? '_Premium'
      : plan === 'BASE' ? '_PlanAccion'
      : '_Inicial';

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
