import { stat } from 'fs/promises';
import path from 'path';

// TODO: rewriter refactor
class BodyHandler {
  element(element: HTMLRewriterTypes.Element) {
    // i am normal and can be trusted with injecting javascript
    element.append(`<script type="module" src="/__totebag/totebag.mjs"></script>`, { html: true });
  }
}
const rewriter = new HTMLRewriter().on('body', new BodyHandler());

export async function fileHandler(filepath: string) {
  try {
    // stat the file
    const filestat = await stat(filepath);

    // it's a file
    if (filestat.isFile()) {
      const file = Bun.file(filepath);

      // if it's html: rewrite it to include totebag.mjs
      // TODO: NOT NECESSARILY UNICODE LMAO
      if (path.extname(filepath) === ".html" || path.extname(filepath) === ".htm") {
        const content = await file.text();
        return new Response(rewriter.transform(content), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }

      // otherwise, return as is
      return new Response(file);
    }

    // it's a directory
    if (filestat.isDirectory()) {
      // if index.html: serve index.html
      const indexstat = await stat(path.join(filepath, "index.html"));
      if (indexstat.isFile()) {
        return fileHandler(path.join(filepath, "index.html"))
      }

      // serve directory handler
      return new Response("this is a directory and idk how to do this yet")
    }
  } catch (err) {
    if (Object.prototype.hasOwnProperty.call(err, "code")) {
      const code = (err as { "code": string }).code;
      if (code === "ENOENT") {
        console.log("404")
        return new Response("404'd!", { status: 404 })
      }
    }
  } return new Response("500'd!", { status: 500 })
}
