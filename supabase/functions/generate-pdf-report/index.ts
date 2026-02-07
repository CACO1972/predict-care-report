import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, grayscale } from "npm:pdf-lib@1.17.1";

// ============================================================
//  CORS
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

const getCorsHeaders = (requestOrigin: string | null) => ({
  "Access-Control-Allow-Origin": getAllowedOrigin(requestOrigin),
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

// ============================================================
//  TYPES
// ============================================================
type PurchaseLevel = 'free' | 'plan-accion' | 'premium';

interface ReportData {
  id: string;
  date: string;
  patientName: string;
  patientAge?: number;
  patientCity?: string;
  patientRegion?: string;
  pronosticoLabel?: string;
  pronosticoMessage?: string;
  pronosticoLevel?: number; // 1-5
  successProbability?: number;
  successRange: string;
  factors?: Array<{ name: string; value: string; impact: number; rr?: number; action?: string }>;
  recommendations?: Array<{ text: string; evidence: string; priority?: string }>;
  synergies?: Array<{ text: string; multiplier?: number; implication?: string }>;
  purchaseLevel?: PurchaseLevel;
  irpResult?: { score: number; level: string; factors?: any[] };
  missingTeeth?: string[];
  nTeeth?: number;
  treatmentZones?: Array<{
    zone: string;
    implants: number;
    complexity: string;
    notes: string;
  }>;
}

// ============================================================
//  COLORS (Brand: HUMANA.AI / ImplantX)
// ============================================================
const C = {
  DARK_BG:     rgb(10/255, 10/255, 10/255),       // #0A0A0A
  DARK_HEADER: rgb(15/255, 15/255, 15/255),        // #0F0F0F
  GOLD:        rgb(201/255, 168/255, 108/255),      // #C9A86C
  GOLD_LIGHT:  rgb(232/255, 213/255, 168/255),      // #E8D5A8
  GOLD_DARK:   rgb(139/255, 115/255, 64/255),       // #8B7340
  WHITE:       rgb(1, 1, 1),
  LIGHT_GRAY:  rgb(0.95, 0.95, 0.95),
  MED_GRAY:    rgb(0.6, 0.6, 0.6),
  DARK_GRAY:   rgb(0.3, 0.3, 0.3),
  TEXT:         rgb(0.2, 0.2, 0.2),
  BEIGE_BG:    rgb(248/255, 246/255, 240/255),      // #F8F6F0
  CREAM_BG:    rgb(251/255, 248/255, 240/255),      // #FBF8F0
  GREEN_OK:    rgb(46/255, 125/255, 50/255),        // #2E7D32
  YELLOW_WARN: rgb(245/255, 127/255, 23/255),       // #F57F17
  RED_ALERT:   rgb(198/255, 40/255, 40/255),        // #C62828
  ORANGE_MED:  rgb(230/255, 81/255, 0/255),         // #E65100
  BLUE_ACCENT: rgb(30/255, 58/255, 95/255),         // #1E3A5F
  BLUE_LIGHT:  rgb(245/255, 248/255, 252/255),      // #F5F8FC
  PINK_LIGHT:  rgb(255/255, 245/255, 245/255),      // #FFF5F5
};

// ============================================================
//  LAYOUT CONSTANTS
// ============================================================
const PAGE_W = 595.28; // A4
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
class PDFBuilder {
  doc!: PDFDocument;
  page!: PDFPage;
  fontRegular!: PDFFont;
  fontBold!: PDFFont;
  fontItalic!: PDFFont;
  y: number = 0;
  pageNum: number = 0;
  tier: PurchaseLevel = 'free';
  totalPages: number = 1;

  async init(tier: PurchaseLevel) {
    this.doc = await PDFDocument.create();
    this.fontRegular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.fontItalic = await this.doc.embedFont(StandardFonts.HelveticaOblique);
    this.tier = tier;
    this.newPage();
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.pageNum++;
    this.y = PAGE_H - M_TOP;
    // White background
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C.WHITE });
  }

  // ---- HEADER (dark bar) ----
  drawHeader(subtitle: string) {
    const p = this.page;
    // Dark header bar
    p.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: C.DARK_BG });

    // "IMPLANTX" logo text
    p.drawText("IMPLANTX", {
      x: M_LEFT,
      y: PAGE_H - HEADER_H + 18,
      size: 18,
      font: this.fontBold,
      color: C.GOLD,
    });

    // Subtitle right-aligned
    const subW = this.fontRegular.widthOfTextAtSize(subtitle, 8);
    p.drawText(subtitle, {
      x: PAGE_W - M_RIGHT - subW,
      y: PAGE_H - HEADER_H + 22,
      size: 8,
      font: this.fontRegular,
      color: C.GOLD_LIGHT,
    });

    // "by Clinica Miro" under logo
    p.drawText("by Clinica Miro", {
      x: M_LEFT,
      y: PAGE_H - HEADER_H + 7,
      size: 7,
      font: this.fontItalic,
      color: C.MED_GRAY,
    });

    this.y = PAGE_H - HEADER_H - 20;
  }

  // ---- FOOTER ----
  drawFooter(tierLabel: string, currentPage: number, totalPages: number) {
    const p = this.page;
    const footY = FOOTER_H;

    // Gold line
    p.drawRectangle({ x: M_LEFT, y: footY + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });

    // Left: clinic info
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT,
      y: footY,
      size: 6.5,
      font: this.fontRegular,
      color: C.MED_GRAY,
    });

    // Center: tier label
    const tierW = this.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, {
      x: (PAGE_W - tierW) / 2,
      y: footY,
      size: 6.5,
      font: this.fontBold,
      color: C.GOLD,
    });

    // Right: page number
    const pageText = `${currentPage} / ${totalPages}`;
    const pageW = this.fontRegular.widthOfTextAtSize(pageText, 6.5);
    p.drawText(pageText, {
      x: PAGE_W - M_RIGHT - pageW,
      y: footY,
      size: 6.5,
      font: this.fontRegular,
      color: C.MED_GRAY,
    });
  }

  // ---- TEXT HELPERS ----
  drawText(text: string, opts: {
    x?: number; size?: number; font?: PDFFont; color?: any;
    maxWidth?: number; lineHeight?: number; align?: 'left' | 'center' | 'right';
  } = {}) {
    const {
      x = M_LEFT, size = 10, font = this.fontRegular,
      color = C.TEXT, maxWidth = CONTENT_W, lineHeight = size * 1.4,
      align = 'left'
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

      let drawX = x;
      if (align === 'center') {
        const lw = font.widthOfTextAtSize(l, size);
        drawX = x + (maxWidth - lw) / 2;
      } else if (align === 'right') {
        const lw = font.widthOfTextAtSize(l, size);
        drawX = x + maxWidth - lw;
      }

      this.page.drawText(l, { x: drawX, y: this.y, size, font, color });
      this.y -= lineHeight;
    }
  }

  currentSubtitle = '';

  // ---- SECTION TITLE ----
  drawSectionTitle(text: string) {
    this.y -= 8;

    if (this.y < M_BOTTOM + FOOTER_H + 40) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    // Gold left accent bar
    this.page.drawRectangle({
      x: M_LEFT, y: this.y - 2, width: 3, height: 14, color: C.GOLD
    });

    this.page.drawText(text.toUpperCase(), {
      x: M_LEFT + 10,
      y: this.y,
      size: 11,
      font: this.fontBold,
      color: C.DARK_BG,
    });

    this.y -= 20;
  }

  // ---- GOLD DIVIDER ----
  drawGoldDivider() {
    this.y -= 4;
    this.page.drawRectangle({
      x: M_LEFT, y: this.y, width: CONTENT_W, height: 0.5, color: C.GOLD
    });
    this.y -= 10;
  }

  // ---- SPACER ----
  space(h: number) {
    this.y -= h;
    if (this.y < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
  }

  // ---- TABLE ----
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

    // Check if we need a new page
    const totalH = headerH + rows.length * rowH;
    if (this.y - totalH < M_BOTTOM + FOOTER_H + 20) {
      // If table is too tall, we'll draw what fits and continue on next page
      // For simplicity, just ensure header fits
      if (this.y < M_BOTTOM + FOOTER_H + 60) {
        this.newPage();
        this.drawHeader(this.currentSubtitle);
      }
    }

    // Header row
    let xPos = M_LEFT;
    this.page.drawRectangle({
      x: M_LEFT, y: this.y - headerH + 6, width: CONTENT_W, height: headerH, color: headerBg
    });

    for (let i = 0; i < headers.length; i++) {
      const truncated = this.truncateText(headers[i], colWidths[i] - 6, fontSize, this.fontBold);
      this.page.drawText(truncated, {
        x: xPos + 4,
        y: this.y - 8,
        size: fontSize,
        font: this.fontBold,
        color: headerColor,
      });
      xPos += colWidths[i];
    }
    this.y -= headerH;

    // Data rows
    for (let r = 0; r < rows.length; r++) {
      if (this.y < M_BOTTOM + FOOTER_H + 20) {
        this.newPage();
        this.drawHeader(this.currentSubtitle);
      }

      // Alternating row bg
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
          x: xPos + 4,
          y: this.y - 8,
          size: fontSize,
          font: this.fontRegular,
          color: C.TEXT,
        });
        xPos += (colWidths[i] || 80);
      }
      this.y -= rowH;
    }

    // Bottom border
    this.page.drawRectangle({
      x: M_LEFT, y: this.y + 6, width: CONTENT_W, height: 0.5, color: C.MED_GRAY
    });
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

  // ---- COLORED BOX ----
  drawBox(opts: {
    x?: number; width?: number; height: number;
    bgColor: any; borderColor?: any; borderWidth?: number;
    radius?: number;
  }) {
    const {
      x = M_LEFT, width = CONTENT_W, height,
      bgColor, borderColor, borderWidth = 0, radius = 0
    } = opts;

    // Simple rectangle (pdf-lib doesn't support rounded corners natively)
    this.page.drawRectangle({
      x, y: this.y - height, width, height,
      color: bgColor,
      borderColor: borderColor || bgColor,
      borderWidth,
    });
  }

  // ---- RESULT BOX (probability display) ----
  drawResultBox(data: ReportData, showProbability: boolean) {
    const boxH = showProbability ? 85 : 75;

    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    // Background
    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1 });

    const boxTop = this.y;

    // "Resultado de la Evaluacion"
    this.page.drawText("RESULTADO DE LA EVALUACION", {
      x: M_LEFT + 10, y: boxTop - 16, size: 8,
      font: this.fontBold, color: C.GOLD_DARK,
    });

    if (showProbability && data.successProbability) {
      // Big probability number
      const probText = `${data.successProbability}%`;
      const probW = this.fontBold.widthOfTextAtSize(probText, 42);
      this.page.drawText(probText, {
        x: M_LEFT + 10, y: boxTop - 58, size: 42,
        font: this.fontBold, color: C.GOLD,
      });

      // "probabilidad de exito"
      this.page.drawText("probabilidad de exito", {
        x: M_LEFT + probW + 16, y: boxTop - 42, size: 9,
        font: this.fontItalic, color: C.MED_GRAY,
      });
    } else {
      // Hidden probability for free tier
      this.page.drawText("- - %", {
        x: M_LEFT + 10, y: boxTop - 52, size: 36,
        font: this.fontBold, color: C.LIGHT_GRAY,
      });
      this.page.drawText("Disponible en informe Base", {
        x: M_LEFT + 110, y: boxTop - 40, size: 8,
        font: this.fontItalic, color: C.MED_GRAY,
      });
    }

    // Prognosis level (right side)
    const progLabel = data.pronosticoLabel || 'Favorable';
    const progLevel = data.pronosticoLevel || 3;
    const levelText = `Nivel ${progLevel}/5`;
    const levelTextW = this.fontBold.widthOfTextAtSize(levelText, 10);

    this.page.drawText(levelText, {
      x: PAGE_W - M_RIGHT - levelTextW - 10, y: boxTop - 30, size: 10,
      font: this.fontBold, color: this.getPronosticoColor(progLevel),
    });

    const progLabelW = this.fontRegular.widthOfTextAtSize(progLabel, 8);
    this.page.drawText(progLabel, {
      x: PAGE_W - M_RIGHT - progLabelW - 10, y: boxTop - 44, size: 8,
      font: this.fontRegular, color: this.getPronosticoColor(progLevel),
    });

    // Verdict badge
    const verdict = this.getVerdict(progLevel);
    const verdictColor = this.getPronosticoColor(progLevel);
    const verdictBg = progLevel <= 2 ? rgb(0.9, 1, 0.9) : progLevel <= 3 ? rgb(1, 0.97, 0.88) : rgb(1, 0.92, 0.92);

    this.page.drawRectangle({
      x: PAGE_W - M_RIGHT - 170, y: boxTop - 68,
      width: 160, height: 18,
      color: verdictBg, borderColor: verdictColor, borderWidth: 0.5,
    });
    const verdictW = this.fontBold.widthOfTextAtSize(verdict, 8);
    this.page.drawText(verdict, {
      x: PAGE_W - M_RIGHT - 170 + (160 - verdictW) / 2, y: boxTop - 63,
      size: 8, font: this.fontBold, color: verdictColor,
    });

    this.y -= boxH + 8;
  }

  getPronosticoColor(level: number) {
    if (level <= 1) return C.GREEN_OK;
    if (level <= 2) return rgb(0.1, 0.6, 0.1);
    if (level <= 3) return C.YELLOW_WARN;
    if (level <= 4) return C.ORANGE_MED;
    return C.RED_ALERT;
  }

  getVerdict(level: number): string {
    if (level <= 1) return 'CANDIDATO EXCELENTE';
    if (level <= 2) return 'CANDIDATO FAVORABLE';
    if (level <= 3) return 'CANDIDATO CON CONDICIONES';
    if (level <= 4) return 'REQUIERE PREPARACION';
    return 'REQUIERE ATENCION ESPECIAL';
  }

  // ---- RISK GAUGE ----
  drawRiskGauge(probability: number) {
    if (this.y < M_BOTTOM + FOOTER_H + 50) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    const gaugeY = this.y - 10;
    const gaugeW = CONTENT_W;
    const gaugeH = 14;
    const segmentW = gaugeW / 5;

    // 5 color segments
    const colors = [C.RED_ALERT, C.ORANGE_MED, C.YELLOW_WARN, rgb(0.5, 0.75, 0.2), C.GREEN_OK];
    const labels = ['<60%', '60-69%', '70-79%', '80-89%', '90%+'];

    for (let i = 0; i < 5; i++) {
      this.page.drawRectangle({
        x: M_LEFT + i * segmentW, y: gaugeY - gaugeH,
        width: segmentW - 1, height: gaugeH,
        color: colors[i],
      });

      // Label below
      const lw = this.fontRegular.widthOfTextAtSize(labels[i], 6);
      this.page.drawText(labels[i], {
        x: M_LEFT + i * segmentW + (segmentW - lw) / 2,
        y: gaugeY - gaugeH - 10,
        size: 6, font: this.fontRegular, color: C.MED_GRAY,
      });
    }

    // Pointer triangle
    const pct = Math.max(0, Math.min(100, probability));
    const pointerX = M_LEFT + (pct / 100) * gaugeW;

    // Draw small triangle above gauge
    this.page.drawText("v", {
      x: pointerX - 3, y: gaugeY + 4, size: 10, font: this.fontBold, color: C.DARK_BG,
    });

    this.y -= 45;
  }

  // ---- DISCLAIMER ----
  drawDisclaimer() {
    this.space(10);
    this.drawGoldDivider();

    const disclaimerText = "AVISO LEGAL: Este informe es una herramienta de orientacion basada en inteligencia artificial y no reemplaza la evaluacion clinica presencial. Los resultados son estimaciones basadas en la informacion proporcionada y literatura cientifica disponible (meta-analisis con n>50,000 pacientes). Consulte siempre con su implantologo antes de tomar decisiones de tratamiento.";

    this.drawText(disclaimerText, {
      size: 6.5, color: C.MED_GRAY, font: this.fontItalic, lineHeight: 9,
    });

    this.space(6);

    this.drawText("Dr. Carlos Montoya | Director Clinico | 11,000+ implantes | 27 anos de experiencia", {
      size: 7, color: C.GOLD_DARK, font: this.fontBold,
    });

    this.drawText("Ex-Director Postgrado Implantes, Universidad Mayor (2006-2020)", {
      size: 6.5, color: C.MED_GRAY, font: this.fontItalic,
    });
  }

  // ---- UPSELL BOX ----
  drawUpsellBox(targetTier: 'base' | 'completo', price: string) {
    const boxH = 90;

    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    this.drawBox({ height: boxH, bgColor: C.CREAM_BG, borderColor: C.GOLD, borderWidth: 1.5 });

    const bTop = this.y + boxH;

    const title = targetTier === 'base'
      ? 'DESBLOQUEA TU INFORME BASE'
      : 'ACCEDE AL INFORME COMPLETO';

    this.page.drawText(title, {
      x: M_LEFT + 10, y: bTop - 18, size: 11,
      font: this.fontBold, color: C.GOLD_DARK,
    });

    const features = targetTier === 'base'
      ? [
          '- Probabilidad de exito exacta con gauge visual',
          '- Factores de riesgo detallados con RR',
          '- 6 recomendaciones personalizadas',
          '- Videoconferencia con especialista incluida',
        ]
      : [
          '- Todo lo del informe Base PLUS:',
          '- Sinergias de riesgo con multiplicadores',
          '- Plan quirurgico por zona anatomica',
          '- Protocolo de preparacion priorizado',
        ];

    let fY = bTop - 34;
    for (const f of features) {
      this.page.drawText(f, {
        x: M_LEFT + 14, y: fY, size: 7.5,
        font: this.fontRegular, color: C.TEXT,
      });
      fY -= 12;
    }

    // Price badge
    const priceW = this.fontBold.widthOfTextAtSize(price, 14);
    this.page.drawText(price, {
      x: PAGE_W - M_RIGHT - priceW - 15, y: bTop - 55, size: 14,
      font: this.fontBold, color: C.GOLD,
    });

    this.y -= boxH + 8;
  }

  // ---- PRIORITY BADGE ----
  drawPriorityBadge(priority: string, x: number, y: number) {
    const bgColor = priority === 'CRITICO' ? C.RED_ALERT
      : priority === 'IMPORTANTE' ? C.ORANGE_MED
      : C.GREEN_OK;

    const badgeW = this.fontBold.widthOfTextAtSize(priority, 6) + 8;
    this.page.drawRectangle({
      x, y: y - 3, width: badgeW, height: 12,
      color: bgColor,
    });
    this.page.drawText(priority, {
      x: x + 4, y: y, size: 6, font: this.fontBold, color: C.WHITE,
    });
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}

