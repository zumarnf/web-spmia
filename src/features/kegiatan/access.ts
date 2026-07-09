/**
 * Client-side mirror of the DB `kegiatan_owned` predicate, used to gate the write
 * UI (the "Ubah" button) so a prodi that only *sees* a kegiatan (as an anggota)
 * isn't offered an edit that RLS will reject.
 *
 * `ketuaProdiId` comes from the `ketua_prodi_id` computed field: for a visible row
 * it is the ketua's prodi, or null when the kegiatan has no ketua yet (orphan —
 * writable by anyone until one is assigned). Admins can always edit.
 */
export function canEditKegiatan(
  isAdmin: boolean,
  myProdiId: number | null,
  ketuaProdiId: number | null,
): boolean {
  if (isAdmin) return true;
  if (ketuaProdiId == null) return true; // orphan
  return myProdiId != null && ketuaProdiId === myProdiId;
}
