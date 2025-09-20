/*
 * Copyright (c) 2014 MKLab. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/* global C2S */

const fs = require("fs-extra");
const filenamify = require("filenamify");
const PDFDocument = require("pdfkit");
const { Point, ZoomFactor, Canvas } = require("../core/graphics");
const { PDFCanvas } = require("./pdf-graphics");
const { Context } = require("svgcanvas");

const BOUNDING_BOX_EXPAND = 10;

const PDF_MARGIN = 30;
const PDF_DEFAULT_ZOOM = 1; // Default Zoom Level

const PRO_DIAGRAM_TYPES = [
  "SysMLRequirementDiagram",
  "SysMLBlockDefinitionDiagram",
  "SysMLInternalBlockDiagram",
  "SysMLParametricDiagram",
  "BPMNDiagram",
  "WFWireframeDiagram",
  "AWSDiagram",
  "GCPDiagram",
];

function isProDiagram(diagramType) {
  // Always return false - treat all diagrams as free/unlimited
  return false;
}

/**
 * @private
 * SVGCanavas for SVG Export
 */
class SVGCanvas extends Canvas {
  /**
   * To embed svg image in the exported svg file, we need to convert the svg image to base64
   */
  drawImage(image, x, y, w, h) {
    this.transform();
    if (
      typeof image.src === "string" &&
      image.src.toLowerCase().startsWith("file://")
    ) {
      if (image.src.toLowerCase().endsWith(".svg")) {
        const filePath = image.src.substring(7);
        if (fs.existsSync(filePath)) {
          const svgString = fs.readFileSync(filePath, "utf8");
          const base64Svg = btoa(unescape(encodeURIComponent(svgString)));
          const data = `data:image/svg+xml;base64,${base64Svg}`;
          const img = new Image();
          img.src = data;
          img.width = image.width;
          img.height = image.height;
          this.context.drawImage(img, x, y, w, h);
        }
      } else if (image.src.toLowerCase().endsWith(".png")) {
        const filePath = image.src.substring(7);
        if (fs.existsSync(filePath)) {
          const pngBuffer = fs.readFileSync(filePath);
          const base64String = pngBuffer.toString("base64");
          const data = `data:image/png;base64,${base64String}`;
          const img = new Image();
          img.src = data;
          img.width = image.width;
          img.height = image.height;
          this.context.drawImage(img, x, y, w, h);
        }
      }
    } else {
      this.context.drawImage(image, x, y, w, h);
    }
    this.restoreTransform();
  }
}

/**
 * @private
 * Get Base64-encoded image data of diagram
 * @param {Editor} editor
 * @param {string} type (e.g. 'image/png')
 * @return {string}
 */
