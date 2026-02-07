import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "npm:pdf-lib@1.17.1";

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
  pronosticoLevel?: number;
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
  // NEW FIELDS for premium features
  imageAnalysis?: string;
  smileSimulationUrl?: string;
  costEstimate?: {
    min: number;
    max: number;
    perImplant: number;
    includesAbutment: boolean;
  };
  whatIfFactors?: Array<{
    factor: string;
    currentValue: string;
    improvedValue: string;
    potentialGain: number;
  }>;
}

// ============================================================
//  COLORS (Brand: HUMANA.AI / ImplantX)
// ============================================================
const C = {
  DARK_BG:     rgb(10/255, 10/255, 10/255),
  DARK_HEADER: rgb(15/255, 15/255, 15/255),
  GOLD:        rgb(201/255, 168/255, 108/255),
  GOLD_LIGHT:  rgb(232/255, 213/255, 168/255),
  GOLD_DARK:   rgb(139/255, 115/255, 64/255),
  WHITE:       rgb(1, 1, 1),
  LIGHT_GRAY:  rgb(0.95, 0.95, 0.95),
  MED_GRAY:    rgb(0.6, 0.6, 0.6),
  DARK_GRAY:   rgb(0.3, 0.3, 0.3),
  TEXT:         rgb(0.2, 0.2, 0.2),
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
//  ODONTOGRAM DATA
// ============================================================
const TOOTH_POSITIONS: Record<string, { x: number; row: 'upper' | 'lower' }> = {
  '18': { x: 0, row: 'upper' }, '17': { x: 1, row: 'upper' }, '16': { x: 2, row: 'upper' }, '15': { x: 3, row: 'upper' },
  '14': { x: 4, row: 'upper' }, '13': { x: 5, row: 'upper' }, '12': { x: 6, row: 'upper' }, '11': { x: 7, row: 'upper' },
  '21': { x: 8, row: 'upper' }, '22': { x: 9, row: 'upper' }, '23': { x: 10, row: 'upper' }, '24': { x: 11, row: 'upper' },
  '25': { x: 12, row: 'upper' }, '26': { x: 13, row: 'upper' }, '27': { x: 14, row: 'upper' }, '28': { x: 15, row: 'upper' },
  '48': { x: 0, row: 'lower' }, '47': { x: 1, row: 'lower' }, '46': { x: 2, row: 'lower' }, '45': { x: 3, row: 'lower' },
  '44': { x: 4, row: 'lower' }, '43': { x: 5, row: 'lower' }, '42': { x: 6, row: 'lower' }, '41': { x: 7, row: 'lower' },
  '31': { x: 8, row: 'lower' }, '32': { x: 9, row: 'lower' }, '33': { x: 10, row: 'lower' }, '34': { x: 11, row: 'lower' },
  '35': { x: 12, row: 'lower' }, '36': { x: 13, row: 'lower' }, '37': { x: 14, row: 'lower' }, '38': { x: 15, row: 'lower' },
};

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
  currentSubtitle = '';

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
    p.drawText("by Clinica Miro", {
      x: M_LEFT, y: PAGE_H - HEADER_H + 7, size: 7, font: this.fontItalic, color: C.MED_GRAY,
    });
    this.y = PAGE_H - HEADER_H - 20;
  }

  drawFooter(tierLabel: string, currentPage: number, totalPages: number) {
    const p = this.page;
    const footY = FOOTER_H;
    p.drawRectangle({ x: M_LEFT, y: footY + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT, y: footY, size: 6.5, font: this.fontRegular, color: C.MED_GRAY,
    });
    const tierW = this.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, {
      x: (PAGE_W - tierW) / 2, y: footY, size: 6.5, font: this.fontBold, color: C.GOLD,
    });
    const pageText = `${currentPage} / ${totalPages}`;
    const pageW = this.fontRegular.widthOfTextAtSize(pageText, 6.5);
    p.drawText(pageText, {
      x: PAGE_W - M_RIGHT - pageW, y: footY, size: 6.5, font: this.fontRegular, color: C.MED_GRAY,
    });
  }

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

  drawBox(opts: { x?: number; width?: number; height: number; bgColor: any; borderColor?: any; borderWidth?: number; }) {
    const { x = M_LEFT, width = CONTENT_W, height, bgColor, borderColor, borderWidth = 0 } = opts;
    this.page.drawRectangle({
      x, y: this.y - height, width, height,
      color: bgColor, borderColor: borderColor || bgColor, borderWidth,
    });
  }

  drawResultBox(data: ReportData, showProbability: boolean) {
    const boxH = showProbability ? 85 : 75;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1 });
    const boxTop = this.y;

    this.page.drawText("RESULTADO DE LA EVALUACION", {
      x: M_LEFT + 10, y: boxTop - 16, size: 8, font: this.fontBold, color: C.GOLD_DARK,
    });

    if (showProbability && data.successProbability) {
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
      this.page.drawText("Disponible en informe Base", {
        x: M_LEFT + 110, y: boxTop - 40, size: 8, font: this.fontItalic, color: C.MED_GRAY,
      });
    }

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

    const verdict = this.getVerdict(progLevel);
    const verdictColor = this.getPronosticoColor(progLevel);
    const verdictBg = progLevel <= 2 ? rgb(0.9, 1, 0.9) : progLevel <= 3 ? rgb(1, 0.97, 0.88) : rgb(1, 0.92, 0.92);

    this.page.drawRectangle({
      x: PAGE_W - M_RIGHT - 170, y: boxTop - 68, width: 160, height: 18,
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
    const disclaimerText = "AVISO LEGAL: Este informe es una herramienta de orientacion basada en inteligencia artificial y no reemplaza la evaluacion clinica presencial. Los resultados son estimaciones basadas en la informacion proporcionada y literatura cientifica disponible (meta-analisis con n>50,000 pacientes). Consulte siempre con su implantologo antes de tomar decisiones de tratamiento.";
    this.drawText(disclaimerText, { size: 6.5, color: C.MED_GRAY, font: this.fontItalic, lineHeight: 9 });
    this.space(6);
    this.drawText("Dr. Carlos Montoya | Director Clinico | 11,000+ implantes | 27 anos de experiencia", {
      size: 7, color: C.GOLD_DARK, font: this.fontBold,
    });
    this.drawText("Ex-Director Postgrado Implantes, Universidad Mayor (2006-2020)", {
      size: 6.5, color: C.MED_GRAY, font: this.fontItalic,
    });
  }

  drawUpsellBox(targetTier: 'base' | 'completo', price: string) {
    const boxH = 90;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }
    this.drawBox({ height: boxH, bgColor: C.CREAM_BG, borderColor: C.GOLD, borderWidth: 1.5 });
    const bTop = this.y + boxH;

    const title = targetTier === 'base' ? 'DESBLOQUEA TU INFORME BASE' : 'ACCEDE AL INFORME COMPLETO';
    this.page.drawText(title, {
      x: M_LEFT + 10, y: bTop - 18, size: 11, font: this.fontBold, color: C.GOLD_DARK,
    });

    const features = targetTier === 'base'
      ? [
          '>> Probabilidad de exito exacta con gauge visual',
          '>> Factores de riesgo detallados con RR',
          '>> 6 recomendaciones personalizadas',
          '>> Videoconferencia con especialista incluida',
        ]
      : [
          '>> Todo lo del informe Base PLUS:',
          '>> Odontograma interactivo y analisis de IA',
          '>> Estimacion de costos y cronograma 6 meses',
          '>> Simulador What-If y preguntas clave',
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
    const bgColor = priority === 'CRITICO' ? C.RED_ALERT : priority === 'IMPORTANTE' ? C.ORANGE_MED : C.GREEN_OK;
    const badgeW = this.fontBold.widthOfTextAtSize(priority, 6) + 8;
    this.page.drawRectangle({ x, y: y - 3, width: badgeW, height: 12, color: bgColor });
    this.page.drawText(priority, { x: x + 4, y: y, size: 6, font: this.fontBold, color: C.WHITE });
  }

  // ============================================================
  //  NEW PREMIUM SECTIONS
  // ============================================================

  drawOdontogram(missingTeeth: string[]) {
    this.drawSectionTitle('Odontograma - Dientes Seleccionados');
    
    const gridStartX = M_LEFT + 20;
    const gridWidth = CONTENT_W - 40;
    const cellW = gridWidth / 16;
    const cellH = 25;
    const upperY = this.y - 10;
    const lowerY = this.y - 50;

    // Labels
    this.page.drawText('SUPERIOR', { x: M_LEFT, y: upperY - 8, size: 7, font: this.fontBold, color: C.MED_GRAY });
    this.page.drawText('INFERIOR', { x: M_LEFT, y: lowerY - 8, size: 7, font: this.fontBold, color: C.MED_GRAY });

    // Draw all teeth
    for (const [tooth, pos] of Object.entries(TOOTH_POSITIONS)) {
      const baseX = gridStartX + pos.x * cellW;
      const baseY = pos.row === 'upper' ? upperY : lowerY;
      const isMissing = missingTeeth.includes(tooth);

      // Tooth box
      this.page.drawRectangle({
        x: baseX, y: baseY - cellH, width: cellW - 2, height: cellH,
        color: isMissing ? C.RED_ALERT : C.LIGHT_GRAY,
        borderColor: isMissing ? C.RED_ALERT : C.MED_GRAY,
        borderWidth: 0.5,
      });

      // Tooth number
      const numW = this.fontBold.widthOfTextAtSize(tooth, 7);
      this.page.drawText(tooth, {
        x: baseX + (cellW - 2 - numW) / 2, y: baseY - 16,
        size: 7, font: this.fontBold, color: isMissing ? C.WHITE : C.TEXT,
      });

      // Implant icon for missing
      if (isMissing) {
        this.page.drawText('⚙', {
          x: baseX + (cellW - 8) / 2, y: baseY - 8,
          size: 6, font: this.fontRegular, color: C.WHITE,
        });
      }
    }

    // Legend
    this.y -= 80;
    this.page.drawRectangle({ x: M_LEFT, y: this.y, width: 10, height: 10, color: C.RED_ALERT });
    this.page.drawText('= Diente ausente / Implante planificado', {
      x: M_LEFT + 14, y: this.y + 2, size: 7, font: this.fontRegular, color: C.MED_GRAY,
    });
    this.y -= 18;
  }

  drawImageAnalysis(analysis: string) {
    this.drawSectionTitle('Analisis de Imagen con IA (Exclusivo)');
    
    const boxH = 70;
    this.drawBox({ height: boxH, bgColor: C.PURPLE_LIGHT, borderColor: C.PURPLE, borderWidth: 1 });
    const boxTop = this.y + boxH;

    this.page.drawText('DIAGNOSTICO ASISTIDO POR INTELIGENCIA ARTIFICIAL', {
      x: M_LEFT + 10, y: boxTop - 14, size: 8, font: this.fontBold, color: C.PURPLE,
    });

    // Draw analysis text wrapped
    const words = analysis.split(' ');
    let line = '';
    let lineY = boxTop - 28;
    const maxLineW = CONTENT_W - 30;

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (this.fontRegular.widthOfTextAtSize(testLine, 8) > maxLineW) {
        this.page.drawText(line, { x: M_LEFT + 10, y: lineY, size: 8, font: this.fontRegular, color: C.DARK_GRAY });
        lineY -= 11;
        line = word;
        if (lineY < boxTop - boxH + 10) break;
      } else {
        line = testLine;
      }
    }
    if (line && lineY >= boxTop - boxH + 10) {
      this.page.drawText(line, { x: M_LEFT + 10, y: lineY, size: 8, font: this.fontRegular, color: C.DARK_GRAY });
    }

    this.y -= boxH + 8;
  }

  drawSmileSimulationPlaceholder() {
    this.drawSectionTitle('Simulacion de Sonrisa (Vista Previa)');
    
    const boxH = 50;
    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1 });
    const boxTop = this.y + boxH;

    this.page.drawText('Tu simulacion de sonrisa esta disponible en la plataforma web.', {
      x: M_LEFT + 10, y: boxTop - 20, size: 9, font: this.fontRegular, color: C.TEXT,
    });
    this.page.drawText('Accede a implantx.cl/mi-sonrisa para ver el resultado interactivo.', {
      x: M_LEFT + 10, y: boxTop - 34, size: 8, font: this.fontItalic, color: C.MED_GRAY,
    });

    this.y -= boxH + 8;
  }

  drawCostEstimate(data: ReportData) {
    this.drawSectionTitle('Estimacion de Costos');
    
    const nTeeth = data.nTeeth || 1;
    const cost = data.costEstimate || {
      min: 800000 * nTeeth,
      max: 1500000 * nTeeth,
      perImplant: 1200000,
      includesAbutment: true,
    };

    const formatCLP = (n: number) => '$' + n.toLocaleString('es-CL') + ' CLP';

    const rows = [
      ['Implantes requeridos', `${nTeeth} unidades`, '-'],
      ['Rango estimado total', formatCLP(cost.min) + ' - ' + formatCLP(cost.max), 'Segun complejidad'],
      ['Precio por implante (ref)', formatCLP(cost.perImplant), cost.includesAbutment ? 'Incluye pilar' : 'Sin pilar'],
      ['Corona definitiva', formatCLP(250000) + ' - ' + formatCLP(450000), 'Por unidad'],
    ];

    this.drawTable(['Concepto', 'Valor', 'Nota'], rows, {
      colWidths: [160, 180, CONTENT_W - 340],
      headerBg: C.GOLD_DARK,
      headerColor: C.WHITE,
    });

    this.space(4);
    this.drawText('* Precios referenciales basados en tarifas de Clinica Miro. Valores finales sujetos a evaluacion presencial.', {
      size: 6.5, color: C.MED_GRAY, font: this.fontItalic,
    });
    this.space(4);
  }

  drawClinicalTimeline() {
    this.drawSectionTitle('Cronograma Clinico Estimado (6 Meses)');

    const phases = [
      { month: 'Mes 1', phase: 'Preparacion', activities: 'Evaluacion, examenes, tratamientos previos' },
      { month: 'Mes 2', phase: 'Cirugia Fase 1', activities: 'Colocacion de implantes, inicio oseointegracion' },
      { month: 'Mes 3-4', phase: 'Oseointegracion', activities: 'Controles periodicos, radiografias de seguimiento' },
      { month: 'Mes 5', phase: 'Cirugia Fase 2', activities: 'Conexion de pilares, toma de impresiones' },
      { month: 'Mes 6', phase: 'Protesis Final', activities: 'Instalacion de coronas definitivas' },
    ];

    const rows = phases.map(p => [p.month, p.phase, p.activities]);
    this.drawTable(['Periodo', 'Fase', 'Actividades'], rows, {
      colWidths: [70, 110, CONTENT_W - 180],
      headerBg: C.BLUE_ACCENT,
      headerColor: C.WHITE,
      altRowBg: C.BLUE_LIGHT,
    });

    this.space(4);
    this.drawText('* El cronograma puede variar segun condiciones individuales y respuesta del paciente.', {
      size: 6.5, color: C.MED_GRAY, font: this.fontItalic,
    });
  }

  drawQuestionsForSpecialist() {
    this.drawSectionTitle('Preguntas Clave para tu Especialista');

    const questions = [
      'Cual es el tipo de implante recomendado para mi caso?',
      'Necesito injerto oseo o regeneracion de encias?',
      'Cuanto tiempo durara mi tratamiento completo?',
      'Que pasa si un implante no oseointegra correctamente?',
      'Puedo usar protesis temporal durante la oseointegracion?',
      'Cual es el protocolo de mantenimiento post-tratamiento?',
      'Tiene garantia el procedimiento y los materiales?',
    ];

    for (let i = 0; i < questions.length; i++) {
      this.page.drawText(`${i + 1}.`, { x: M_LEFT, y: this.y, size: 9, font: this.fontBold, color: C.GOLD });
      this.drawText(questions[i], { x: M_LEFT + 18, size: 8.5, color: C.TEXT, maxWidth: CONTENT_W - 20 });
      this.space(2);
    }
  }

  drawWhatIfSimulator(factors: Array<{ factor: string; currentValue: string; improvedValue: string; potentialGain: number }>) {
    this.drawSectionTitle('Simulador "What-If" - Potencial de Mejora');

    if (!factors || factors.length === 0) {
      // Generate default factors
      factors = [
        { factor: 'Dejar de fumar', currentValue: 'Fumador activo', improvedValue: 'No fumador', potentialGain: 15 },
        { factor: 'Mejorar higiene oral', currentValue: 'Regular', improvedValue: 'Excelente', potentialGain: 8 },
        { factor: 'Control de diabetes', currentValue: 'No controlada', improvedValue: 'HbA1c < 7%', potentialGain: 10 },
      ];
    }

    const rows = factors.map(f => [
      f.factor,
      f.currentValue,
      f.improvedValue,
      `+${f.potentialGain}%`,
    ]);

    this.drawTable(['Factor Modificable', 'Estado Actual', 'Si Mejora a...', 'Ganancia'], rows, {
      colWidths: [130, 110, 120, CONTENT_W - 360],
      headerBg: C.GREEN_OK,
      headerColor: C.WHITE,
    });

    const totalGain = factors.reduce((sum, f) => sum + f.potentialGain, 0);
    this.space(4);
    this.drawText(`Potencial de mejora total: +${totalGain}% en probabilidad de exito`, {
      size: 9, font: this.fontBold, color: C.GREEN_OK,
    });
    this.space(4);
  }

  drawTreatmentInfographic(data: ReportData) {
    this.drawSectionTitle('Infografia de tu Tratamiento');

    const boxH = 110;
    if (this.y - boxH < M_BOTTOM + FOOTER_H + 20) {
      this.newPage();
      this.drawHeader(this.currentSubtitle);
    }

    this.drawBox({ height: boxH, bgColor: C.BEIGE_BG, borderColor: C.GOLD, borderWidth: 1 });
    const boxTop = this.y + boxH;

    // Treatment summary visual
    const colW = CONTENT_W / 4;

    // Column 1: Implants
    this.page.drawText('IMPLANTES', { x: M_LEFT + 10, y: boxTop - 18, size: 8, font: this.fontBold, color: C.GOLD_DARK });
    this.page.drawText(`${data.nTeeth || 1}`, { x: M_LEFT + 10, y: boxTop - 45, size: 28, font: this.fontBold, color: C.GOLD });
    this.page.drawText('unidades', { x: M_LEFT + 10, y: boxTop - 58, size: 7, font: this.fontRegular, color: C.MED_GRAY });

    // Column 2: Time
    this.page.drawText('DURACION', { x: M_LEFT + colW, y: boxTop - 18, size: 8, font: this.fontBold, color: C.GOLD_DARK });
    this.page.drawText('6', { x: M_LEFT + colW, y: boxTop - 45, size: 28, font: this.fontBold, color: C.BLUE_ACCENT });
    this.page.drawText('meses aprox.', { x: M_LEFT + colW, y: boxTop - 58, size: 7, font: this.fontRegular, color: C.MED_GRAY });

    // Column 3: Success
    this.page.drawText('EXITO', { x: M_LEFT + colW * 2, y: boxTop - 18, size: 8, font: this.fontBold, color: C.GOLD_DARK });
    this.page.drawText(`${data.successProbability || 85}%`, { x: M_LEFT + colW * 2, y: boxTop - 45, size: 28, font: this.fontBold, color: C.GREEN_OK });
    this.page.drawText('probabilidad', { x: M_LEFT + colW * 2, y: boxTop - 58, size: 7, font: this.fontRegular, color: C.MED_GRAY });

    // Column 4: Investment
    const nTeeth = data.nTeeth || 1;
    const minCost = Math.round((800000 * nTeeth) / 1000000 * 10) / 10;
    const maxCost = Math.round((1500000 * nTeeth) / 1000000 * 10) / 10;
    this.page.drawText('INVERSION', { x: M_LEFT + colW * 3, y: boxTop - 18, size: 8, font: this.fontBold, color: C.GOLD_DARK });
    this.page.drawText(`${minCost}-${maxCost}M`, { x: M_LEFT + colW * 3, y: boxTop - 45, size: 22, font: this.fontBold, color: C.ORANGE_MED });
    this.page.drawText('CLP estimado', { x: M_LEFT + colW * 3, y: boxTop - 58, size: 7, font: this.fontRegular, color: C.MED_GRAY });

    // Bottom note
    this.page.drawText('Incluye: Cirugia + Implantes + Pilares + Coronas definitivas + Controles', {
      x: M_LEFT + 10, y: boxTop - 85, size: 7, font: this.fontItalic, color: C.MED_GRAY,
    });
    this.page.drawText('El pago del informe se descuenta del tratamiento si decides operar con nosotros.', {
      x: M_LEFT + 10, y: boxTop - 97, size: 7, font: this.fontBold, color: C.GOLD_DARK,
    });

    this.y -= boxH + 8;
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }
}

