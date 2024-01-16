import minimist from 'minimist';
import {
  watch
} from 'fs';
import { stat } from 'fs/promises'
import path from 'path';
import { fileHandler } from './src/handlers';


class ReplacerHandler {
  constructor(replace: string) {
    this.replace = replace;
  }
  element(element: HTMLRewriterTypes.Element) {
    element.setInnerContent(this.replace, { html: true });
  }
}

interface Arguments {
  // _?: string[];
  port?: number;
}

const defaultArguments: Arguments = {
  port: 3000,
}

async function initialize() {
  // start watcher
  const { _, port } = {
    ...defaultArguments,
    ...minimist(process.argv.slice(2))
  }

  const dir = path.normalize(_?.[0] ?? process.cwd());

  // start directory
  const server = Bun.serve({
    port,
    async fetch(req) {
      const pathname = new URL(req.url).pathname;
      if (req.method === 'POST' && pathname === '/__totebag/html/save') {

        // get file from query string
        const savepath = new URL(req.url).searchParams.get("path");
        if (!savepath)
          return new Response("invalid filepath to save", { status: 400 });

        console.log(savepath);
        // get form parameters
        const formData = await req.formData();
        const selector = formData.get("selector"), body = formData.get("body");
        if (!selector || !body)
          return new Response("invalid request", { status: 400 });

        // construct an HTML Rewriter based on a certain CSS path guaranteed to be unique
        const rewriter = new HTMLRewriter().on(selector.toString(), new ReplacerHandler(body.toString()));

        // save the file using Bun
        const saveFilepath = path.normalize(path.join(dir, savepath));

        try {
          const filestat = await stat(saveFilepath);
          const finalFilepath = filestat.isDirectory() ? path.join(saveFilepath, "index.html") : saveFilepath;
          // console.log(finalFilepath);
          const file = Bun.file(finalFilepath);
          Bun.write(file, rewriter.transform(await file.text()));
        } finally { }

        return new Response("ok!");

      }

      // handle totebag JS
      if (pathname === "/__totebag/totebag.mjs") {
        const file = Bun.file(path.join(import.meta.dir, "public", "totebag.mjs"));
        return new Response(file);
      }

      // handle directory view

      // handle file view
      const filepath = path.normalize(path.join(dir, pathname));
      console.log(`${Date.now()}: ${filepath}`);
      return fileHandler(filepath);
    },
  });

  console.log('PLEASE DO NOT EVER RUN THIS ON PRODUCTION');
  console.log(`Listening on http://localhost:${server.port} ...`);
  console.log(`Watching for changes in ${dir}`);

  const watcher = watch(dir, (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
  });
}

void initialize();

