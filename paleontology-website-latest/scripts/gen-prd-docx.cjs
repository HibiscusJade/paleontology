// Generate Word document for PRD with Chinese formatting
// 宋体小四正文, 黑体标题, 首行缩进2字符, 1.5倍行距

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType
} = require("docx");

const MD_FILE = "D:\\Paleontology\\paleontology-website-latest\\docs\\中国古生物学会网站-建设进展PRD.md";
const OUT_FILE = "D:\\Paleontology\\paleontology-website-latest\\docs\\中国古生物学会网站-建设进展PRD.docx";

// Font constants (docx-js uses half-points for size)
const FONT_BODY = "SimSun";       // 宋体
const FONT_HEADING = "SimHei";    // 黑体

// Chinese font sizes: 小二=18pt(36), 四号=14pt(28), 小四=12pt(24)
const SIZE_H1 = 36;  // 小二 18pt = 36 half-pts
const SIZE_H2 = 28;  // 四号 14pt = 28 half-pts
const SIZE_H3 = 24;  // 小四 12pt = 24 half-pts
const SIZE_H4 = 24;  // 小四 12pt = 24 half-pts
const SIZE_BODY = 24; // 小四 12pt = 24 half-pts

// Margins: top/bottom 2.54cm = 1440 DXA, left/right 3.18cm ≈ 1803 DXA
const MARGIN_TB = 1440;  // 2.54cm
const MARGIN_LR = 1803;  // 3.18cm

// First line indent for body: 2 characters at 12pt = 24pt = 480 DXA
const INDENT_FIRST_LINE = 480;

// Line spacing: 1.5x = 360 (240 * 1.5)
const LINE_SPACING = 360;

// Table border style
const tblBorder = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const tblBorders = { top: tblBorder, bottom: tblBorder, left: tblBorder, right: tblBorder };
const tblMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Content width for A4 with 3.18cm margins: 11906 - 2*1803 = 8300 DXA
const CONTENT_WIDTH = 8300;

// ============== PARSING HELPERS ==============

const lines = fs.readFileSync(MD_FILE, "utf-8").split("\n");

// Inline parser: split text into [ { text, bold, size, font } ]
function parseInline(text, baseSize = SIZE_BODY, baseFont = FONT_BODY) {
  const runs = [];
  let i = 0;
  let current = "";

  while (i < text.length) {
    if (text[i] === "*" && text[i+1] === "*") {
      // Flush current plain text
      if (current) { runs.push({ text: current, bold: false, size: baseSize, font: baseFont }); current = ""; }
      i += 2;
      // Parse bold content
      let boldText = "";
      while (i < text.length && !(text[i] === "*" && text[i+1] === "*")) {
        boldText += text[i]; i++;
      }
      if (boldText) { runs.push({ text: boldText, bold: true, size: baseSize, font: baseFont }); }
      if (i < text.length) i += 2; // skip closing **
    } else {
      current += text[i]; i++;
    }
  }
  if (current) { runs.push({ text: current, bold: false, size: baseSize, font: baseFont }); }
  return runs;
}

function makeRun(text, bold = false, size = SIZE_BODY, font = FONT_BODY, color) {
  const opts = { text, bold, size, font };
  if (color) opts.color = color;
  return new TextRun(opts);
}

// Create a paragraph for headings
function makeHeading(text, level) {
  const hLevel = [null, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][level];
  const sizes = [null, SIZE_H1, SIZE_H2, SIZE_H3, SIZE_H4];
  const size = sizes[level];

  // Headings: no first-line indent, 1.5x line spacing, SimHei bold
  return new Paragraph({
    heading: hLevel,
    spacing: { before: level <= 2 ? 240 : 160, after: level <= 2 ? 160 : 100, line: LINE_SPACING },
    indent: { firstLine: 0 },
    children: [makeRun(text, true, size, FONT_HEADING)],
  });
}

// Create a body paragraph
function makeBodyPara(inlineRuns, options = {}) {
  const { indent = true, alignment } = options;
  const paraOpts = {
    spacing: { line: LINE_SPACING, before: 0, after: 0 },
    children: inlineRuns.map(r => makeRun(r.text, r.bold, r.size || SIZE_BODY, r.font || FONT_BODY)),
  };
  if (indent) paraOpts.indent = { firstLine: INDENT_FIRST_LINE };
  if (alignment) paraOpts.alignment = alignment;
  return new Paragraph(paraOpts);
}

