import{defineConfig}from'vite';
// BASE_PATH: map waaronder de app draait (GitHub Pages: /kijksport/). PREVIEW=1 zet lettertypen inline voor een preview als één bestand.
export default defineConfig({base:process.env.BASE_PATH||'/',server:{host:'0.0.0.0',allowedHosts:['terminal.local']},build:{assetsInlineLimit:process.env.PREVIEW?1e8:4096}});
