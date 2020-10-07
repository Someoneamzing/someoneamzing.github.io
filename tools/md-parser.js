const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const uuid = require('uuid').v4;

const marked = require('../js/marked/marked.js')
const Slugger = require('slugger-unique');
const slugger = new Slugger();

let [inputPath, outputPath, outputName] = process.argv.slice(2);

const ABSOLUTE_URL = /^(?:[a-z]+:)?\/\//i;

let outputs = new Map();
let images = new Map();

marked.use({renderer: {
  code(code, infoString, escaped) {
    let lines = code.split(/\r?\n/g).length;
    let scriptOutputName = `${outputName}-${infoString!==""?infoString:"output"}-scripts.txt`;
    if (!outputs.has(scriptOutputName)) outputs.set(scriptOutputName, {contents: "", currentLine: 1})
    let output = outputs.get(scriptOutputName)
    output.contents += code + "\n\n";
    let range = lines > 1 ? `${output.currentLine}-${output.currentLine + lines}` : output.currentLine;
    output.currentLine += lines + 1;
    return `<code-snippet src="<% project.base_url %>/assets/${scriptOutputName}" lang="${infoString!==""?infoString:"plaintext"}" lines="${range}"></code-snippet>\n`
  },
  async image(href, title, text) {
    if (!ABSOLUTE_URL.test(href)) {
      href = path.resolve(path.dirname(inputPath), href);
      if (!images.has(href)) {
        images.set(href, `assets/images/${slugger.slug(path.basename(href).replace(/\.[^\.]+$/, ""))}${path.extname(href)}`)
        fs.copyFile(href, path.join(outputPath, images.get(href)), (err)=>{
          if (err) throw new Error(err)
        })
      }
      return `<img src="<% project.base_url %>/${images.get(href)}" alt="${text}" title="${title}" />`
    } else {
      let response = await fetch(href);
      if (response.headers.get('content-type').indexOf('image/svg') !== -1) {
        let svgContent = await response.text();
        return svgContent.replace('<svg', '<svg class="svg-image"');
      }
    }
    return `<img src="${href}" title="${title}" alt="${text}" />`
  }
}})

fs.readFile(inputPath, 'utf-8', async (err, data)=>{
  if (err) throw new Error(err);
  fs.mkdirSync(path.join(outputPath, 'assets', 'images'), {recursive: true})
  fs.writeFile(path.join(outputPath, outputName + ".html"), await marked(data), {encoding: 'utf-8', flag: "w"}, (err)=>{
    if (err) throw new Error(err);
  })
  for (let file of outputs.keys()) {
    let output = outputs.get(file);
    fs.writeFile(path.join(outputPath, 'assets', file), output.contents, {encoding: 'utf-8', flag: "w"}, (err)=>{
      if (err) throw new Error(err);
    })
  }
})
