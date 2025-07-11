import JadwalRepository from "../repositories/jadwal.repository";
import { APIError } from "../utils/api-error.util";
import { PostJadwalType } from "../types/jadwal.type";
import TahunAjaranRepository from "../repositories/tahun_ajaran.repository";
import JadwalHelper from "../helpers/jadwal.helper";

export default class JadwalService {
  public static async getMe(email: string) {
    const jadwal = await JadwalRepository.findMe(email);
    if (!jadwal) {
      throw new APIError("Jadwal tidak ditemukan", 404);
    }
    return {
      response: true,
      message: "Data jadwal berhasil diambil",
      data: jadwal,
    };
  }

  public static async getAll() {
    const jadwal = await JadwalRepository.findAll();
    if (!jadwal) {
      throw new APIError("Jadwal tidak ditemukan", 404);
    }
    return {
      response: true,
      message: "Data semua jadwal berhasil diambil",
      data: jadwal,
    };
  }

  public static async get(id: string) {
    const jadwal = await JadwalRepository.findById(id);
    if (!jadwal) {
      throw new APIError("Jadwal tidak ditemukan", 404);
    }
    return {
      response: true,
      message: "Data jadwal berhasil diambil",
      data: jadwal,
    };
  }

  public static async post(data: PostJadwalType) {
    const {
      nama_ruangan,
      waktu_mulai,
      waktu_selesai,
      nip_pembimbing_1,
      nip_pembimbing_2,
      nip_penguji_1,
      nip_penguji_2,
      nip_ketua_sidang,
    } = data;

    await JadwalHelper.cekKonflikRuangan(
      nama_ruangan,
      new Date(waktu_mulai),
      new Date(waktu_selesai)
    );

    const nips = [
      nip_pembimbing_1,
      nip_pembimbing_2,
      nip_penguji_1,
      nip_penguji_2,
      nip_ketua_sidang,
    ].filter((nip) => nip !== undefined) as string[];

    await JadwalHelper.cekKonflikDosen(
      nips,
      new Date(waktu_mulai),
      new Date(waktu_selesai)
    );

    const tahunAjaran = await TahunAjaranRepository.findSekarang();
    if (!tahunAjaran) {
      throw new APIError("Tahun ajaran aktif tidak ditemukan", 404);
    }

    const jadwal = await JadwalRepository.create({
      ...data,
      kode_tahun_ajaran: tahunAjaran.kode,
    });

    return {
      response: true,
      message: "Jadwal berhasil ditambahkan",
      data: jadwal,
    };
  }

  public static async put(id: string, data: PostJadwalType) {
    await this.get(id);
    const jadwal = await JadwalRepository.update(id, data);
    return {
      response: true,
      message: "Jadwal berhasil diperbarui",
      data: jadwal,
    };
  }
}