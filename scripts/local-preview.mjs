import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const { default: worker } = await import("../dist/server/index.js");
const publicRoot = normalize(join(process.cwd(), "dist", "client"));
const types = { ".css":"text/css", ".js":"text/javascript", ".png":"image/png", ".svg":"image/svg+xml", ".json":"application/json" };

const assets = { fetch: async (request) => {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const filePath = normalize(join(publicRoot, pathname));
  if (!filePath.startsWith(publicRoot)) return new Response("Not found", { status:404 });
  try { return new Response(await readFile(filePath), { headers:{ "content-type":types[extname(filePath)] || "application/octet-stream" } }); }
  catch { return new Response("Not found", { status:404 }); }
}};

createServer(async (request, response) => {
  const url = `http://127.0.0.1:3000${request.url}`;
  const parsed = new URL(url);
  const assetPath = parsed.pathname === "/_vinext/image" ? parsed.searchParams.get("url") : parsed.pathname;
  if (assetPath && (assetPath.startsWith("/assets/") || assetPath.startsWith("/images/") || assetPath.endsWith(".svg"))) {
    const result = await assets.fetch(new Request(`http://local${assetPath}`));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
    return;
  }
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : request;
  const result = await worker.fetch(new Request(url, { method:request.method, headers:request.headers, body, duplex:body ? "half" : undefined }), { ASSETS:assets }, { waitUntil(){}, passThroughOnException(){} });
  response.writeHead(result.status, Object.fromEntries(result.headers));
  response.end(Buffer.from(await result.arrayBuffer()));
}).listen(3000, "127.0.0.1", () => console.log("Dealstore preview: http://127.0.0.1:3000"));