// Create a paragraph from plain text (handles inline **bold**)
function makeTextPara(text, options = {}) {
  const runs = parseInline(text);
  return makeBodyPara(runs, options);
}

// Create a blockquote-style paragraph
function makeQuotePara(text) {
  return new Paragraph({
    spacing: { line: LINE_SPACING, before: 60, after: 60 },
    indent: { left: 480, firstLine: 0 },
    border: { left: { style: BorderStyle.SINGLE, size: 6, color: "C41E3A", space: 8 } },
    children: parseInline(text).map(r => makeRun(r.text, r.bold, SIZE_BODY, FONT_BODY, "666666")),
  });
}

// Create a table from rows of arrays
function makeTable(rows, colWidths, headerBold = true) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const tblRows = rows.map((row, ri) => {
    return new TableRow({
      children: row.map((cellText, ci) => {
        const isHeader = headerBold && ri === 0;
        const runs = parseInline(String(cellText));
        return new TableCell({
          borders: tblBorders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          margins: tblMargins,
          shading: isHeader ? { fill: "002B49", type: ShadingType.CLEAR } : undefined,
          children: [new Paragraph({
            spacing: { line: LINE_SPACING },
            children: runs.map(r => makeRun(r.text, r.bold || isHeader, SIZE_BODY, FONT_BODY, isHeader ? "FFFFFF" : undefined)),
          })],
        });
      }),
    });
  });

  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: tblRows,
  });
}

// Parse pipe table: returns { headers, rows } or null
function parseTable(lines, startIdx) {
  const headerLine = lines[startIdx];
  const sepLine = lines[startIdx + 1];
  if (!headerLine || !sepLine) return null;
  if (!headerLine.includes("|") || !sepLine.includes("|") || !sepLine.includes("-")) return null;

  const headers = headerLine.split("|").filter(s => s.trim() !== "").map(s => s.trim());
  const rows = [];
  for (let i = startIdx + 2; i < lines.length; i++) {
    const row = lines[i];
    if (!row.includes("|")) break;
    rows.push(row.split("|").filter(s => s.trim() !== "").map(s => s.trim()));
  }
  return { headers, rows, endIdx: startIdx + 2 + rows.length - 1 };
}

// Check if a line is a bullet item (- 开头)
function isBullet(line) {
  return /^\s*-\s+/.test(line);
}

// Check if a line is a numbered item (1. 开头)
function isNumbered(line) {
  return /^\s*\d+\.\s+/.test(line);
}

// Check if a line is a separator (---)
function isSeparator(line) {
  return /^---+$/.test(line.trim());
}

// Check if a line is a blockquote (> )
function isBlockquote(line) {
  return line.startsWith(">");
}

// Check if a line is a code block start/end (```)
function isCodeFence(line) {
  return line.trim().startsWith("```");
}

