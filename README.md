# mcp-sgd

SGD (Saccharomyces Genome Database) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Sgd data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
