import { useEffect } from 'react';

export type SEOOptions = {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g., "/app/dashboard"
};

export function useSEO({ title, description, canonicalPath }: SEOOptions) {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Meta description
    if (description !== undefined) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description || '');
    }

    // Canonical tag
    if (canonicalPath) {
      const canonicalUrl = canonicalPath.startsWith('http')
        ? canonicalPath
        : `${window.location.origin}${canonicalPath}`;

      let link = Array.from(document.getElementsByTagName('link')).find(
        (l) => l.getAttribute('rel') === 'canonical'
      ) as HTMLLinkElement | undefined;

      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }

      link.setAttribute('href', canonicalUrl);
    }
  }, [title, description, canonicalPath]);
}
