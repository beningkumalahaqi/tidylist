-- CreateEnum
CREATE TYPE "StatusTugas" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Prioritas" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "name" STRING,
    "password" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" STRING NOT NULL,
    "nama" STRING NOT NULL,
    "warna" STRING NOT NULL DEFAULT '#3B82F6',
    "icon" STRING NOT NULL DEFAULT '📝',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas" (
    "id" STRING NOT NULL,
    "judul" STRING NOT NULL,
    "deskripsi" STRING,
    "status" "StatusTugas" NOT NULL DEFAULT 'PENDING',
    "prioritas" "Prioritas" NOT NULL DEFAULT 'MEDIUM',
    "estimasiWaktu" INT4,
    "waktuSelesai" INT4,
    "deadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "userId" STRING NOT NULL,
    "kategoriId" STRING NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_tugas" (
    "id" STRING NOT NULL,
    "tugasId" STRING NOT NULL,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuSelesai" TIMESTAMP(3) NOT NULL,
    "catatanTambahan" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_tugas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "riwayat_tugas_tugasId_key" ON "riwayat_tugas"("tugasId");

-- AddForeignKey
ALTER TABLE "kategori" ADD CONSTRAINT "kategori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_tugas" ADD CONSTRAINT "riwayat_tugas_tugasId_fkey" FOREIGN KEY ("tugasId") REFERENCES "tugas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