// ============================================================
//  REPORT GENERATORS
// ============================================================

async function generateFreeReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('free');
  b.currentSubtitle = 'PRE-INFORME ORIENTATIVO';
  b.totalPages = 1;

  b.drawHeader('PRE-INFORME ORIENTATIVO');

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
  b.drawResultBox(data, false);

  b.drawSectionTitle('Resumen Orientativo');
  const numFactors = (data.factors || []).filter(f => f.impact < -2 || (f.rr && f.rr > 1.0)).length;
  const summaryText = `Se han identificado ${numFactors} factores clinicos relevantes en su evaluacion. Su perfil sugiere que ${data.pronosticoLevel && data.pronosticoLevel <= 2 ? 'usted es un buen candidato para implantes dentales' : 'es necesario un trabajo preparatorio antes de proceder con la colocacion de implantes'}. Para obtener su probabilidad exacta de exito y recomendaciones personalizadas, consulte el Informe Base.`;
  b.drawText(summaryText, { size: 9, lineHeight: 13, color: C.DARK_GRAY });

  b.space(6);
  b.drawSectionTitle('Que Incluye Este Pre-Informe');
  const includes = ['Nivel de pronostico general (1-5)', 'Veredicto de candidatura (orientativo)', 'Cantidad de factores de riesgo identificados'];
  for (const item of includes) {
    b.drawText(`  + ${item}`, { size: 8, color: C.GREEN_OK, font: b.fontRegular });
  }

  b.space(4);
  b.drawText('No incluye:', { size: 8, color: C.RED_ALERT, font: b.fontBold });
  const notIncludes = ['Probabilidad de exito exacta', 'Detalle de factores de riesgo con RR', 'Recomendaciones personalizadas', 'Odontograma interactivo', 'Estimacion de costos'];
  for (const item of notIncludes) {
    b.drawText(`  x ${item}`, { size: 8, color: C.MED_GRAY, font: b.fontRegular });
  }

  b.space(8);
  b.drawUpsellBox('base', '$14.900 CLP');
  b.drawDisclaimer();
  b.drawFooter('PRE-INFORME GRATIS', 1, 1);

  return b.save();
}

