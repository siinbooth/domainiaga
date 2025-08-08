# DomainLuxe - Premium Domain Marketplace

Platform marketplace domain premium dengan sistem pembayaran QRIS dan dashboard admin lengkap.

## 🚀 Fitur Utama

- **Marketplace Domain**: Jual beli domain dengan metrik SEO lengkap
- **Pembayaran QRIS**: Sistem pembayaran digital terintegrasi
- **Dashboard Admin**: Kelola domain, transaksi, dan kategori
- **Responsive Design**: Tampilan optimal di semua perangkat
- **SEO Metrics**: DA, PA, SS, DR, dan Backlinks tracking
- **Search & Filter**: Pencarian dan filter domain yang canggih

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: QRIS Integration
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase

## 🔧 Setup & Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd domainluxe
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan Anon Key dari Settings > API
3. Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database

1. Jalankan migrasi database di Supabase SQL Editor:
   - Jalankan file `supabase/migrations/20250808012343_fancy_resonance.sql`
   - Jalankan file `supabase/migrations/20250808013609_fading_swamp.sql`
   - Jalankan file `supabase/migrations/20250108120000_add_dummy_data.sql`

2. Atau gunakan Supabase CLI:
```bash
npx supabase db reset
```

### 4. Setup Authentication

Di Supabase Dashboard > Authentication > Settings:
- Disable "Enable email confirmations"
- Enable "Enable custom SMTP" (opsional)

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 👤 Login Credentials

### Admin Dashboard
- **URL**: `/admin/login`
- **Email**: `admin@domainluxe.com`
- **Password**: Gunakan Supabase Auth untuk set password

### User Login
- **URL**: `/login`
- Daftar akun baru atau gunakan existing user

## 📊 Data Dummy

Aplikasi sudah dilengkapi dengan data dummy:

- **16 Domain** dengan berbagai kategori (.id, .com, .org, .ac.id, .co.id, .or.id)
- **6 Kategori Domain** dengan deskripsi lengkap
- **3 Admin Users** dengan role berbeda
- **Metrik SEO** untuk semua domain
- **Transaksi Sample** (completed dan pending)
- **Popular Searches** untuk testing
- **Domain Suggestions** untuk rekomendasi

## 🗂️ Struktur Database

### Tables:
- `admins` - Data admin users
- `domain_categories` - Kategori domain (.id, .com, dll)
- `domains` - Data domain dengan harga dan info
- `domain_metrics` - Metrik SEO (DA, PA, SS, DR, BL)
- `transactions` - Transaksi pembelian domain
- `popular_searches` - Tracking pencarian populer
- `domain_suggestions` - Rekomendasi domain terkait

## 🎨 Fitur UI/UX

- **Modern Design**: Clean dan professional
- **Dark/Light Mode**: Automatic theme detection
- **Mobile First**: Responsive di semua device
- **Loading States**: Smooth loading experience
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback

## 🔐 Security Features

- **Row Level Security (RLS)** di semua tabel
- **Admin Authentication** dengan role-based access
- **Input Validation** di frontend dan backend
- **SQL Injection Protection** dengan Supabase
- **CORS Configuration** untuk API security

## 📱 Pages & Routes

### Public Pages:
- `/` - Homepage dengan featured domains
- `/domains/:extension` - Domain list by category
- `/domain/:id` - Domain detail page
- `/login` - User authentication

### Admin Pages:
- `/admin` - Dashboard overview
- `/admin/domains` - Domain management
- `/admin/transactions` - Transaction management
- `/admin/categories` - Category management
- `/admin/settings` - System settings

## 🚀 Deployment

### Vercel/Netlify:
1. Connect repository
2. Set environment variables
3. Deploy

### Manual:
```bash
npm run build
# Upload dist/ folder to hosting
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

Untuk bantuan dan support:
- Email: support@domainluxe.com
- WhatsApp: +62 812-3456-7890

---

**DomainLuxe** - Premium Domain Marketplace untuk Indonesia 🇮🇩