// ============================================================
//  REPORT GENERATORS
// ============================================================

// ─────────────── GRATIS (1 page) ───────────────
async function generateFreeReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('free');
  b.currentSubtitle = 'PRE-INFORME ORIENTATIVO';
  b.totalPages = 1;

  // Header
  b.drawHeader('PRE-INFORME ORIENTATIVO');

  // Patient info table
  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.patientAge || '-'} anos`],
      ['Ciudad', data.patientCity || '-', 'Fecha', data.date || '-'],
      ['Codigo', data.id || '-', 'Piezas ausentes', (data.missingTeeth || []).join(', ') || '-'],
    ],
    { colWidths: [80, 145, 80, CONTENT_W - 305], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);

  // Result box (probability HIDDEN)
  b.drawResultBox(data, false);

  // Summary
  b.drawSectionTitle('Resumen Orientativo');
  const numFactors = (data.factors || []).filter(f => f.impact < -2 || (f.rr && f.rr > 1.0)).length;
  const summaryText = `Se han identificado ${numFactors} factores clinicos relevantes en su evaluacion. Su perfil sugiere que ${data.pronosticoLevel && data.pronosticoLevel <= 2 ? 'usted es un buen candidato para implantes dentales' : 'es necesario un trabajo preparatorio antes de proceder con la colocacion de implantes'}. Para obtener su probabilidad exacta de exito y recomendaciones personalizadas, consulte el Informe Base.`;

  b.drawText(summaryText, { size: 9, lineHeight: 13, color: C.DARK_GRAY });

  b.space(6);

  // What includes / What doesn't
  b.drawSectionTitle('Que Incluye Este Pre-Informe');
  const includes = [
    'Nivel de pronostico general (1-5)',
    'Veredicto de candidatura (orientativo)',
    'Cantidad de factores de riesgo identificados',
  ];
  for (const item of includes) {
    b.drawText(`  + ${item}`, { size: 8, color: C.GREEN_OK, font: b.fontRegular });
  }

  b.space(4);
  b.drawText('No incluye:', { size: 8, color: C.RED_ALERT, font: b.fontBold });
  const notIncludes = [
    'Probabilidad de exito exacta',
    'Detalle de factores de riesgo con RR',
    'Recomendaciones personalizadas',
    'Sinergias de riesgo',
    'Plan de tratamiento por zona',
  ];
  for (const item of notIncludes) {
    b.drawText(`  x ${item}`, { size: 8, color: C.MED_GRAY, font: b.fontRegular });
  }

  b.space(8);

  // Upsell to Base
  b.drawUpsellBox('base', '$14.000 CLP');

  // Disclaimer
  b.drawDisclaimer();

  // Footer
  b.drawFooter('PRE-INFORME GRATIS', 1, 1);

  return b.save();
}

// ─────────────── BASE - $14.000 (2 pages) ───────────────
async function generateBaseReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('plan-accion');
  b.currentSubtitle = 'INFORME BASE';
  b.totalPages = 2;

  // ═══════ PAGE 1 ═══════
  b.drawHeader('INFORME DE EVALUACION - IMPLANTX BASE');

  // Patient info
  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.patientAge || '-'} anos`],
      ['Ciudad', data.patientCity || '-', 'Fecha', data.date || '-'],
      ['Codigo', data.id || '-', 'Piezas', (data.missingTeeth || []).join(', ') || '-'],
    ],
    { colWidths: [80, 145, 80, CONTENT_W - 305], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);

  // Result box (probability VISIBLE)
  b.drawResultBox(data, true);

  // Risk gauge
  if (data.successProbability) {
    b.drawText('Escala visual de riesgo:', { size: 8, color: C.MED_GRAY, font: b.fontItalic });
    b.drawRiskGauge(data.successProbability);
  }

  // Risk factors table
  if (data.factors && data.factors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo Identificados');
    const factorRows = data.factors.map(f => [
      f.name,
      f.value,
      f.rr ? `${f.rr.toFixed(1)}x` : `${Math.abs(f.impact)}%`,
      f.rr && f.rr > 1.5 ? 'ALTO' : f.rr && f.rr > 1.2 ? 'MODERADO' : 'BAJO',
    ]);

    b.drawTable(
      ['Factor Clinico', 'Condicion', 'RR / Impacto', 'Nivel'],
      factorRows,
      { colWidths: [170, 140, 80, CONTENT_W - 390] }
    );

    b.space(2);
    b.drawText('RR = Riesgo Relativo. Un RR de 2.0x indica el doble de riesgo respecto a la poblacion base.', {
      size: 6.5, color: C.MED_GRAY, font: b.fontItalic,
    });
  }

  // ═══════ PAGE 2 ═══════
  b.newPage();
  b.drawHeader('INFORME DE EVALUACION - IMPLANTX BASE');

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    b.drawSectionTitle('Recomendaciones Personalizadas');

    for (let i = 0; i < data.recommendations.length; i++) {
      const rec = data.recommendations[i];
      b.drawText(`${i + 1}. ${rec.text}`, { size: 9, font: b.fontBold, color: C.DARK_GRAY });
      if (rec.evidence) {
        b.drawText(`   Evidencia: ${rec.evidence}`, { size: 7.5, color: C.MED_GRAY, font: b.fontItalic });
      }
      b.space(4);
    }
  }

  b.space(6);

  // What's available in Completo
  b.drawSectionTitle('Disponible en Informe Completo');
  const completoFeatures = [
    'Sinergias de riesgo con multiplicadores de interaccion',
    'Plan de tratamiento detallado por zona anatomica',
    'Protocolo de preparacion priorizado (Critico / Importante / Recomendado)',
    'Resumen clinico narrativo integrador',
  ];
  for (const f of completoFeatures) {
    b.drawText(`  >> ${f}`, { size: 8, color: C.BLUE_ACCENT, font: b.fontRegular });
  }

  b.space(8);

  // Upsell to Completo
  b.drawUpsellBox('completo', '$29.900 CLP');

  b.space(8);

  // Next steps
  b.drawSectionTitle('Proximos Pasos');
  const steps = [
    '1. Videoconferencia con especialista (incluida en todos los planes)',
    '2. El pago de su informe se abona integramente al tratamiento si decide operar',
    '3. Incluye 2 noches de estadia en Santiago durante su tratamiento',
  ];
  for (const s of steps) {
    b.drawText(s, { size: 8.5, color: C.TEXT });
    b.space(2);
  }

  // Disclaimer
  b.drawDisclaimer();

  // Footers for both pages
  const pages = b.doc.getPages();

  // Draw footers manually on each page
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    // Gold line
    p.drawRectangle({ x: M_LEFT, y: FOOTER_H + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
    // Info
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
    const tierLabel = "INFORME BASE";
    const tw = b.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, {
      x: (PAGE_W - tw) / 2, y: FOOTER_H, size: 6.5, font: b.fontBold, color: C.GOLD,
    });
    const pgText = `${i + 1} / ${pages.length}`;
    const pgW = b.fontRegular.widthOfTextAtSize(pgText, 6.5);
    p.drawText(pgText, {
      x: PAGE_W - M_RIGHT - pgW, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
  }

  return b.save();
}

// ─────────────── COMPLETO - $29.900 (3 pages) ───────────────
async function generateCompletoReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('premium');
  b.currentSubtitle = 'INFORME CLINICO COMPLETO';
  b.totalPages = 3;

  // ═══════ PAGE 1 ═══════
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // Patient info
  b.drawSectionTitle('Datos del Paciente');
  b.drawTable(
    ['Campo', 'Informacion', 'Campo', 'Informacion'],
    [
      ['Paciente', data.patientName || '-', 'Edad', `${data.patientAge || '-'} anos`],
      ['Ciudad', data.patientCity || '-', 'Region', data.patientRegion || '-'],
      ['Fecha', data.date || '-', 'Codigo', data.id || '-'],
      ['Piezas ausentes', (data.missingTeeth || []).join(', ') || '-', 'Cantidad', `${data.nTeeth || '-'} piezas`],
    ],
    { colWidths: [90, 140, 80, CONTENT_W - 310], headerBg: C.GOLD_DARK, headerColor: C.WHITE }
  );

  b.space(8);

  // Result box (probability VISIBLE)
  b.drawResultBox(data, true);

  // Risk gauge
  if (data.successProbability) {
    b.drawRiskGauge(data.successProbability);
  }

  // Clinical narrative
  b.drawSectionTitle('Resumen Clinico');
  const narrative = data.pronosticoMessage || `El paciente presenta un perfil de riesgo ${data.pronosticoLabel?.toLowerCase() || 'moderado'} para rehabilitacion con implantes dentales. Se identificaron ${(data.factors || []).length} factores clinicos relevantes y ${(data.synergies || []).length} sinergias de riesgo que interactuan entre si. La probabilidad de exito estimada es de ${data.successProbability || '--'}%, lo que corresponde a un pronostico de nivel ${data.pronosticoLevel || '--'}/5. Se recomienda seguir el protocolo de preparacion priorizado antes de proceder con la cirugia.`;

  b.drawText(narrative, { size: 9, lineHeight: 13, color: C.DARK_GRAY });

  b.space(6);

  // Risk factors with ACTION column
  if (data.factors && data.factors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo Detallados');

    const factorRows = data.factors.map(f => [
      f.name,
      f.value,
      f.rr ? `${f.rr.toFixed(1)}x` : `${Math.abs(f.impact)}%`,
      f.action || 'Monitorizar',
    ]);

    b.drawTable(
      ['Factor', 'Condicion', 'RR', 'Accion Requerida'],
      factorRows,
      { colWidths: [130, 115, 55, CONTENT_W - 300] }
    );
  }

  // ═══════ PAGE 2 ═══════
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // SYNERGIES (exclusive to Completo)
  if (data.synergies && data.synergies.length > 0) {
    b.drawSectionTitle('Sinergias de Riesgo (Exclusivo)');

    b.drawText('Las sinergias representan interacciones entre factores que multiplican el riesgo mas alla de su efecto individual.', {
      size: 8, color: C.MED_GRAY, font: b.fontItalic,
    });
    b.space(4);

    const synergyRows = data.synergies.map(s => [
      s.text,
      s.multiplier ? `${s.multiplier.toFixed(1)}x` : '-',
      s.implication || 'Requiere atencion especial',
    ]);

    b.drawTable(
      ['Combinacion de Factores', 'Multiplicador', 'Implicancia Clinica'],
      synergyRows,
      {
        colWidths: [200, 80, CONTENT_W - 280],
        headerBg: C.RED_ALERT,
        headerColor: C.WHITE,
        altRowBg: C.PINK_LIGHT,
      }
    );
  }

  b.space(8);

  // TREATMENT PLAN BY ZONE (exclusive to Completo)
  if (data.treatmentZones && data.treatmentZones.length > 0) {
    b.drawSectionTitle('Plan de Tratamiento por Zona Anatomica (Exclusivo)');

    const zoneRows = data.treatmentZones.map(z => [
      z.zone,
      `${z.implants}`,
      z.complexity,
      z.notes,
    ]);

    // Add total row
    const totalImplants = data.treatmentZones.reduce((sum, z) => sum + z.implants, 0);
    zoneRows.push(['TOTAL', `${totalImplants}`, '-', 'Implantes planificados']);

    b.drawTable(
      ['Zona Anatomica', 'Implantes', 'Complejidad', 'Notas Clinicas'],
      zoneRows,
      {
        colWidths: [150, 65, 85, CONTENT_W - 300],
        headerBg: C.BLUE_ACCENT,
        headerColor: C.WHITE,
        altRowBg: C.BLUE_LIGHT,
      }
    );
  } else {
    // Generate default zones from missing teeth
    b.drawSectionTitle('Plan de Tratamiento por Zona Anatomica (Exclusivo)');
    b.drawText('Las zonas de tratamiento se determinaran durante la videoconferencia con el especialista, utilizando la informacion radiografica complementaria.', {
      size: 8.5, color: C.DARK_GRAY,
    });
  }

  // ═══════ PAGE 3 ═══════
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // PRIORITIZED PREPARATION PROTOCOL
  if (data.recommendations && data.recommendations.length > 0) {
    b.drawSectionTitle('Protocolo de Preparacion Priorizado');

    for (let i = 0; i < data.recommendations.length; i++) {
      const rec = data.recommendations[i];
      const priority = rec.priority || (i < 2 ? 'CRITICO' : i < 4 ? 'IMPORTANTE' : 'RECOMENDADO');

      if (b.y < M_BOTTOM + FOOTER_H + 40) {
        b.newPage();
        b.drawHeader(b.currentSubtitle);
      }

      // Priority badge
      b.drawPriorityBadge(priority, M_LEFT, b.y);

      // Recommendation text next to badge
      const badgeW = b.fontBold.widthOfTextAtSize(priority, 6) + 14;
      b.drawText(`${i + 1}. ${rec.text}`, {
        x: M_LEFT + badgeW,
        size: 9,
        font: b.fontBold,
        color: C.DARK_GRAY,
        maxWidth: CONTENT_W - badgeW,
      });

      if (rec.evidence) {
        b.drawText(`Evidencia: ${rec.evidence}`, {
          x: M_LEFT + badgeW,
          size: 7,
          color: C.MED_GRAY,
          font: b.fontItalic,
          maxWidth: CONTENT_W - badgeW,
        });
      }
      b.space(6);
    }
  }

  b.space(8);

  // NEXT STEPS (expanded)
  b.drawSectionTitle('Proximos Pasos');
  const stepsText = [
    '1. Videoconferencia con el Dr. Montoya para revision del informe (incluida)',
    '2. Envio de imagenes radiograficas complementarias (panoramica o CBCT)',
    '3. El pago de $29.900 se abona integramente al tratamiento final',
    '4. Incluye 2 noches de estadia en Santiago durante el tratamiento',
    '5. Coordinacion de agenda quirurgica segun protocolo personalizado',
  ];

  for (const s of stepsText) {
    b.drawText(s, { size: 8.5, color: C.TEXT });
    b.space(3);
  }

  b.space(6);

  // CTA Box
  const ctaH = 55;
  if (b.y - ctaH > M_BOTTOM + FOOTER_H + 20) {
    b.drawBox({ height: ctaH, bgColor: C.GOLD_DARK, borderColor: C.GOLD, borderWidth: 1 });
    const ctaTop = b.y + ctaH;

    b.page.drawText('AGENDE SU VIDEOCONFERENCIA', {
      x: M_LEFT + 15, y: ctaTop - 20, size: 13,
      font: b.fontBold, color: C.WHITE,
    });
    b.page.drawText('Contacto directo: +56 9 7415 7966 | WhatsApp', {
      x: M_LEFT + 15, y: ctaTop - 36, size: 9,
      font: b.fontRegular, color: C.GOLD_LIGHT,
    });
    b.page.drawText('clinicamiro.cl | implantx.cl', {
      x: M_LEFT + 15, y: ctaTop - 48, size: 8,
      font: b.fontItalic, color: C.GOLD_LIGHT,
    });

    b.y -= ctaH + 8;
  }

  // Disclaimer
  b.drawDisclaimer();

  // Draw footers on ALL pages
  const pages = b.doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawRectangle({ x: M_LEFT, y: FOOTER_H + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
    const tierLabel = "INFORME COMPLETO";
    const tw = b.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, {
      x: (PAGE_W - tw) / 2, y: FOOTER_H, size: 6.5, font: b.fontBold, color: C.GOLD,
    });
    const pgText = `${i + 1} / ${pages.length}`;
    const pgW = b.fontRegular.widthOfTextAtSize(pgText, 6.5);
    p.drawText(pgText, {
      x: PAGE_W - M_RIGHT - pgW, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
  }

  return b.save();
}

// ============================================================
//  HANDLER
// ============================================================
const handler = async (req: Request): Promise<Response> => {
  console.log("generate-pdf-report function invoked");
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reportData: ReportData = await req.json();
    const purchaseLevel = reportData.purchaseLevel || 'free';
    console.log('Generating PDF report:', reportData.id, 'Level:', purchaseLevel);

    let pdfBytes: Uint8Array;

    switch (purchaseLevel) {
      case 'premium':
        pdfBytes = await generateCompletoReport(reportData);
        break;
      case 'plan-accion':
        pdfBytes = await generateBaseReport(reportData);
        break;
      default:
        pdfBytes = await generateFreeReport(reportData);
        break;
    }

    // Convert to base64 for JSON response
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    const levelSuffix = purchaseLevel === 'premium' ? '_Completo'
      : purchaseLevel === 'plan-accion' ? '_Base'
      : '_Gratis';

    return new Response(
      JSON.stringify({
        success: true,
        pdf: base64Pdf,
        downloadName: `ImplantX_Informe${levelSuffix}_${reportData.id}.pdf`,
        contentType: 'application/pdf',
        // Also include HTML fallback for email
        html: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error generating PDF report:", error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
