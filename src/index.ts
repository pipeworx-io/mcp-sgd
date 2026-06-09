interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * SGD (Saccharomyces Genome Database) MCP.
 *
 * Wraps the keyless SGD backend API — the authoritative reference database for
 * budding-yeast (S. cerevisiae) genetics. Look up a gene/locus, search, and get
 * Gene Ontology annotations.
 */


const BASE = 'https://www.yeastgenome.org/backend';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_gene',
    description:
      'Look up a single yeast (S. cerevisiae) gene/locus in SGD (Saccharomyces Genome Database, the authoritative budding-yeast genetics resource). Accepts a systematic name (e.g. YAL001C), a standard gene name (e.g. TFC3), or an SGDID (e.g. S000000001). Returns the standard name, systematic name, SGDID, description, locus type, and aliases. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Systematic name (YAL001C), gene name (TFC3), or SGDID (S000000001).',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_genes',
    description:
      'Search SGD (Saccharomyces Genome Database, the authoritative budding-yeast / S. cerevisiae genetics resource) for genes, loci, alleles, and other entities by free-text query. Returns matching hits with their name, category, and href. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Free-text search, e.g. a gene name like ADE2.' },
        limit: { type: 'number', description: 'Max results (default 15).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_gene_go',
    description:
      'Get Gene Ontology (GO) annotations for a yeast (S. cerevisiae) gene/locus from SGD (Saccharomyces Genome Database). Accepts a systematic name (e.g. YAL001C), a standard gene name (e.g. TFC3), or an SGDID (e.g. S000000001). Returns GO terms with their GO id, aspect (molecular function / biological process / cellular component), and supporting evidence. Keyless.',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Systematic name (YAL001C), gene name (TFC3), or SGDID (S000000001).',
        },
      },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  try {
    switch (name) {
      case 'get_gene':
        return await getGene(reqStr(args, 'id'));
      case 'search_genes':
        return await searchGenes(reqStr(args, 'query'), numArg(args.limit, 15));
      case 'get_gene_go':
        return await getGeneGo(reqStr(args, 'id'));
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

async function getGene(id: string): Promise<unknown> {
  const res = await sgdGet(`/locus/${encodeURIComponent(id)}`);
  if (!res.ok || res.body == null || typeof res.body !== 'object') {
    return { error: 'gene not found', id };
  }
  const d = res.body as Record<string, unknown>;
  const out: Record<string, unknown> = {
    gene: d.display_name,
    systematic_name: d.format_name,
    sgdid: d.sgdid,
    description: d.description,
    name_description: d.name_description,
    locus_type: d.locus_type,
  };
  if (Array.isArray(d.aliases) && d.aliases.length > 0) {
    out.aliases = (d.aliases as Array<Record<string, unknown>>)
      .map((a) => a.display_name)
      .filter((a) => typeof a === 'string');
  }
  return out;
}

async function searchGenes(query: string, limit: number): Promise<unknown> {
  const res = await sgdGet(`/get_search_results?q=${encodeURIComponent(query)}`);
  if (!res.ok || res.body == null || typeof res.body !== 'object') {
    return { count: 0, results: [] };
  }
  const body = res.body as Record<string, unknown>;
  const hits = Array.isArray(body.results) ? (body.results as Array<Record<string, unknown>>) : [];
  const results = hits.slice(0, limit).map((h) => ({
    name: h.name,
    category: h.category,
    href: h.href,
    description: h.description ?? null,
  }));
  return { count: results.length, results };
}

async function getGeneGo(id: string): Promise<unknown> {
  const res = await sgdGet(`/locus/${encodeURIComponent(id)}/go_details`);
  if (!res.ok || !Array.isArray(res.body)) {
    return { id, count: 0, go_terms: [] };
  }
  const go_terms = (res.body as Array<Record<string, unknown>>).map((a) => {
    const go = (a.go ?? {}) as Record<string, unknown>;
    const experiment = (a.experiment ?? {}) as Record<string, unknown>;
    return {
      term: go.display_name,
      go_id: go.go_id,
      aspect: go.go_aspect,
      qualifier: a.qualifier,
      evidence: experiment.display_name ?? a.annotation_type,
    };
  });
  return { id, count: go_terms.length, go_terms };
}

async function sgdGet(path: string): Promise<{ ok: boolean; body: unknown }> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) return { ok: false, body: null };
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    return { ok: false, body: null };
  }
  return { ok: true, body };
}

function reqStr(args: Record<string, unknown>, key: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing.`);
  return v.trim();
}

function numArg(v: unknown, def: number): number {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.floor(v);
  return def;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
