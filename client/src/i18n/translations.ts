export type Language = 'en' | 'tr' | 'es'

export interface TranslationKeys {
  // Brand & Nav
  brandName: string
  tagline: string
  playNow: string
  howToPlay: string
  
  // Game Header & Stats
  score: string
  sessionScore: string
  roundScore: string
  streak: string
  round: string
  roundOf: string
  secondsClip: string
  
  // Video Player
  playingAtSpeed: string
  scrubbingClip: string
  typeGuessBelow: string
  watchClipFirst: string
  fullMovieClip: string
  
  // Controls & Inputs
  typeMoviePlaceholder: string
  submitGuess: string
  skip: string
  nextMovie: string
  tryAgain: string
  
  // Game Outcomes & Toasts
  correctTitle: string
  wrongTitle: string
  movieWas: string
  skippedMovieWas: string
  gameCompleted: string
  
  // Home Page
  heroBadge: string
  heroTitleLine1: string
  heroTitleLine2: string
  heroSubtitle: string
  heroCtaPlay: string
  heroCtaHow: string
  statMovies: string
  statRounds: string
  statFirstClip: string
  howItWorksTitle: string
  howItWorksSub: string
  featuresTitle: string
  feature1Title: string
  feature1Desc: string
  feature2Title: string
  feature2Desc: string
  feature3Title: string
  feature3Desc: string
  ctaBannerTitle: string
  ctaBannerSub: string
  ctaBannerButton: string
  
  // Footer & Legal
  allRightsReserved: string
  privacyPolicy: string
  termsOfService: string
  createdBy: string
  
  // Result Page
  victoryTitle: string
  defeatTitle: string
  finalScore: string
  playNextMovie: string
}

