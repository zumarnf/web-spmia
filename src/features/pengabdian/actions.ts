"use server";
import { PENGABDIAN_TABLES as T } from "@/features/kegiatan/data";
import * as svc from "@/features/kegiatan/service";

const PATH = "/pengabdian";

export async function createPengabdian(input: unknown) {
  return svc.createKegiatan(T, PATH, input);
}
export async function updatePengabdian(id: number, input: unknown) {
  return svc.updateKegiatan(T, PATH, id, input);
}
export async function deletePengabdian(id: number) {
  return svc.deleteKegiatan(T, PATH, id);
}
export async function addPengabdianDosen(id: number, input: unknown) {
  return svc.addKontribDosen(T, PATH, id, input);
}
export async function addPengabdianMahasiswa(id: number, input: unknown) {
  return svc.addKontribMahasiswa(T, PATH, id, input);
}
export async function removePengabdianDosen(pivotId: number) {
  return svc.removeKontribDosen(T, PATH, pivotId);
}
export async function removePengabdianMahasiswa(pivotId: number) {
  return svc.removeKontribMahasiswa(T, PATH, pivotId);
}