async function generateBaseReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('plan-accion');
  b.currentSubtitle = 'INFORME BASE';
  b.totalPages = 2;

  // PAGE 1
  b.drawHeader('INFORME DE EVALUACION - IMPLANTX BASE');

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
  b.drawResultBox(data, true);

  if (data.successProbability) {
    b.drawText('Escala visual de riesgo:', { size: 8, color: C.MED_GRAY, font: b.fontItalic });
    b.drawRiskGauge(data.successProbability);
  }

  if (data.factors && data.factors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo Identificados');
    const factorRows = data.factors.map(f => [
      f.name,
      f.value,
      f.rr ? `${f.rr.toFixed(1)}x` : `${Math.abs(f.impact)}%`,
      f.rr && f.rr > 1.5 ? 'ALTO' : f.rr && f.rr > 1.2 ? 'MODERADO' : 'BAJO',
    ]);
    b.drawTable(['Factor Clinico', 'Condicion', 'RR / Impacto', 'Nivel'], factorRows, {
      colWidths: [170, 140, 80, CONTENT_W - 390]
    });
    b.space(2);
    b.drawText('RR = Riesgo Relativo. Un RR de 2.0x indica el doble de riesgo respecto a la poblacion base.', {
      size: 6.5, color: C.MED_GRAY, font: b.fontItalic,
    });
  }

  // PAGE 2
  b.newPage();
  b.drawHeader('INFORME DE EVALUACION - IMPLANTX BASE');

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

  b.space(10);
  b.drawUpsellBox('completo', '$29.990 CLP');

  b.space(8);
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

  b.drawDisclaimer();

  // Footers
  const pages = b.doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawRectangle({ x: M_LEFT, y: FOOTER_H + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
    const tierLabel = "INFORME BASE";
    const tw = b.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, { x: (PAGE_W - tw) / 2, y: FOOTER_H, size: 6.5, font: b.fontBold, color: C.GOLD });
    const pgText = `${i + 1} / ${pages.length}`;
    const pgW = b.fontRegular.widthOfTextAtSize(pgText, 6.5);
    p.drawText(pgText, { x: PAGE_W - M_RIGHT - pgW, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY });
  }

  return b.save();
}

