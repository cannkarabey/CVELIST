// src/utils/normalizeCve.js

export function normalizeCve(doc) {
  return {
    cveId: doc.cveMetadata?.cveId || 'N/A',
    title: doc.title || 'N/A',
    datePublished: doc.datePublished || 'N/A',
    state: doc.state || 'N/A',
    dataVersion: doc.dataVersion || 'N/A',
    description: doc.descriptions?.find(d => d.lang === 'en')?.value || 'N/A',
    problemType: doc.problemTypes?.[0]?.descriptions?.find(d => d.lang === 'en')?.description || 'N/A',
    affected: (doc.affected || []).map(a => {
      const versions = (a.versions || []).map(v => v.status).join(', ') || 'N/A';
      return `${a.vendor || 'N/A'} - ${a.product || 'N/A'}: ${versions}`;
    }),
    references: (doc.references || []).map(r => ({
      tags: Array.isArray(r.tags) ? r.tags.join(', ') : '',
      url: r.url
    })),
    providerOrgId: doc.providerMetadata?.orgId || 'N/A',
    cvssBaseScore: doc.cvssV3_1?.baseScore || 'N/A'
  };
}
