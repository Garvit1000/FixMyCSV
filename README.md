# FixMyCSV

FixMyCSV is a modern web tool to upload, analyze, and transform your **CSV, TSV, or JSON** datasets with professional-grade tools.  
It provides instant previews, smart transformations, and visualizations so you can clean and understand your data faster.

---

## 🚀 Features

- 📂 Upload **CSV, TSV, or JSON** files  
- 📊 Interactive charts & statistics  
- 🔍 Smart column detection and filtering  
- ⚡ Drag-and-drop file upload  
- 🛠️ Built with **React + Tailwind + shadcn/ui** for a modern, polished UI  
- 🌐 Ready to deploy on **Vercel** or any static hosting  

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Garvit1000/FixMyCSV.git
cd FixMyCSV
npm install --legacy-peer-deps
```

 🖥️ Development


Start the development server:
```bash
npm run dev
```

Then open http://localhost:3000
 in your browser.
 
📦 Build (production)
Create a production build:
```bash
npm run build
```
Preview the production build locally (if you have a preview script):
```bash
npm run preview
```

Deployment: Works well on Vercel / Netlify / static hosts. If deploying to Vercel, ensure your build command matches npm run build and the output directory is build/ (default for CRA/CRACO).

Usage examples (short)

Quick clean marketing leads
Upload leads.csv.
Map fb, FB, facebook-paid → Facebook.
Dedupe by email (keep most recent).
Export cleaned CSV.

Split & normalize
Upload users.csv.
Split FullName by first space → FirstName, LastName.
Trim whitespace and standardize casing.
Export JSON or CSV
.
 🛠️ Tech Stack

React (v19)

Tailwind CSS

shadcn/ui components

PapaParse (CSV parsing)

Chart.js + react-chartjs-2 (charts)

Dexie (IndexedDB) for local saves 

Web Workers for heavy parsing/dedupe tasks

🤝 Contributing

Contributions are welcome!
Please open an issue or submit a pull request.
```bash
git checkout -b feat/your-feature
npm install --legacy-peer-deps
npm run dev
```
# implement changes, run tests, then:
```bash
git commit -am "feat: add ..."
git push origin feat/your-feature
```
