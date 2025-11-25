const stats = [
  { label: "Créateurs actifs", value: "42K+" },
  { label: "Photos partagées", value: "3.2M" },
  { label: "Catégories suivies", value: "120+" },
];

const features = [
  {
    title: "Upload illimité",
    description:
      "Charge des séries complètes, ajoute une description riche et publie en un clic.",
  },
  {
    title: "Catégories & types",
    description:
      "Classe chaque photo par univers (Voyage, Portrait, Macro...) et par type (RAW, 35mm, Drone...).",
  },
  {
    title: "Profils inspirants",
    description:
      "Présente ton nom, ton histoire et reçois des commentaires publics ou privés.",
  },
];

const categories = [
  "Voyage & Aventure",
  "Mode & Portraits",
  "Art Urbain",
  "Nature & Macro",
  "Architecture",
  "Lifestyle",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fcf7ff] text-[#0b0b0b]">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-black text-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-xl font-bold text-black">
              PIXDROP
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-200">
              BETA
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            {["Découvrir", "Créateurs", "Tarifs", "À propos"].map((item) => (
              <a
                key={item}
                href="#"
                className="transition hover:text-pink-200"
              >
                {item}
              </a>
            ))}
            <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-pink-200">
              Espace Studio
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 md:py-24">
        <section className="rounded-[32px] border border-black/10 bg-white px-8 py-12 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:px-16 md:py-20">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="flex-1">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-black/70">
                GÉNÈRE TON GALERIE
              </p>
              <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-tight">
                Va de ta première photo à une communauté engagée.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-black/70">
                PixDrop est une application de partage photo où chaque image
                raconte son auteur. Télécharge, catégorise, choisis le type de
                fichier et invite ton public à commenter. Pas besoin d&apos;être
                pro pour publier — il suffit de créer un compte.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button className="w-full rounded-full bg-pink-500 px-8 py-4 text-lg font-semibold text-black transition hover:translate-y-0.5 hover:bg-pink-400 sm:w-auto">
                  Ouvrir un compte gratuit
                </button>
                <button className="w-full rounded-full border border-black px-8 py-4 text-lg font-semibold transition hover:bg-black hover:text-white sm:w-auto">
                  Explorer la galerie
                </button>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-6 rounded-[28px] border border-black/10 bg-[#fff5fb] p-8">
              <div className="rounded-3xl border border-black/10 bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/60">
                      Mon upload
                    </p>
                    <p className="text-2xl font-semibold">Carnet de Lumière</p>
                  </div>
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    PUBLIC
                  </span>
                </div>
                <div className="grid gap-4 text-sm">
                  <div className="rounded-2xl border border-black/10 bg-[#f5f1ff] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/60">
                      Description
                    </p>
                    <p className="mt-1 text-base font-medium">
                      Série sur les ruelles de Lome au lever du soleil.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/60">
                        Auteur
                      </p>
                      <p className="mt-1 text-base font-medium">
                        Caleb MINTOUMBA
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/60">
                        Type
                      </p>
                      <p className="mt-1 text-base font-medium">Film 35mm</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/60">
                      Catégories
                    </p>
                    <p className="mt-1 text-base font-medium">
                      Voyage · Street photo · Pastels
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-black/10 bg-black p-6 text-white">
                <p className="text-sm uppercase tracking-[0.5em] text-white/70">
                  Commentaire
                </p>
                <p className="mt-2 text-lg leading-snug">
                  “Je peux suivre mes photographes préférés et leur laisser des
                  retours précis sur chaque cliché.”
                </p>
                <p className="mt-4 text-sm font-semibold">Matéo, collectionneur</p>
              </div>
            </div>
          </div>
          <div className="mt-12 grid gap-6 border-t border-black/10 pt-8 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-semibold">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.4em] text-black/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-[32px] border border-black/10 bg-[#fffef4] p-10 shadow-[0_20px_60px_rgba(17,24,39,0.1)] md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-black/50">
              TOUT CE QU&apos;IL FAUT
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">
              Des outils pensés pour chaque photographe.
            </h2>
            <p className="mt-4 text-lg text-black/70">
              Que tu documentes tes voyages ou que tu crées une collection NFT,
              PixDrop t&apos;offre des catégories personnalisées, des tags type,
              et un fil de commentaires pour dialoguer avec ta communauté.
            </p>
            <div className="mt-8 grid gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-black/10 bg-white p-6"
                >
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-black/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-[28px] border border-black/10 bg-white p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/50">
                CATEGORIES POPULAIRES
              </p>
              <div className="mt-4 grid gap-3">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#f6f1ff] px-4 py-3 text-sm font-semibold"
                  >
                    {category}
                    <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                      + Suivre
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[24px] border border-dashed border-black/30 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/50">
                COMMENT ÇA FONCTIONNE
              </p>
              <ol className="mt-4 space-y-3 text-sm font-semibold text-black/80">
                <li>1. Crée gratuitement ton compte PixDrop.</li>
                <li>2. Upload tes photos, renseigne description, auteur, type.</li>
                <li>3. Choisis catégories & tags pour les classer.</li>
                <li>4. Publie et invite la communauté à commenter.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-black/10 bg-black px-10 py-16 text-white">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-white/50">
                POURQUI RALENTIR ?
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
                Lance ta galerie en moins de 5 minutes.
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Nous hébergeons tes fichiers originaux, optimisons les aperçus et
                mettons en avant ton univers auprès de milliers de passionnés.
                Tu gardes la propriété totale de ton travail.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/5 p-8">
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-[0.4em] text-white/60">
                    FORMATS
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                    RAW · HEIC · PNG
                  </span>
                </div>
                <p className="text-base text-white/80">
                  Multi-upload avec conversion automatique en webp pour la
                  galerie, préservation de l&apos;original pour les
                  téléchargements sécurisés.
                </p>
                <div className="rounded-2xl border border-white/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                    SÉCURITÉ
                  </p>
                  <p className="mt-2 text-white">
                    Authentification à double facteur, filigranes intelligents
                    optionnels et contrôles d&apos;accès fins pour chaque photo.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-4 rounded-3xl bg-white px-8 py-6 text-black md:flex-row md:items-center md:justify-between">
            <p className="text-2xl font-semibold">
              Prêt·e à partager tes images ?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-500 hover:text-black">
                Démarrer gratuitement
              </button>
              <button className="rounded-full border border-black px-6 py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white">
                Regarder la démo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-black py-10 text-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="font-semibold tracking-[0.3em] text-pink-200">PIXDROP</p>
          <p className="text-white/70">
            © {new Date().getFullYear()} PixDrop — partage photo francophone.
          </p>
          {/* <div className="flex gap-4 text-white/70">
            <a href="#">Mentions légales</a>
            <a href="#">Support</a>
            <a href="#">Rejoindre la bêta</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
