"use server";
import { PENELITIAN_TABLES as T } from "@/features/kegiatan/data";
import * as svc from "@/features/kegiatan/service";

const PATH = "/penelitian";

export async function createPenelitian(input: unknown) {
  return svc.createKegiatan(T, PATH, input);
}
export async function updatePenelitian(id: number, input: unknown) {
  return svc.updateKegiatan(T, PATH, id, input);
}
export async function deletePenelitian(id: number) {
  return svc.deleteKegiatan(T, PATH, id);
}
export async function addPenelitianDosen(id: number, input: unknown) {
  return svc.addKontribDosen(T, PATH, id, input);
}
export async function addPenelitianMahasiswa(id: number, input: unknown) {
  return svc.addKontribMahasiswa(T, PATH, id, input);
}
export async function removePenelitianDosen(pivotId: number) {
  return svc.removeKontribDosen(T, PATH, pivotId);
}
export async function removePenelitianMahasiswa(pivotId: number) {
  return svc.removeKontribMahasiswa(T, PATH, pivotId);
}