async function generateCompletoReport(data: ReportData): Promise<Uint8Array> {
  const b = new PDFBuilder();
  await b.init('premium');
  b.currentSubtitle = 'INFORME CLINICO COMPLETO';

  // PAGE 1
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

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
  b.drawResultBox(data, true);

  if (data.successProbability) {
    b.drawRiskGauge(data.successProbability);
  }

  // Odontogram (PREMIUM EXCLUSIVE)
  if (data.missingTeeth && data.missingTeeth.length > 0) {
    b.drawOdontogram(data.missingTeeth);
  }

  // Factors table
  if (data.factors && data.factors.length > 0) {
    b.drawSectionTitle('Factores de Riesgo con Acciones');
    const factorRows = data.factors.map(f => [
      f.name, f.value, f.rr ? `${f.rr.toFixed(1)}x` : `${Math.abs(f.impact)}%`, f.action || 'Monitorizar',
    ]);
    b.drawTable(['Factor', 'Condicion', 'RR', 'Accion Requerida'], factorRows, {
      colWidths: [130, 115, 55, CONTENT_W - 300]
    });
  }

  // PAGE 2
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // Image Analysis (PREMIUM EXCLUSIVE)
  if (data.imageAnalysis) {
    b.drawImageAnalysis(data.imageAnalysis);
  }

  // Smile Simulation placeholder
  b.drawSmileSimulationPlaceholder();

  // Synergies
  if (data.synergies && data.synergies.length > 0) {
    b.drawSectionTitle('Sinergias de Riesgo (Exclusivo)');
    b.drawText('Las sinergias representan interacciones entre factores que multiplican el riesgo.', {
      size: 8, color: C.MED_GRAY, font: b.fontItalic,
    });
    b.space(4);
    const synergyRows = data.synergies.map(s => [
      s.text, s.multiplier ? `${s.multiplier.toFixed(1)}x` : '-', s.implication || 'Requiere atencion especial',
    ]);
    b.drawTable(['Combinacion de Factores', 'Multiplicador', 'Implicancia Clinica'], synergyRows, {
      colWidths: [200, 80, CONTENT_W - 280], headerBg: C.RED_ALERT, headerColor: C.WHITE, altRowBg: C.PINK_LIGHT,
    });
  }

  b.space(8);

  // Treatment zones
  if (data.treatmentZones && data.treatmentZones.length > 0) {
    b.drawSectionTitle('Plan de Tratamiento por Zona Anatomica');
    const zoneRows = data.treatmentZones.map(z => [z.zone, `${z.implants}`, z.complexity, z.notes]);
    const totalImplants = data.treatmentZones.reduce((sum, z) => sum + z.implants, 0);
    zoneRows.push(['TOTAL', `${totalImplants}`, '-', 'Implantes planificados']);
    b.drawTable(['Zona Anatomica', 'Implantes', 'Complejidad', 'Notas Clinicas'], zoneRows, {
      colWidths: [150, 65, 85, CONTENT_W - 300], headerBg: C.BLUE_ACCENT, headerColor: C.WHITE, altRowBg: C.BLUE_LIGHT,
    });
  }

  // PAGE 3
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // Cost Estimate (PREMIUM EXCLUSIVE)
  b.drawCostEstimate(data);

  // Clinical Timeline (PREMIUM EXCLUSIVE)
  b.drawClinicalTimeline();

  // PAGE 4
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // Prioritized Protocol
  if (data.recommendations && data.recommendations.length > 0) {
    b.drawSectionTitle('Protocolo de Preparacion Priorizado');
    for (let i = 0; i < data.recommendations.length; i++) {
      const rec = data.recommendations[i];
      const priority = rec.priority || (i < 2 ? 'CRITICO' : i < 4 ? 'IMPORTANTE' : 'RECOMENDADO');
      if (b.y < M_BOTTOM + FOOTER_H + 40) {
        b.newPage();
        b.drawHeader(b.currentSubtitle);
      }
      b.drawPriorityBadge(priority, M_LEFT, b.y);
      const badgeW = b.fontBold.widthOfTextAtSize(priority, 6) + 14;
      b.drawText(`${i + 1}. ${rec.text}`, {
        x: M_LEFT + badgeW, size: 9, font: b.fontBold, color: C.DARK_GRAY, maxWidth: CONTENT_W - badgeW,
      });
      if (rec.evidence) {
        b.drawText(`Evidencia: ${rec.evidence}`, {
          x: M_LEFT + badgeW, size: 7, color: C.MED_GRAY, font: b.fontItalic, maxWidth: CONTENT_W - badgeW,
        });
      }
      b.space(6);
    }
  }

  b.space(6);

  // Questions for Specialist (PREMIUM EXCLUSIVE)
  b.drawQuestionsForSpecialist();

  // PAGE 5
  b.newPage();
  b.drawHeader('INFORME CLINICO COMPLETO - IMPLANTX');

  // What-If Simulator (PREMIUM EXCLUSIVE)
  b.drawWhatIfSimulator(data.whatIfFactors || []);

  b.space(8);

  // Treatment Infographic (PREMIUM EXCLUSIVE)
  b.drawTreatmentInfographic(data);

  b.space(8);

  // Next steps
  b.drawSectionTitle('Proximos Pasos');
  const stepsText = [
    '1. Videoconferencia con el Dr. Montoya para revision del informe (incluida)',
    '2. Envio de imagenes radiograficas complementarias (panoramica o CBCT)',
    '3. El pago de $29.990 se abona integramente al tratamiento final',
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
      x: M_LEFT + 15, y: ctaTop - 20, size: 13, font: b.fontBold, color: C.WHITE,
    });
    b.page.drawText('Contacto directo: +56 9 7415 7966 | WhatsApp', {
      x: M_LEFT + 15, y: ctaTop - 36, size: 9, font: b.fontRegular, color: C.GOLD_LIGHT,
    });
    b.page.drawText('clinicamiro.cl | implantx.cl', {
      x: M_LEFT + 15, y: ctaTop - 48, size: 8, font: b.fontItalic, color: C.GOLD_LIGHT,
    });
    b.y -= ctaH + 8;
  }

  b.drawDisclaimer();

  // Footers for ALL pages
  const pages = b.doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    p.drawRectangle({ x: M_LEFT, y: FOOTER_H + 12, width: CONTENT_W, height: 0.8, color: C.GOLD });
    p.drawText("Clinica Miro | Av. Nueva Providencia 2214 Of 189, Providencia", {
      x: M_LEFT, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY,
    });
    const tierLabel = "INFORME COMPLETO";
    const tw = b.fontBold.widthOfTextAtSize(tierLabel, 6.5);
    p.drawText(tierLabel, { x: (PAGE_W - tw) / 2, y: FOOTER_H, size: 6.5, font: b.fontBold, color: C.GOLD });
    const pgText = `${i + 1} / ${pages.length}`;
    const pgW = b.fontRegular.widthOfTextAtSize(pgText, 6.5);
    p.drawText(pgText, { x: PAGE_W - M_RIGHT - pgW, y: FOOTER_H, size: 6.5, font: b.fontRegular, color: C.MED_GRAY });
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

    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));
    const levelSuffix = purchaseLevel === 'premium' ? '_Completo'
      : purchaseLevel === 'plan-accion' ? '_Base'
      : '_Gratis';

    console.log('PDF generated successfully, pages:', purchaseLevel === 'premium' ? 5 : purchaseLevel === 'plan-accion' ? 2 : 1);

    return new Response(
      JSON.stringify({
        success: true,
        pdf: base64Pdf,
        downloadName: `ImplantX_Informe${levelSuffix}_${reportData.id}.pdf`,
        contentType: 'application/pdf',
        html: null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
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