// Check if a line is a heading
function getHeadingLevel(line) {
  const m = line.match(/^(#{1,4})\s+(.+)/);
  if (m) return { level: m[1].length, text: m[2] };
  return null;
}

// ============== MAIN PARSER ==============

const children = [];
let i = 0;
let inCodeBlock = false;

function collectBulletGroup(startIdx) {
  const items = [];
  let j = startIdx;
  while (j < lines.length && isBullet(lines[j]) && !isSeparator(lines[j])) {
    const text = lines[j].replace(/^\s*-\s+/, "").trim();
    items.push(text);
    j++;
  }
  return { items, endIdx: j - 1 };
}

function collectNumberedGroup(startIdx) {
  const items = [];
  let j = startIdx;
  while (j < lines.length && isNumbered(lines[j]) && !isSeparator(lines[j])) {
    const text = lines[j].replace(/^\s*\d+\.\s+/, "").trim();
    items.push(text);
    j++;
  }
  return { items, endIdx: j - 1 };
}

while (i < lines.length) {
  const line = lines[i];

  // Code blocks
  if (isCodeFence(line)) {
    inCodeBlock = !inCodeBlock;
    if (inCodeBlock) {
      // Collect code content
      i++;
      let codeLines = [];
      while (i < lines.length && !isCodeFence(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      // Render code as monospace paragraph with slight indent
      const codeText = codeLines.join("\n");
      children.push(new Paragraph({
        spacing: { line: 240, before: 40, after: 40 },
        indent: { left: 360, firstLine: 0 },
        shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
        children: [makeRun(codeText, false, 20, "Courier New", "333333")],
      }));
      // i now points to closing ```
      if (i < lines.length && isCodeFence(lines[i])) inCodeBlock = false;
      i++;
      continue;
    }
    i++;
    continue;
  }

  if (inCodeBlock) { i++; continue; }

  // Separator
  if (isSeparator(line)) {
    i++; continue;
  }

  // Blockquote
  if (isBlockquote(line)) {
    const text = line.replace(/^>\s*/, "").trim();
    if (text) {
      children.push(makeQuotePara(text));
    }
    i++; continue;
  }

  // Heading
  const h = getHeadingLevel(line);
  if (h) {
    children.push(makeHeading(h.text, h.level));
    i++; continue;
  }

  // Pipe table
  const tbl = parseTable(lines, i);
  if (tbl) {
    const nCols = tbl.headers.length;
    // Calculate column widths proportionally
    const colWidths = tbl.headers.map(() => Math.floor(CONTENT_WIDTH / nCols));
    const allRows = [tbl.headers, ...tbl.rows];
    children.push(makeTable(allRows, colWidths, true));
    // Add a small gap after table
    children.push(new Paragraph({ spacing: { before: 60 }, children: [] }));
    i = tbl.endIdx + 1;
    continue;
  }

  // Bullet list group
  if (isBullet(line)) {
    const grp = collectBulletGroup(i);
    const bulletPara = new Paragraph({
      spacing: { line: LINE_SPACING, before: 0, after: 0 },
      indent: { left: 480, firstLine: 0, hanging: 240 },
      children: [makeRun("• ", false, SIZE_BODY, FONT_BODY)],
    });
    // Add the bullet text after the bullet marker
    const bulletText = grp.items[0];
    bulletPara.addChildElement(makeRun(bulletText, false, SIZE_BODY, FONT_BODY).root);
    children.push(bulletPara);

    for (let j = 1; j < grp.items.length; j++) {
      const p = new Paragraph({
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: { left: 480, firstLine: 0, hanging: 240 },
        children: [
          makeRun("• ", false, SIZE_BODY, FONT_BODY),
          makeRun(grp.items[j], false, SIZE_BODY, FONT_BODY),
        ],
      });
      children.push(p);
    }
    i = grp.endIdx + 1;
    continue;
  }

  // Numbered list group
  if (isNumbered(line)) {
    const grp = collectNumberedGroup(i);
    grp.items.forEach((item, idx) => {
      const cleanText = item.replace(/^\s*\d+\.\s*/, "").trim();
      children.push(new Paragraph({
        spacing: { line: LINE_SPACING, before: 0, after: 0 },
        indent: { left: 480, firstLine: 0, hanging: 240 },
        children: [
          makeRun(`${idx + 1}. `, false, SIZE_BODY, FONT_BODY),
          ...parseInline(cleanText),
        ],
      }));
    });
    i = grp.endIdx + 1;
    continue;
  }

  // Bold standalone line (like **学会主站（10个栏目）：**)
  const boldLineMatch = line.match(/^\*\*(.+)\*\*$/);
  if (boldLineMatch) {
    children.push(new Paragraph({
      spacing: { line: LINE_SPACING, before: 80, after: 0 },
      indent: { firstLine: 0 },
      children: [makeRun(boldLineMatch[1], true, SIZE_BODY, FONT_BODY)],
    }));
    i++; continue;
  }

  // Empty line
  if (line.trim() === "") {
    children.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [] }));
    i++; continue;
  }

  // Regular paragraph
  children.push(makeTextPara(line.trim()));
  i++;
}

// ============== BUILD DOCUMENT ==============

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT_BODY, size: SIZE_BODY, color: "000000" },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H1, bold: true, font: FONT_HEADING, color: "000000" },
        paragraph: { spacing: { before: 360, after: 200, line: LINE_SPACING }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H2, bold: true, font: FONT_HEADING, color: "000000" },
        paragraph: { spacing: { before: 280, after: 160, line: LINE_SPACING }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H3, bold: true, font: FONT_HEADING, color: "000000" },
        paragraph: { spacing: { before: 200, after: 120, line: LINE_SPACING }, outlineLevel: 2 },
      },
      {
        id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: SIZE_H4, bold: true, font: FONT_HEADING, color: "000000" },
        paragraph: { spacing: { before: 160, after: 100, line: LINE_SPACING }, outlineLevel: 3 },
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: MARGIN_TB, bottom: MARGIN_TB, left: MARGIN_LR, right: MARGIN_LR },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT_FILE, buffer);
  console.log("Word document generated: " + OUT_FILE);
});
