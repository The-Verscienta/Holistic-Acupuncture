/**
 * Sanity Studio tool: Cloudflare Images
 * Fetches cloudflare-images-index from the site and lists images with Sanity asset mapping.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Text,
  Stack,
  Spinner,
  Grid,
  TextInput,
  Badge,
  Flex,
} from '@sanity/ui';
import { ImageIcon } from '@sanity/icons';

interface CloudflareImageEntry {
  id: number;
  title: string;
  filename: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  sanity: {
    _type: string;
    asset: { _type: string; _ref: string };
  } | null;
  cloudflare: {
    id: string;
    variants: string[];
    baseUrl: string;
  } | null;
}

export function CloudflareImagesTool(props: { tool: { options?: { indexUrl?: string } } }) {
  const [data, setData] = useState<CloudflareImageEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Prefer indexUrl from config (set in Node); fallback to process.env in browser
  const indexUrl =
    props.tool?.options?.indexUrl ||
    (typeof process !== 'undefined' && process.env?.SANITY_STUDIO_CLOUDFLARE_INDEX_URL) ||
    (typeof process !== 'undefined' && process.env?.PUBLIC_APP_URL) ||
    null;

  const fetchIndex = useCallback(async () => {
    if (!indexUrl) {
      setError(
        `Index URL not set. Configure SANITY_STUDIO_CLOUDFLARE_INDEX_URL or PUBLIC_APP_URL (e.g. https://holisticacupuncture.net or http://localhost:4321) in your env.`
      );
      setLoading(false);
      return;
    }
    const url = indexUrl.replace(/\/$/, '') + '/cloudflare-images-index.json';
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load index');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [indexUrl]);

  useEffect(() => {
    fetchIndex();
  }, [fetchIndex]);

  const dualHosted = useMemo(() => {
    if (!data) return [];
    return data.filter((e) => e.sanity && e.cloudflare);
  }, [data]);

  const filtered = useMemo(() => {
    if (!search.trim()) return dualHosted;
    const q = search.toLowerCase().trim();
    return dualHosted.filter(
      (e) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.filename && e.filename.toLowerCase().includes(q)) ||
        (e.cloudflare?.id && e.cloudflare.id.toLowerCase().includes(q)) ||
        (e.sanity?.asset?._ref && e.sanity.asset._ref.toLowerCase().includes(q))
    );
  }, [dualHosted, search]);

  if (loading) {
    return (
      <Card padding={5} tone="transparent">
        <Flex align="center" gap={3}>
          <Spinner />
          <Text>Loading Cloudflare images index…</Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding={5} tone="critical">
        <Stack space={3}>
          <Text weight="semibold">Could not load index</Text>
          <Text size={1}>{error}</Text>
          <Text size={1} muted>
            Ensure the site is running and CORS allows this origin. For local dev, set SANITY_STUDIO_CLOUDFLARE_INDEX_URL=http://localhost:4321 (or your Astro dev URL).
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card padding={4} tone="transparent">
      <Stack space={4}>
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Text size={1} weight="semibold">
            Images on Cloudflare (with Sanity mapping)
          </Text>
          <Badge tone="primary">{filtered.length} of {dualHosted.length}</Badge>
        </Flex>

        <TextInput
          icon={ImageIcon}
          placeholder="Search by title, filename, Cloudflare ID, or Sanity ref…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <Box style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Grid columns={[1, 2, 3]} gap={3}>
            {filtered.map((entry) => (
              <Card key={entry.id} padding={2} radius={2} shadow={1} tone="transparent">
                <Stack space={2}>
                  <Box style={{ aspectRatio: '16/10', overflow: 'hidden', borderRadius: 4, background: 'var(--card-muted-fg-color)' }}>
                    {entry.cloudflare?.variants?.[0] && (
                      <img
                        src={entry.cloudflare.variants[0]}
                        alt={entry.altText || entry.title || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    )}
                  </Box>
                  <Text size={1} weight="medium" muted>
                    {entry.title || entry.filename || 'Untitled'}
                  </Text>
                  <Text size={0} muted>
                    {entry.cloudflare?.id} · {entry.width}×{entry.height}
                  </Text>
                  {entry.sanity?.asset?._ref && (
                    <Text size={0} style={{ wordBreak: 'break-all' }}>
                      Sanity: <code style={{ fontSize: '0.7rem' }}>{entry.sanity.asset._ref}</code>
                    </Text>
                  )}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Card>
  );
}
