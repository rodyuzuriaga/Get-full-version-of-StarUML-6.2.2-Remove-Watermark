# StarUML v7.0.0 Full License & Exporting Diagrams in High Resolution

This guide will walk you through how to license StarUML v7.0.0 and export diagrams without watermarks in high resolution. Follow each step carefully to ensure success.

<img src="https://64.media.tumblr.com/13d2c753eed929097cc13bbb1d3e482c/67441800327766fc-96/s1920x1080/fe67f6e7feaaf682aa84cd0280cbb4eed24e9dea.gif" alt="MAY YOU ENJOY IT" style="width:100%;">

---

## 🚀 What's New in v7.0.0

StarUML v7.0.0 introduced a new license system with enhanced security measures, but we've got you covered! This updated method ensures you get the full PRO features without any limitations.

---

## 1. Install StarUML v7.0.0
Download the latest version of StarUML v7.0.0 from the [official website](https://staruml.io/download).

---

## 2. Install `asar`
Install `asar`, a utility to manage `.asar` files. Open your terminal as an administrator and run the following command:

```bash
npm i asar -g
```
> [!IMPORTANT]
> Make sure to have the **LTS** version of Node.js installed to ensure compatibility and avoid errors when running `npm` commands. You can download the LTS version from [nodejs.org](https://nodejs.org/).

This will install `asar` globally.

---

## 3. Extract `app.asar`
To access the files needed to modify the license and export settings, extract the `app.asar` file.

Navigate to the StarUML directory. By default, it's located at:

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

## 4. Copy Modified Files

Instead of manually editing files, simply copy the pre-modified files from this repository to your extracted StarUML folder.

### Copy the modified files:

1. Navigate to the `app` folder you just extracted
2. Copy the `license-store.js` file from this repository to:
   ```
   app/src/engine/license-store.js
   ```

3. Copy the `diagram-export.js` file from this repository to:
   ```
   app/src/engine/diagram-export.js
   ```

4. Copy the `license-activation-dialog.js` file from this repository to:
   ```
   app/src/dialogs/license-activation-dialog.js
   ```

### File locations:
- **License file**: `app/src/engine/license-store.js`
- **Export file**: `app/src/engine/diagram-export.js`  
- **Dialog file**: `app/src/dialogs/license-activation-dialog.js`

> [!TIP]
> Simply replace the existing files with the ones provided in this repository. The modified files ensure you get full PRO features and high-quality exports without watermarks.

---

## 5. What These Files Do

### 🔑 `license-store.js` - Full License Activation
- **Always returns PRO license status**: The app will always think you have a valid PRO license
- **Removes trial limitations**: No more 30-day trial restrictions
- **Unlimited features**: Access to all PRO diagram types and features
- **No license validation**: Bypasses all license checking mechanisms

### 🎨 `diagram-export.js` - High-Quality Exports
- **No watermarks**: Completely removes "UNREGISTERED" and "PRO ONLY" watermarks
- **Enhanced image quality**: Uses the exact same high-quality configuration from v6.2.2
- **Full workspace capture**: Captures the complete diagram workspace without cropping
- **Maximum quality**: All exports use the highest quality settings (quality: 1.0)
- **Support for all formats**: PNG, JPEG, SVG, and PDF exports without limitations

### 💬 `license-activation-dialog.js` - Dialog Modifications
- **Always shows activated**: License dialog always displays PRO status
- **Prevents deactivation**: Blocks any attempts to deactivate the license
- **No readonly mode**: Ensures full editing capabilities are always available
- **Seamless experience**: User interface reflects full PRO license status

---

## 6. Repack `app.asar`

Once you have copied the modified files, you need to repack the `app.asar` file. Navigate back to the `resources` directory and run the following command:

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

## ✨ Features You'll Get

With these modifications, you'll have access to:

- ✅ **Full PRO License**: All features unlocked
- ✅ **All Diagram Types**: Including SysML, BPMN, Wireframes, AWS, GCP diagrams
- ✅ **High-Resolution Exports**: Crystal clear PNG, JPEG exports
- ✅ **Watermark-Free**: Clean exports without any watermarks
- ✅ **PDF Export**: Professional PDF exports without limitations
- ✅ **SVG Export**: Vector graphics with enhanced quality
- ✅ **No Trial Restrictions**: Unlimited usage time

---

## 🎯 Enjoy!

Congratulations! You now have StarUML v7.0.0 fully licensed and can export diagrams in high resolution without watermarks.

> [!NOTE]
> This guide applies specifically to StarUML version 7.0.0. The license system was updated in this version, which is why we use `license-store.js` instead of the previous `license-manager.js`.

> [!WARNING]
> This modification is for educational and personal use only. Please consider supporting the developers by purchasing a legitimate license if you use StarUML professionally.

---

## 📋 File Structure

Your repository should look like this:
```
Get-full-version-of-StarUML-7.0.0-Pro-Remove-Watermark/
├── README.md
└── app/
    └── src/
        ├── engine/
        │   ├── license-store.js
        │   └── diagram-export.js
        └── dialogs/
            └── license-activation-dialog.js
```

---

## 🔧 Troubleshooting

If you encounter any issues:

1. **Make sure you're running terminal as Administrator**
2. **Verify Node.js and asar are properly installed**
3. **Ensure you're in the correct directory when running commands**
4. **Check that the file paths match exactly**
5. **Restart StarUML completely after making changes**

---

Made with ❤️ for the StarUML community