function getImageData(diagram, type) {
  // Crear un nuevo canvas para generar la imagen
  var canvasElement = document.createElement("canvas");
  var canvas = new Canvas(canvasElement.getContext("2d"));
  var boundingBox = diagram.getBoundingBox(canvas);

  // Initialize new canvas
  // Expandir el boundingBox para asegurar que se incluya todo el diagrama
  boundingBox.expand(BOUNDING_BOX_EXPAND);
  // Ajustar el origen del canvas para no recortar el diagrama
  canvas.origin = new Point(-boundingBox.x1, -boundingBox.y1);
  canvas.zoomFactor = new ZoomFactor(1, 1);
  canvas.context.imageSmoothingEnabled = true;
  canvas.context.imageSmoothingQuality = 'high';
  canvas.context.textRenderingOptimization = 'optimizeQuality';
  // Aquí calculamos el tamaño real del canvas antes de aplicar la relación de píxeles
  canvasElement.width = boundingBox.getWidth(); // Anchura real
  canvasElement.height = boundingBox.getHeight(); // Altura real

  // Configuración para pantallas de alta DPI (Retina) - configuración exacta de v6.2.2
  if (window.devicePixelRatio) {
    var ratio = window.devicePixelRatio * 4; // Ajustar el ratio para alta calidad
    canvasElement.width *= ratio;  // Aumentar la anchura según el ratio
    canvasElement.height *= ratio; // Aumentar la altura según el ratio
    canvas.context.scale(ratio, ratio);  // Escalar el contexto del canvas
  }

  // Dibujar un fondo blanco solo para JPEG (para evitar el fondo transparente)
  if (type === "image/jpeg") {
    canvas.context.fillStyle = "#ffffff";
    canvas.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  // REMOVED: All watermark drawing code - no watermarks will be applied
  // const licenseStatus = app.licenseStore.getLicenseStatus();
  // Draw watermark if application is not registered
  // if (licenseStatus.trial) {
  //   diagram.drawWatermark(
  //     canvas,
  //     canvasElement.width,
  //     canvasElement.height,
  //     70,
  //     12,
  //     "UNREGISTERED",
  //   );
  // } else if (licenseStatus.edition !== "PRO") {
  //   const dgmType = diagram.constructor.name;
  //   if (isProDiagram(dgmType)) {
  //     diagram.drawWatermark(
  //       canvas,
  //       canvasElement.width,
  //       canvasElement.height,
  //       45,
  //       12,
  //       "PRO ONLY",
  //     );
  //   }
  // }

  // Dibujar el diagrama en el nuevo canvas
  diagram.arrangeDiagram(canvas);
  diagram.drawDiagram(canvas);

  // Devolver los datos del canvas en base64 con máxima calidad
  var data = canvasElement.toDataURL(type, 1.0).replace(/^data:image\/(png|jpeg);base64,/, "");
  return data;
}

/**
 * @private
 * Get SVG image data of editor.diagram
 * @param {Diagram} diagram
 * @return {string}
 */
function getSVGImageData(diagram) {
  const boundingBox = diagram.getBoundingBox(canvas);
  boundingBox.expand(BOUNDING_BOX_EXPAND);
  const w = boundingBox.getWidth();
  const h = boundingBox.getHeight();

  // Make a new SVG canvas for making SVG image data
  var ctx = new Context(w, h);
  var canvas = new SVGCanvas(ctx);

  // Initialize new SVG Canvas - configuración exacta de v6.2.2
  canvas.origin = new Point(-boundingBox.x1, -boundingBox.y1);
  canvas.zoomFactor = new ZoomFactor(2, 2);  // Aplicamos un zoom adicional para mayor calidad

  // REMOVED: All watermark drawing code - no watermarks will be applied
  // const licenseStatus = app.licenseStore.getLicenseStatus();
  // Draw watermark if application is not registered
  // if (licenseStatus.trial) {
  //   diagram.drawWatermark(
  //     canvas,
  //     boundingBox.getWidth(),
  //     boundingBox.getHeight(),
  //     70,
  //     12,
  //     "UNREGISTERED",
  //   );
  // } else if (licenseStatus.edition !== "PRO") {
  //   const dgmType = diagram.constructor.name;
  //   if (isProDiagram(dgmType)) {
  //     diagram.drawWatermark(
  //       canvas,
  //       boundingBox.getWidth(),
  //       boundingBox.getHeight(),
  //       45,
  //       12,
  //       "PRO ONLY",
  //     );
  //   }
  // }

  // Draw diagram to the new SVG Canvas
  diagram.arrangeDiagram(canvas);
  diagram.drawDiagram(canvas);

  // Return the SVG data
  var data = ctx.getSerializedSvg(true);
  return data;
}

/**
 * @private
 * Export Diagram as PNG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToPNG(diagram, fullPath) {
  diagram.deselectAll();
  var data = getImageData(diagram, "image/png");
  var buffer = Buffer.from(data, "base64");
  fs.writeFileSync(fullPath, buffer);
}

/**
 * @private
 * Export Diagram as JPEG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToJPEG(diagram, fullPath) {
  diagram.deselectAll();
  var data = getImageData(diagram, "image/jpeg");
  var buffer = Buffer.from(data, "base64");
  fs.writeFileSync(fullPath, buffer);
}

/**
 * @private
 * Export Diagram as SVG
 *
 * @param {Diagram} diagram
 * @param {string} fullPath
 */
function exportToSVG(diagram, fullPath) {
  diagram.deselectAll();
  var data = getSVGImageData(diagram);
  fs.writeFileSync(fullPath, data, "utf8");
}

/**
 * @private
 * Export a list of diagrams
 *
 * @param {string} format One of `png`, `jpg`, `svg`.
 * @param {Array<Diagram>} diagrams
 * @param {string} basePath
 */
function exportAll(format, diagrams, basePath) {
  if (diagrams && diagrams.length > 0) {
    const path = basePath + "/" + format;
    fs.ensureDirSync(path);
    diagrams.forEach((diagram, idx) => {
      var fn =
        path +
        "/" +
        filenamify(diagram.getPathname()) +
        "_" +
        idx +
        "." +
        format;
      switch (format) {
        case "png":
          return exportToPNG(diagram, fn);
        case "jpg":
          return exportToJPEG(diagram, fn);
        case "svg":
          return exportToSVG(diagram, fn);
      }
    });
  }
}

function drawWatermarkPDF(doc, xstep, ystep, text) {
  // REMOVED: Watermark function - now does nothing
  // doc.font("Helvetica");
  // doc.fontSize(8);
  // doc.fillColor("#eeeeee");
  // for (var i = 0, wx = doc.page.width; i < wx; i += xstep) {
  //   for (var j = 0, wy = doc.page.height; j < wy; j += ystep) {
  //     doc.text(text, i, j, { lineBreak: false });
  //   }
  // }
}

/**
 * @private
 * Export diagrams to a PDF file
 * @param{Array<Diagram>} diagrams
 * @param{string} fullPath
 * @param{Object} options
 */
function exportToPDF(diagrams, fullPath, options) {
  var doc = new PDFDocument(options);
  // eslint-disable-next-line guard-for-in
  for (let name in app.fontManager.files) {
    const path = app.fontManager.files[name];
    doc.registerFont(name, path);
  }
  doc.pipe(fs.createWriteStream(fullPath));
  var i, len;
  for (i = 0, len = diagrams.length; i < len; i++) {
    var canvas = new PDFCanvas(doc);
    if (i > 0) {
      doc.addPage(options);
    }
    var diagram = diagrams[i];
    var box = diagram.getBoundingBox(canvas);
    var w = doc.page.width - PDF_MARGIN * 2;
    var h = doc.page.height - PDF_MARGIN * 2;
    var zoom = Math.min(w / box.x2, h / box.y2);
    canvas.baseOrigin.x = PDF_MARGIN;
    canvas.baseOrigin.y = PDF_MARGIN;
    canvas.baseScale = Math.min(zoom, PDF_DEFAULT_ZOOM);

    // REMOVED: All watermark drawing code for PDF - no watermarks will be applied
    // Draw watermark if application is not registered
    // const licenseStatus = app.licenseStore.getLicenseStatus();
    // if (licenseStatus.trial) {
    //   drawWatermarkPDF(doc, 70, 12, "UNREGISTERED");
    // } else if (licenseStatus.edition !== "PRO") {
    //   const dgmType = diagram.constructor.name;
    //   if (isProDiagram(dgmType)) {
    //     drawWatermarkPDF(doc, 45, 12, "PRO ONLY");
    //   }
    // }

    diagram.arrangeDiagram(canvas);
    diagram.drawDiagram(canvas, false);

    if (options.showName) {
      doc.fontSize(10);
      doc.font("Helvetica");
      canvas.textOut(0, -10, diagram.getPathname());
    }
  }
  doc.end();
}

exports.getImageData = getImageData;
exports.getSVGImageData = getSVGImageData;
exports.exportToPNG = exportToPNG;
exports.exportToJPEG = exportToJPEG;
exports.exportToSVG = exportToSVG;
exports.exportAll = exportAll;
exports.exportToPDF = exportToPDF;