export const translations: Record<Language, TranslationKeys> = {
  en: {
    brandName: 'CineRiddle',
    tagline: 'Can you name the film?',
    playNow: 'Play Now',
    howToPlay: 'How to Play',
    
    score: 'Score',
    sessionScore: 'Session Score',
    roundScore: 'Round Score',
    streak: 'Streak',
    round: 'Round',
    roundOf: 'Round {current} of {total}',
    secondsClip: '{seconds}s clip',
    
    playingAtSpeed: '▶ Playing at {speed}× speed · scrubbing full movie',
    scrubbingClip: 'Scrubbing movie footage...',
    typeGuessBelow: '↓ Type your guess below',
    watchClipFirst: 'Watch the clip first…',
    fullMovieClip: 'Full Movie Clip',
    
    typeMoviePlaceholder: 'Type a movie title…',
    submitGuess: 'Submit Guess',
    skip: 'Skip Movie',
    nextMovie: 'Next Movie →',
    tryAgain: 'Try Again',
    
    correctTitle: '🎉 Correct!',
    wrongTitle: '❌ Wrong guess! Try round {round}',
    movieWas: 'The movie was',
    skippedMovieWas: 'Skipped! The movie was',
    gameCompleted: 'Game Completed',
    
    heroBadge: 'Now Playing',
    heroTitleLine1: 'Can you name',
    heroTitleLine2: 'the full film?',
    heroSubtitle: 'Watch 1-second full movie clips. Guess the title. Each round reveals more footage — how fast can you name it?',
    heroCtaPlay: "Play Now — It's Free",
    heroCtaHow: 'How to Play',
    statMovies: '100+ Movies',
    statRounds: '4 Rounds Max',
    statFirstClip: '1s First Clip',
    howItWorksTitle: 'How It Works',
    howItWorksSub: 'Fewer seconds watched = more stacked points earned',
    featuresTitle: 'Game Features',
    feature1Title: 'Full Movies on YouTube',
    feature1Desc: 'Authentic full-length films scrubbed into precise challenge clips.',
    feature2Title: 'Progressive Reveal',
    feature2Desc: 'Start with a 1-second glimpse. Unlock up to 10 seconds across 4 rounds.',
    feature3Title: 'Stacked Session Score',
    feature3Desc: 'Build your session score and streak continuously movie after movie!',
    ctaBannerTitle: 'Lights. Camera. Guess.',
    ctaBannerSub: 'Ready to test your cinematic knowledge across continuous full movies?',
    ctaBannerButton: 'Start Playing Free',
    
    allRightsReserved: 'All rights reserved.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    createdBy: 'Created by ozanggnr',
    
    victoryTitle: 'Brilliant Cinema Master!',
    defeatTitle: 'Movie Revealed',
    finalScore: 'Points Earned',
    playNextMovie: 'Next Movie',
  },
  tr: {
    brandName: 'CineRiddle',
    tagline: 'Filmin adını tahmin edebilir misin?',
    playNow: 'Hemen Oyna',
    howToPlay: 'Nasıl Oynanır',
    
    score: 'Puan',
    sessionScore: 'Oturum Puanı',
    roundScore: 'Tur Puanı',
    streak: 'Seri',
    round: 'Tur',
    roundOf: 'Tur {current} / {total}',
    secondsClip: '{seconds}sn klip',
    
    playingAtSpeed: '▶ {speed}× hızında oynatılıyor · tam film taranıyor',
    scrubbingClip: 'Film karesi taranıyor...',
    typeGuessBelow: '↓ Tahmininizi aşağıya yazın',
    watchClipFirst: 'Önce klibi izleyin…',
    fullMovieClip: 'Tam Film Klip',
    
    typeMoviePlaceholder: 'Film adı yazın…',
    submitGuess: 'Tahmini Gönder',
    skip: 'Filmi Pass Geç',
    nextMovie: 'Sonraki Film →',
    tryAgain: 'Tekrar Dene',
    
    correctTitle: '🎉 Doğru Tahmin!',
    wrongTitle: '❌ Yanlış tahmin! {round}. turu deneyin',
    movieWas: 'Film şuydu:',
    skippedMovieWas: 'Pas geçildi! Film şuydu:',
    gameCompleted: 'Oyun Tamamlandı',
    
    heroBadge: 'Şimdi Yayında',
    heroTitleLine1: 'Bu filmi',
    heroTitleLine2: 'tanıyabilir misin?',
    heroSubtitle: '1 saniyelik film kliplerini izle. Filmi tahmin et. Her turda daha fazlası açılır — ne kadar hızlı bulabilirsin?',
    heroCtaPlay: 'Ücretsiz Oyna',
    heroCtaHow: 'Nasıl Oynanır',
    statMovies: '100+ Film',
    statRounds: 'En Fazla 4 Tur',
    statFirstClip: '1sn İlk Klip',
    howItWorksTitle: 'Nasıl Çalışır?',
    howItWorksSub: 'Daha az saniye izle = daha yüksek puan biriktir',
    featuresTitle: 'Oyun Özellikleri',
    feature1Title: 'YouTube Tam Filmler',
    feature1Desc: 'Gerçek tam uzunluktaki filmlerden taranmış özel yarışma klipleri.',
    feature2Title: 'Kademeli Gösterim',
    feature2Desc: '1 saniyelik klip ile başla. 4 tur boyunca 10 saniyeye kadar izle.',
    feature3Title: 'Biriken Oturum Puanı',
    feature3Desc: 'Her doğru tahminde oturum puanını ve serini katlayarak ilerle!',
    ctaBannerTitle: 'Işıklar. Kamera. Tahmin Et.',
    ctaBannerSub: 'Sinema bilginizi test etmeye hazır mısınız?',
    ctaBannerButton: 'Oynamaya Başla',
    
    allRightsReserved: 'Tüm hakları saklıdır.',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfService: 'Kullanım Koşulları',
    createdBy: 'ozanggnr tarafından geliştirildi',
    
    victoryTitle: 'Tebrikler, Harika Tahmin!',
    defeatTitle: 'Film Açıklandı',
    finalScore: 'Kazanılan Puan',
    playNextMovie: 'Sonraki Film',
  },
  es: {
    brandName: 'CineRiddle',
    tagline: '¿Puedes adivinar la película?',
    playNow: 'Jugar Ahora',
    howToPlay: 'Cómo Jugar',
    
    score: 'Puntos',
    sessionScore: 'Puntuación Acumulada',
    roundScore: 'Puntos de Ronda',
    streak: 'Racha',
    round: 'Ronda',
    roundOf: 'Ronda {current} de {total}',
    secondsClip: 'clip de {seconds}s',
    
    playingAtSpeed: '▶ Reproduciendo a {speed}× · explorando película',
    scrubbingClip: 'Explorando fotogramas...',
    typeGuessBelow: '↓ Escribe tu respuesta abajo',
    watchClipFirst: 'Mira el clip primero…',
    fullMovieClip: 'Clip de Película Completa',
    
    typeMoviePlaceholder: 'Escribe el título de la película…',
    submitGuess: 'Enviar Respuesta',
    skip: 'Saltar Película',
    nextMovie: 'Siguiente Película →',
    tryAgain: 'Reintentar',
    
    correctTitle: '🎉 ¡Correcto!',
    wrongTitle: '❌ ¡Respuesta incorrecta! Intenta ronda {round}',
    movieWas: 'La película era',
    skippedMovieWas: '¡Saltada! La película era',
    gameCompleted: 'Juego Completado',
    
    heroBadge: 'En Reproducción',
    heroTitleLine1: '¿Reconoces esta',
    heroTitleLine2: 'película completa?',
    heroSubtitle: 'Mira clips de 1 segundo de películas completas. Adivina el título. Cada ronda revela más fotogramas.',
    heroCtaPlay: 'Jugar Gratis',
    heroCtaHow: 'Cómo Jugar',
    statMovies: '100+ Películas',
    statRounds: 'Máximo 4 Rondas',
    statFirstClip: 'Clip Inicial de 1s',
    howItWorksTitle: 'Cómo Funciona',
    howItWorksSub: 'Menos segundos vistos = más puntos acumulados',
    featuresTitle: 'Características del Juego',
    feature1Title: 'Películas Completas en YouTube',
    feature1Desc: 'Películas completas reales adaptadas a clips de desafío.',
    feature2Title: 'Revelación Progresiva',
    feature2Desc: 'Empieza con 1 segundo. Desbloquea hasta 10 segundos en 4 rondas.',
    feature3Title: 'Puntuación Acumulada',
    feature3Desc: '¡Acumula puntos y aumenta tu racha película tras película!',
    ctaBannerTitle: 'Luces. Cámara. Adivina.',
    ctaBannerSub: '¿Listo para poner a prueba tus conocimientos de cine?',
    ctaBannerButton: 'Empezar a Jugar Gratis',
    
    allRightsReserved: 'Todos los derechos reservados.',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    createdBy: 'Creado por ozanggnr',
    
    victoryTitle: '¡Excelente Maestro del Cine!',
    defeatTitle: 'Película Revelada',
    finalScore: 'Puntos Ganados',
    playNextMovie: 'Siguiente Película',
  },
}
