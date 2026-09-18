# mcp-sgd

SGD (Saccharomyces Genome Database) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_gene` | Look up a single yeast (S. cerevisiae) gene/locus in SGD (Saccharomyces Genome Database, the authoritative budding-yeast genetics resource). Accepts a systematic name (e.g. YAL001C), a standard gene name (e.g. TFC3), or an SGDID (e.g. S000000001). Returns the standard name, systematic name, SGDID, description, locus type, and aliases. Keyless. |
| `search_genes` | Search SGD (Saccharomyces Genome Database, the authoritative budding-yeast / S. cerevisiae genetics resource) for genes, loci, alleles, and other entities by free-text query. Returns matching hits with their name, category, and href. Keyless. |
| `get_gene_go` | Get Gene Ontology (GO) annotations for a yeast (S. cerevisiae) gene/locus from SGD (Saccharomyces Genome Database). Accepts a systematic name (e.g. YAL001C), a standard gene name (e.g. TFC3), or an SGDID (e.g. S000000001). Returns GO terms with their GO id, aspect (molecular function / biological process / cellular component), and supporting evidence. Keyless. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "sgd": {
      "url": "https://gateway.pipeworx.io/sgd/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/sgd/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Sgd data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/sgd_get_gene \
  -H 'Content-Type: application/json' \
  -d '{"id":"YAL001C"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/sgd_get_gene`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
