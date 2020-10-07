const Renderer = require('./Renderer.js');
const TextRenderer = require('./TextRenderer.js');
const Slugger = require('./Slugger.js');
const { defaults } = require('./defaults.js');
const {
  unescape
} = require('./helpers.js');

/**
 * Parsing & Compiling
 */
module.exports = class Parser {
  constructor(options) {
    this.options = options || defaults;
    this.options.renderer = this.options.renderer || new Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.textRenderer = new TextRenderer();
    this.slugger = new Slugger();
  }

  /**
   * Static Parse Method
   */
  static async parse(tokens, options) {
    const parser = new Parser(options);
    return await parser.parse(tokens);
  }

  /**
   * Parse Loop
   */
  async parse(tokens, top = true) {
    let out = '',
      i,
      j,
      k,
      l2,
      l3,
      row,
      cell,
      header,
      body,
      token,
      ordered,
      start,
      loose,
      itemBody,
      item,
      checked,
      task,
      checkbox;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];
      switch (token.type) {
        case 'space': {
          continue;
        }
        case 'hr': {
          out += await this.renderer.hr();
          continue;
        }
        case 'heading': {
          out += await this.renderer.heading(
            await this.parseInline(token.tokens),
            token.depth,
            unescape(await this.parseInline(token.tokens, this.textRenderer)),
            this.slugger);
          continue;
        }
        case 'code': {
          out += await this.renderer.code(token.text,
            token.lang,
            token.escaped);
          continue;
        }
        case 'table': {
          header = '';

          // header
          cell = '';
          l2 = token.header.length;
          for (j = 0; j < l2; j++) {
            cell += await this.renderer.tablecell(
              await this.parseInline(token.tokens.header[j]),
              { header: true, align: token.align[j] }
            );
          }
          header += await this.renderer.tablerow(cell);

          body = '';
          l2 = token.cells.length;
          for (j = 0; j < l2; j++) {
            row = token.tokens.cells[j];

            cell = '';
            l3 = row.length;
            for (k = 0; k < l3; k++) {
              cell += await this.renderer.tablecell(
                await this.parseInline(row[k]),
                { header: false, align: token.align[k] }
              );
            }

            body += await this.renderer.tablerow(cell);
          }
          out += await this.renderer.table(header, body);
          continue;
        }
        case 'blockquote': {
          body = await this.parse(token.tokens);
          out += await this.renderer.blockquote(body);
          continue;
        }
        case 'list': {
          ordered = token.ordered;
          start = token.start;
          loose = token.loose;
          l2 = token.items.length;

          body = '';
          for (j = 0; j < l2; j++) {
            item = token.items[j];
            checked = item.checked;
            task = item.task;

            itemBody = '';
            if (item.task) {
              checkbox = await this.renderer.checkbox(checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                  item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                  if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                    item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: 'text',
                    text: checkbox
                  });
                }
              } else {
                itemBody += checkbox;
              }
            }

            itemBody += await this.parse(item.tokens, loose);
            body += await this.renderer.listitem(itemBody, task, checked);
          }

          out += await this.renderer.list(body, ordered, start);
          continue;
        }
        case 'html': {
          // TODO parse inline content if parameter markdown=1
          out += await this.renderer.html(token.text);
          continue;
        }
        case 'paragraph': {
          out += await this.renderer.paragraph(await this.parseInline(token.tokens));
          continue;
        }
        case 'text': {
          body = token.tokens ? await this.parseInline(token.tokens) : token.text;
          while (i + 1 < l && tokens[i + 1].type === 'text') {
            token = tokens[++i];
            body += '\n' + (token.tokens ? await this.parseInline(token.tokens) : token.text);
          }
          out += top ? await this.renderer.paragraph(body) : body;
          continue;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }

    return out;
  }

  /**
   * Parse Inline Tokens
   */
  async parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = '',
      i,
      token;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];
      switch (token.type) {
        case 'escape': {
          out += await renderer.text(token.text);
          break;
        }
        case 'html': {
          out += await renderer.html(token.text);
          break;
        }
        case 'link': {
          out += await renderer.link(token.href, token.title, await this.parseInline(token.tokens, renderer));
          break;
        }
        case 'image': {
          out += await renderer.image(token.href, token.title, token.text);
          break;
        }
        case 'strong': {
          out += await renderer.strong(await this.parseInline(token.tokens, renderer));
          break;
        }
        case 'em': {
          out += await renderer.em(await this.parseInline(token.tokens, renderer));
          break;
        }
        case 'codespan': {
          out += await renderer.codespan(token.text);
          break;
        }
        case 'br': {
          out += await renderer.br();
          break;
        }
        case 'del': {
          out += await renderer.del(await this.parseInline(token.tokens, renderer));
          break;
        }
        case 'text': {
          out += await renderer.text(token.text);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
};
