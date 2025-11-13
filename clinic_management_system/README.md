
# Klinik Randevu Yönetim Sistemi

Modern bir klinik yönetim sistemi - randevular, danışanlar, personel ve finans takibi için.

## 🚀 Özellikler

- 📅 **Takvim**: Randevu yönetimi ve görüntüleme
- 💰 **Kasa**: Gelir-gider takibi ve raporlama
- 👥 **Danışanlar**: Hasta kayıtları ve geçmiş
- 👨‍⚕️ **Personel**: Psikolog ve koordinatör yönetimi
- 📊 **İstatistikler**: Detaylı raporlama ve analiz
- 📝 **Görevler**: Danışanlara ödev/form atama sistemi
- 🔐 **Rol Bazlı Erişim**: Admin, Psikolog, Koordinatör, Danışan

## 🛠️ Teknolojiler

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## 📦 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kullaniciadi/randevu-programi.git
cd randevu-programi
```

### 2. Bağımlılıkları Yükleyin

```bash
yarn install
```

### 3. Environment Variables

`.env.example` dosyasını `.env` olarak kopyalayın ve doldurun:

```bash
cp .env.example .env
```

Gerekli değişkenler:
- `DATABASE_URL`: PostgreSQL bağlantı string'i
- `NEXTAUTH_URL`: Uygulama URL'i
- `NEXTAUTH_SECRET`: Güvenlik anahtarı

### 4. Database'i Hazırlayın

```bash
# Prisma migration
yarn prisma migrate deploy

# Seed data (opsiyonel)
yarn prisma db seed
```

### 5. Uygulamayı Çalıştırın

```bash
# Development
yarn dev

# Production build
yarn build
yarn start
```

## 🌐 Vercel'e Deploy

### Hızlı Deploy

[![Deploy with Vercel](https://i.ytimg.com/vi/hAuyNf0Uk-w/sddefault.jpg)

### Manuel Deploy

1. Vercel'e giriş yapın ve "New Project" seçin
2. GitHub reponuzu import edin
3. Environment variables ekleyin:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (Vercel otomatik dolduracak)
   - `NEXTAUTH_SECRET`
4. Deploy edin!

## 🔐 Test Hesapları

- **Admin**: admin@example.com / admin123
- **Psikolog**: psychologist@example.com / psych123
- **Danışan**: client@example.com / client123

## 📱 Entegrasyonlar (Opsiyonel)

### İyzico Ödeme Sistemi
1. [İyzico'ya kaydolun](https://www.iyzico.com/)
2. API anahtarlarınızı `.env` dosyasına ekleyin

### WhatsApp Bildirimleri
1. [Twilio hesabı açın](https://www.twilio.com/)
2. WhatsApp Business API credentials'ı ekleyin

## 📄 Lisans

MIT License

## 🤝 Destek

Sorularınız için: [GitHub Issues](https://github.com/kullaniciadi/randevu-programi/issues)
