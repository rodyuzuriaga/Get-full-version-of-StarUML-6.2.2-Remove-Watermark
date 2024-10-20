# StarUML Full License & Exporting Diagrams in High Resolution

This guide will walk you through how to license StarUML and export diagrams without watermarks in high resolution. Follow each step carefully to ensure success.

<img src="https://64.media.tumblr.com/13d2c753eed929097cc13bbb1d3e482c/67441800327766fc-96/s1920x1080/fe67f6e7feaaf682aa84cd0280cbb4eed24e9dea.gif" alt="MAY YOU ENJOY IT" style="width:100%;">

---

## 1. Install StarUML
Download the latest version of StarUML from the [official website](https://staruml.io/download).

---

## 2. Install `asar`
Next, install `asar`, a utility to manage `.asar` files. Open your terminal as an administrator and run the following command:

```bash
npm i asar -g
```
> [!IMPORTANT]
> Make sure to have the **LTS** version of Node.js installed to ensure compatibility and avoid errors when running `npm` commands. You can download the LTS version from [nodejs.org](https://nodejs.org/).

This will install `asar` globally.

---

## 3. Extract `app.asar`
To access the files needed to modify the license and export settings, extract the `app.asar` file.

Navigate to the StarUML directory. By default, it’s located at:

- **Windows**: `C:/Program Files/StarUML/resources`
- **MacOS**: `/Applications/StarUML.app/Contents/Resources`
- **Linux**: `/opt/staruml/resources`

You can use the `cd` command to navigate to your specific directory. For example:

```bash
cd "C:/Program Files/StarUML/resources"
```

Run the following command in your terminal as an Administrator (Git Bash, PowerShell, or CMD):

```bash
asar e app.asar app
```

This will extract the `app.asar` file into a folder called `app`.

---

## 4. Modify the License Manager

In the extracted files, navigate to the following path:

```
Program Files/StarUML/resources/app/src/engine/license-manager.js
```

Open the `license-manager.js` file in your preferred code editor and paste this modified license manager code here.

```js
const { EventEmitter } = require("events"); 
const fs = require("fs"); 
const path = require("path"); 
const crypto = require("crypto"); 
const UnregisteredDialog = require("../dialogs/unregistered-dialog"); 
const packageJSON = require("../../package.json");

const SK = "DF9B72CC966FBE3A46F99858C5AEE";

// Check License When File Save 
const LICENSE_CHECK_PROBABILITY = 0.3;

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

var status = false; 
var licenseInfo = null;

/**
Set Registration Status
This function is out of LicenseManager class for the security reason
(To disable changing License status by API)
@private
@param {boolean} newStat
@return {string} 
*/ 
function setStatus(licenseManager, newStat) { 
    if (status !== newStat) { 
        status = newStat; 
        licenseManager.emit("statusChanged", status); 
    } 
}

/**
@private 
*/ 
class LicenseManager extends EventEmitter { 
    constructor() { 
        super(); 
        this.projectManager = null; 
    }

    isProDiagram(diagramType) { 
        return PRO_DIAGRAM_TYPES.includes(diagramType); 
    }

    /**
    Get Registration Status
    @return {string} 
    */ 
    getStatus() { 
        return status; 
    }

    /**
    Get License Infomation
    @return {Object} 
    */ 
    getLicenseInfo() { 
        return licenseInfo; 
    }

    findLicense() { 
        var licensePath = path.join(app.getUserPath(), "/license.key"); 
        if (!fs.existsSync(licensePath)) { 
            licensePath = path.join(app.getAppPath(), "../license.key"); 
        } 
        if (fs.existsSync(licensePath)) { 
            return licensePath; 
        } else { 
            return null; 
        } 
    }

    /**
    Check license validity
    @return {Promise} 
    */ 
    validate() { 
        return new Promise((resolve, reject) => { 
            try { 
                // Local check 
                var file = this.findLicense(); 
                if (!file) { 
                    reject("License key not found"); 
                } else { 
                    var data = fs.readFileSync(file, "utf8"); 
                    licenseInfo = JSON.parse(data); 
                    if (licenseInfo.product !== packageJSON.config.product_id) { 
                        app.toast.error(`License key is for old version (${licenseInfo.product})`); 
                        reject(`License key is not for ${packageJSON.config.product_id}`); 
                    } else { 
                        var base = SK + licenseInfo.name + SK + licenseInfo.product + "-" + licenseInfo.licenseType + SK + licenseInfo.quantity + SK + licenseInfo.timestamp + SK; 
                        var _key = crypto.createHash("sha1").update(base).digest("hex").toUpperCase(); 
                        if (_key !== licenseInfo.licenseKey) { 
                            reject("Invalid license key"); 
                        } else { 
                            // Server check 
                            $.post(app.config.validation_url, { licenseKey: licenseInfo.licenseKey, }) 
                                .done((data1) => { 
                                    resolve(data1); 
                                }) 
                                .fail((err) => { 
                                    if (err && err.status === 499) { 
                                        /* License key not exists */ 
                                        reject(err); 
                                    } else { 
                                        // If server is not available, assume that license key is valid 
                                        resolve(licenseInfo); 
                                    } 
                                }); 
                        } 
                    } 
                } 
            } catch (err) { 
                reject(err); 
            } 
        }); 
    }

    /**
    Return evaluation period status
    @private
    @return {number} Remaining days 
    */ 
    checkEvaluationPeriod() { 
        const file = path.join(window.app.getUserPath(), "lib.so"); 
        if (!fs.existsSync(file)) { 
            const timestamp = Date.now(); 
            fs.writeFileSync(file, timestamp.toString()); 
        } 
        try { 
            const timestamp = parseInt(fs.readFileSync(file, "utf8")); 
            const now = Date.now(); 
            const remains = 30 - Math.floor((now - timestamp) / (1000 * 60 * 60 * 24)); 
            return remains; 
        } catch (err) { 
            console.error(err); 
        } 
        return -1; // expired 
    }

    async checkLicenseValidity() { 
        // Instead of validating the license, always set status to true
        setStatus(this, true); 
    }

    /**
    Check the license key in server and store it as license.key file in local
    @param {string} licenseKey 
    */ 
    register(licenseKey) { 
        return new Promise((resolve, reject) => { 
            $.post(app.config.validation_url, { licenseKey: licenseKey }) 
                .done((data) => { 
                    if (data.product === packageJSON.config.product_id) { 
                        var file = path.join(app.getUserPath(), "/license.key"); 
                        fs.writeFileSync(file, JSON.stringify(data, 2)); 
                        licenseInfo = data; 
                        setStatus(this, true); 
                        resolve(data); 
                    } else { 
                        setStatus(this, false); 
                        reject("unmatched"); /* License is for old version */ 
                    } 
                }) 
                .fail((err) => { 
                    setStatus(this, false); 
                    if (err.status === 499) { 
                        /* License key not exists */ 
                        reject("invalid"); 
                    } else { 
                        reject(); 
                    } 
                }); 
        }); 
    }

    htmlReady() {}

    appReady() { 
        this.checkLicenseValidity(); 
    } 
}

module.exports = LicenseManager;
```

---
## 5. Exporting Diagrams in High Resolution (Without Watermarks)

To export diagrams in high resolution without watermarks, locate and modify the following file:

```
Program Files/StarUML/resources/app/src/diagram-export.js
```

Open the `diagram-export.js` file and replace the export code with this high-resolution export logic:

```js
const fs = require("fs-extra");
const filenamify = require("filenamify");
const PDFDocument = require("pdfkit");
const { Point, ZoomFactor, Canvas } = require("../core/graphics");
const { PDFCanvas } = require("./pdf-graphics");
const { Context } = require("svgcanvas");

const BOUNDING_BOX_EXPAND = 10;

const PDF_MARGIN = 30;
const PDF_DEFAULT_ZOOM = 1; // Default Zoom Level

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
  // Aquí calculamos el tamaño real del canvas antes de aplicar la relación de píxeles
  canvasElement.width = boundingBox.getWidth(); // Anchura real
  canvasElement.height = boundingBox.getHeight(); // Altura real

  // Configuración para pantallas de alta DPI (Retina)
  if (window.devicePixelRatio) {
    var ratio = window.devicePixelRatio * 2; // Ajustar el ratio para alta calidad
    canvasElement.width *= ratio;  // Aumentar la anchura según el ratio
    canvasElement.height *= ratio; // Aumentar la altura según el ratio
    canvas.context.scale(ratio, ratio);  // Escalar el contexto del canvas
  }

  // Dibujar un fondo blanco solo para JPEG (para evitar el fondo transparente)
  if (type === "image/jpeg") {
    canvas.context.fillStyle = "#ffffff";
    canvas.context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  }

  // Dibujar el diagrama en el nuevo canvas
  diagram.arrangeDiagram(canvas);
  diagram.drawDiagram(canvas);

  // Devolver los datos del canvas en base64
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
  var canvas = new Canvas(ctx);

  // Initialize new SVG Canvas
  canvas.origin = new Point(-boundingBox.x1, -boundingBox.y1);
  canvas.zoomFactor = new ZoomFactor(2, 2);  // Aplicamos un zoom adicional para mayor calidad

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
  doc.font("Helvetica");
  doc.fontSize(8);
  doc.fillColor("#eeeeee");
  for (var i = 0, wx = doc.page.width; i < wx; i += xstep) {
    for (var j = 0, wy = doc.page.height; j < wy; j += ystep) {
      doc.text(text, i, j, { lineBreak: false });
    }
  }
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
  for (var name in app.fontManager.files) {
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
```

---

## 6. Repack `app.asar`

Once you have edited the necessary files, you need to repack the `app.asar` file. Navigate back to the `resources` directory and run the following command:

```bash
asar pack app app.asar
```

This will repack your modified `app` folder back into a `.asar` file.

---

## 7. Clean Up

After repacking the `app.asar`, you can safely remove the extracted `app` folder to clean up your directory.

### Remove the app folder:

- **For Windows:**
   ```bash
   rmdir /s /q app
   ```

- **For Linux or Mac:**
   ```bash
   rm -rf app
   ```

---

## 8. Launch StarUML

Now that everything is set up, launch StarUML by running the `StarUML.exe` file from your installation directory or through the desktop shortcut.

---

## Enjoy!

Congratulations! You now have StarUML fully licensed and can export diagrams in high resolution without watermarks.

> [!NOTE]
> This guide applies to StarUML version 6.2.2. Ensure you are using the correct version for compatibility.
