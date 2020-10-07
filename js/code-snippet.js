class CodeSnippet extends HTMLElement {

  static get observedAttributes() {return ["lang","src","lines"]}

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.pre = document.createElement('pre');
    // this.pre.style.borderRadius = ".3rem";
    // this.pre.style.padding = "1rem";
    hljs.highlightBlock(this.pre);
    this.errorBox = document.createElement('div');
    this.errorBox.classList.add('error');
    this.errorBox.hidden = true;
    this.value = "";
    this.src = "";
    this.shadowRoot.appendChild(this.pre);
    this.shadowRoot.appendChild(this.errorBox);
    let link = document.createElement('link')
    link.setAttribute('rel', 'stylesheet')
    link.setAttribute('href', '//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.0/styles/atom-one-dark.min.css')
    this.shadowRoot.prepend(link)
    let link2 = document.createElement('link')
    link2.setAttribute('rel', 'stylesheet')
    link2.setAttribute('href', '/css/code-snippet.css')
    this.shadowRoot.prepend(link2)
  }

  connectedCallback() {
    // this.src = this.getAttribute('src');
    // this.loadSrc(this.src);

  }

  async loadSrc(src) {
    try {
      let code = await CodeSnippet.fetchAndCacheScript(src);
      code = code.split(/\r?\n/g).filter((_,i)=>this.lines.has(i+1)).join('\n')
      this.value = code;
      this.pre.textContent = code;
      hljs.highlightBlock(this.pre);
      this.pre.hidden = false;
      this.errorBox.hidden = true;
    } catch (e) {
      this.pre.hidden = true;
      this.errorBox.hidden = false;
      this.errorBox.innerText = "There was an error while trying to load this snippet." + e.stack;
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    switch (name) {
      case 'src':
        this.loadSrc(newVal);
        break;
      case 'lang':
        this.pre.className = newVal;
        break;
      case 'lines':
        this.lines = CodeSnippet.convertLineRanges(newVal);
        break;
      default:

    }
  }

  static validateAndURLifySrc(src) {
    let url = new URL(src, location.href);
    if (url.origin !== location.origin) return false;
    return url;
  }

  static async fetchAndCacheScript(src) {
    let url = CodeSnippet.validateAndURLifySrc(src);
    if (url) {
      if (CodeSnippet.cachedScripts.has(url.toString())) return CodeSnippet.cachedScripts.get(url.toString())
      let response = await fetch(url);
      if (response.ok) {
        let text = await response.text();
        CodeSnippet.cachedScripts.set(url.toString(), text);
        return text;
      } else {
        throw new InvalidURLError(url, "Could not fetch resource.", response);
      }
    } else {
      throw new InvalidURLError(src, "Sources for code snippets must be from the same domain as the page.")
    }
  }

  static convertLineRanges(ranges) {
    if (!/^(?:\d+(?:-\d+)?(?: |$))+$/.test(ranges)) throw new Error("The provided ranges must be either a single number or a range of numbers specified like this '1-10'. You can have multiple of these ranges separated by a space.")

    //This will give us a list of the ranges.
    let rangeList = ranges.split(/ +/g) // this just separates on spaces but ignores double spaces.
    let dedupedRangeList = new Set(); // A Set is like a list but it doesn't allow for duplicates. (It ignores them)
    //We can now verify that the ranges specified are valid and do some logic to join together overlapping ranges.
    for (let range of rangeList) {
      let [a, b = null] = range.split('-').map(x=>parseInt(x));
      if (a < 0) throw new Error("Line numbers must be positive.")
      if (b == null) {
        //We have just a single number. The only check we need to make is that its positive.
        dedupedRangeList.add(parseInt(a));
      } else {
        //We are dealing with a proper range e.g. 10-30.
        console.log(`a: ${a}, b: ${b}`);
        if (b <= a) throw new Error("Ranges of line numbers must be specified with the first number being smaller than the second. If you want to specify a single line then just add it's number like '10'.")
        //Note: We don't need to check b for being positive as we know b is bigger than a and we know a is positive so we know b is too.
        //Now we generate all the LED positions between a and b.
        for (let i = Number(a); i <= Number(b); i ++) {
          //And add them to our list;
          dedupedRangeList.add(parseInt(i));
        }
      }
    }
    return dedupedRangeList
  }
}

class InvalidURLError extends Error {
  constructor(url, reason, response = null) {
    super(`The specified URL (${url}) was invalid. Reason: ${reason}.`);
    this.response = response;
  }
}

CodeSnippet.cachedScripts = new Map()

// CodeSnippet.templateString = `<><>`

customElements.define('code-snippet', CodeSnippet);
