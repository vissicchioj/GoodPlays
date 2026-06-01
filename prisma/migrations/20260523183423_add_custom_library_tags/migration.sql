-- CreateTable
CREATE TABLE "LibraryTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LibraryTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameLogTag" (
    "id" TEXT NOT NULL,
    "gameLogId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "GameLogTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryTag_userId_name_key" ON "LibraryTag"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GameLogTag_gameLogId_tagId_key" ON "GameLogTag"("gameLogId", "tagId");

-- AddForeignKey
ALTER TABLE "LibraryTag" ADD CONSTRAINT "LibraryTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLogTag" ADD CONSTRAINT "GameLogTag_gameLogId_fkey" FOREIGN KEY ("gameLogId") REFERENCES "GameLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameLogTag" ADD CONSTRAINT "GameLogTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "LibraryTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
