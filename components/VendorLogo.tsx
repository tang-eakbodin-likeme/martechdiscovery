import { initials, logoFile } from '@/lib/catalog';

/** The vendor's real logo when we have the file, otherwise a plain initial tile (never a generated mark). */
export function VendorLogo({ name, sample = false }: { name: string; sample?: boolean }) {
  const file = sample ? undefined : logoFile(name);
  if (file) {
    return (
      <span className="vendor-logo-source">
        <img src={`/assets/vendor-logos/${encodeURIComponent(file)}`} alt={name} loading="lazy" />
      </span>
    );
  }
  return <span className="vendor-logo-initial" aria-hidden="true">{initials(name)}</span>;
}
