export interface FontOption {
  name: string;
  cssValue: string;
  googleName?: string;
  category: 'Serif' | 'Sans-Serif' | 'Monospace';
}

export const FONT_OPTIONS: FontOption[] = [
  // --- SERIF FONTS ---
  { name: 'Cormorant Garamond', cssValue: "'Cormorant Garamond', serif", googleName: 'Cormorant+Garamond', category: 'Serif' },
  { name: 'EB Garamond', cssValue: "'EB Garamond', serif", googleName: 'EB+Garamond', category: 'Serif' },
  { name: 'Playfair Display', cssValue: "'Playfair Display', serif", googleName: 'Playfair+Display', category: 'Serif' },
  { name: 'Lora', cssValue: "'Lora', serif", googleName: 'Lora', category: 'Serif' },
  { name: 'Merriweather', cssValue: "'Merriweather', serif", googleName: 'Merriweather', category: 'Serif' },
  { name: 'Baskervville', cssValue: "'Baskervville', serif", googleName: 'Baskervville', category: 'Serif' },
  { name: 'Libre Baskerville', cssValue: "'Libre Baskerville', serif", googleName: 'Libre+Baskerville', category: 'Serif' },
  { name: 'Crimson Text', cssValue: "'Crimson Text', serif", googleName: 'Crimson+Text', category: 'Serif' },
  { name: 'PT Serif', cssValue: "'PT Serif', serif", googleName: 'PT+Serif', category: 'Serif' },
  { name: 'Cardo', cssValue: "'Cardo', serif", googleName: 'Cardo', category: 'Serif' },
  { name: 'Spectral', cssValue: "'Spectral', serif", googleName: 'Spectral', category: 'Serif' },
  { name: 'Bitter', cssValue: "'Bitter', serif", googleName: 'Bitter', category: 'Serif' },
  { name: 'Domine', cssValue: "'Domine', serif", googleName: 'Domine', category: 'Serif' },
  { name: 'IBM Plex Serif', cssValue: "'IBM Plex Serif', serif", googleName: 'IBM+Plex+Serif', category: 'Serif' },
  { name: 'Noto Serif', cssValue: "'Noto Serif', serif", googleName: 'Noto+Serif', category: 'Serif' },
  { name: 'Spectral', cssValue: "'Spectral', serif", googleName: 'Spectral', category: 'Serif' },
  { name: 'Volkhov', cssValue: "'Volkhov', serif", googleName: 'Volkhov', category: 'Serif' },
  { name: 'Alegreya', cssValue: "'Alegreya', serif", googleName: 'Alegreya', category: 'Serif' },
  { name: 'Georgia (Sistema)', cssValue: "Georgia, serif", category: 'Serif' },
  { name: 'Times New Roman (Sistema)', cssValue: "'Times New Roman', Times, serif", category: 'Serif' },

  // --- SANS-SERIF FONTS ---
  { name: 'Inter', cssValue: "'Inter', sans-serif", googleName: 'Inter', category: 'Sans-Serif' },
  { name: 'Outfit', cssValue: "'Outfit', sans-serif", googleName: 'Outfit', category: 'Sans-Serif' },
  { name: 'Roboto', cssValue: "'Roboto', sans-serif", googleName: 'Roboto', category: 'Sans-Serif' },
  { name: 'Open Sans', cssValue: "'Open Sans', sans-serif", googleName: 'Open+Sans', category: 'Sans-Serif' },
  { name: 'Lato', cssValue: "'Lato', sans-serif", googleName: 'Lato', category: 'Sans-Serif' },
  { name: 'Montserrat', cssValue: "'Montserrat', sans-serif", googleName: 'Montserrat', category: 'Sans-Serif' },
  { name: 'Poppins', cssValue: "'Poppins', sans-serif", googleName: 'Poppins', category: 'Sans-Serif' },
  { name: 'Raleway', cssValue: "'Raleway', sans-serif", googleName: 'Raleway', category: 'Sans-Serif' },
  { name: 'Nunito', cssValue: "'Nunito', sans-serif", googleName: 'Nunito', category: 'Sans-Serif' },
  { name: 'Source Sans 3', cssValue: "'Source Sans 3', sans-serif", googleName: 'Source+Sans+3', category: 'Sans-Serif' },
  { name: 'Ubuntu', cssValue: "'Ubuntu', sans-serif", googleName: 'Ubuntu', category: 'Sans-Serif' },
  { name: 'Fira Sans', cssValue: "'Fira Sans', sans-serif", googleName: 'Fira+Sans', category: 'Sans-Serif' },
  { name: 'Work Sans', cssValue: "'Work Sans', sans-serif", googleName: 'Work+Sans', category: 'Sans-Serif' },
  { name: 'DM Sans', cssValue: "'DM Sans', sans-serif", googleName: 'DM+Sans', category: 'Sans-Serif' },
  { name: 'Plus Jakarta Sans', cssValue: "'Plus Jakarta Sans', sans-serif", googleName: 'Plus+Jakarta+Sans', category: 'Sans-Serif' },
  { name: 'Manrope', cssValue: "'Manrope', sans-serif", googleName: 'Manrope', category: 'Sans-Serif' },
  { name: 'Urbanist', cssValue: "'Urbanist', sans-serif", googleName: 'Urbanist', category: 'Sans-Serif' },
  { name: 'Quicksand', cssValue: "'Quicksand', sans-serif", googleName: 'Quicksand', category: 'Sans-Serif' },
  { name: 'Josefin Sans', cssValue: "'Josefin Sans', sans-serif", googleName: 'Josefin+Sans', category: 'Sans-Serif' },
  { name: 'Mulish', cssValue: "'Mulish', sans-serif", googleName: 'Mulish', category: 'Sans-Serif' },
  { name: 'Kanit', cssValue: "'Kanit', sans-serif", googleName: 'Kanit', category: 'Sans-Serif' },
  { name: 'Heebo', cssValue: "'Heebo', sans-serif", googleName: 'Heebo', category: 'Sans-Serif' },
  { name: 'Alegreya Sans', cssValue: "'Alegreya Sans', sans-serif", googleName: 'Alegreya+Sans', category: 'Sans-Serif' },
  { name: 'IBM Plex Sans', cssValue: "'IBM Plex Sans', sans-serif", googleName: 'IBM+Plex+Sans', category: 'Sans-Serif' },
  { name: 'Noto Sans', cssValue: "'Noto Sans', sans-serif", googleName: 'Noto+Sans', category: 'Sans-Serif' },
  { name: 'Arial (Sistema)', cssValue: "Arial, Helvetica, sans-serif", category: 'Sans-Serif' },

  // --- MONOSPACE FONTS ---
  { name: 'Fira Code', cssValue: "'Fira Code', monospace", googleName: 'Fira+Code', category: 'Monospace' },
  { name: 'Inconsolata', cssValue: "'Inconsolata', monospace", googleName: 'Inconsolata', category: 'Monospace' },
  { name: 'Source Code Pro', cssValue: "'Source Code Pro', monospace", googleName: 'Source+Code+Pro', category: 'Monospace' },
  { name: 'IBM Plex Mono', cssValue: "'IBM Plex Mono', monospace", googleName: 'IBM+Plex+Mono', category: 'Monospace' }
];
