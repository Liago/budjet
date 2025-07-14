# Ripristina schema SQLite per development
mv prisma/schema.sqlite.backup prisma/schema.prisma
echo "✅ SQLite schema restored"

# Rigenera client SQLite per locale
npx prisma generate
echo "✅ SQLite client restored for local development"