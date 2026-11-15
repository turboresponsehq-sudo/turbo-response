import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function MoneyBossesExternalLinkEditor({ artworkId, savedUrl = '', savedLabel = '', enabled }: {
  artworkId?: number; savedUrl?: string | null; savedLabel?: string | null; enabled: boolean;
}) {
  const utils = trpc.useUtils();
  const save = trpc.moneyBosses.saveArchiveDestination.useMutation();
  const publish = trpc.moneyBosses.publishArchiveDestination.useMutation();
  const unpublish = trpc.moneyBosses.unpublishArchiveArtwork.useMutation();
  const [url, setUrl] = useState(savedUrl ?? '');
  const [label, setLabel] = useState(savedLabel ?? '');
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const pending = save.isPending || publish.isPending || unpublish.isPending;
  const dirty = url.trim() !== (savedUrl ?? '') || label.trim() !== (savedLabel ?? '');
  useEffect(() => {
    setUrl(savedUrl ?? ''); setLabel(savedLabel ?? ''); setApproved(false); setMessage(''); setError('');
  }, [artworkId, savedUrl, savedLabel]);
  async function run(operation: 'save' | 'publish' | 'remove') {
    if (!enabled || !artworkId || pending) return;
    setMessage(''); setError('');
    try {
      if (operation === 'save') {
        const result = await save.mutateAsync({ artworkId, url: url.trim() || null, label: label.trim() });
        if (!result.saved) throw new Error('The database did not confirm the link save.');
        await utils.moneyBosses.archiveContent.invalidate();
        setMessage(url.trim() ? 'Link draft saved. Publish it to update scans.' : 'Link draft cleared. Existing published content stays unchanged until unpublished or replaced.');
      } else if (operation === 'publish') {
        const result = await publish.mutateAsync({ artworkId, approval: true });
        if (!result.published) throw new Error('The server did not confirm publication.');
        await utils.moneyBosses.archiveContent.invalidate();
        setApproved(false); setMessage('Link published in development. New artwork scans open this saved destination.');
      } else {
        const result = await unpublish.mutateAsync({ artworkId });
        if (!result.unpublished) throw new Error('The server did not confirm unpublishing.');
        await utils.moneyBosses.archiveContent.invalidate();
        setMessage('Artwork experience unpublished. Scans use the safe Archive Hub fallback.');
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The link operation failed.'); }
  }
  return <section className="mb-panel mb-external-link-editor" aria-labelledby="mb-link-editor-heading">
    <h3 id="mb-link-editor-heading">Artwork link destination</h3>
    <p>Choose the artwork above, paste an Instagram, YouTube or other public HTTPS link, then save and publish. No video upload or QR replacement is needed.</p>
    <form className="mb-draft-form" onSubmit={event => { event.preventDefault(); void run('save'); }}>
      <label>External destination URL<input type="url" value={url} maxLength={2000} disabled={!enabled || !artworkId || pending} placeholder="https://www.instagram.com/reel/…" onChange={event => { setUrl(event.target.value); setApproved(false); }} /></label>
      <label>Link label<input value={label} maxLength={160} disabled={!enabled || !artworkId || pending} placeholder="Open the archive experience" onChange={event => { setLabel(event.target.value); setApproved(false); }} /></label>
      <button type="submit" disabled={!enabled || !artworkId || pending}>Save link draft</button>
      <label className="mb-check"><input type="checkbox" checked={approved} disabled={!enabled || !artworkId || pending || dirty || !savedUrl} onChange={event => setApproved(event.target.checked)} />Approved to use for artwork scans</label>
      <div className="mb-actions"><button type="button" disabled={!enabled || !artworkId || pending || dirty || !savedUrl || !approved} onClick={() => void run('publish')}>Publish link in development</button><button type="button" disabled={!enabled || !artworkId || pending} onClick={() => void run('remove')}>Unpublish artwork link</button></div>
    </form>
    <p className="mb-form-note">This opens the external site, not an Instagram or YouTube embed. That site's login, playback and availability rules still apply. A changed draft does not replace the published destination until you publish it.</p>
    {!enabled && <p className="mb-form-note">Use the authenticated staging Admin Center to save links; the read-only preview cannot publish.</p>}
    {message && <p role="status">{message}</p>}{error && <p role="alert" className="mb-error">{error}</p>}
  </section>;
}
