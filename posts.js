/* =========================================================
   CAUSA — posts.js
   Sistema simples de artigos: lê articles.json e monta
   as páginas de categoria e de artigo individual.
   Pra publicar um texto novo, basta acrescentar um objeto
   em articles.json — nenhuma página precisa ser tocada.
   ========================================================= */

const CATEGORIAS = {
  araxa: {
    nome: 'Araxá & arredores',
    cor: 'coral',
    desc: 'Trilhas, cachoeiras, achados de fim de semana e tudo que vale o combustível pra sair da cidade.'
  },
  reflexoes: {
    nome: 'Reflexões',
    cor: 'dark',
    desc: 'Os textos mais abertos e pessoais. Devaneio com começo, sem meio e sem compromisso com o fim.'
  },
  cultura: {
    nome: 'Cultura',
    cor: 'amber',
    desc: 'Filmes, música, livros — a veia do jornal do universitário que nunca foi embora.'
  },
  fontes: {
    nome: 'Fontes & achados',
    cor: 'neon',
    desc: 'Curadoria de links, dados e referências que valem seu tempo de leitura.'
  },
  esportes: {
    nome: 'Esportes',
    cor: 'verde',
    desc: 'Correr, pedalar, caminhar — ou qualquer outra coisa que faça seu corpo (e sua cabeça) feliz.'
  }
};

async function carregarDados() {
  const res = await fetch('articles.json');
  if (!res.ok) throw new Error('Não consegui carregar articles.json');
  const dados = await res.json();
  return Array.isArray(dados)
    ? { artigos: dados, rascunhos: [] }
    : { artigos: dados.artigos || [], rascunhos: dados.rascunhos || [] };
}

async function carregarArtigos() {
  const { artigos } = await carregarDados();
  return artigos;
}

function formatarData(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Página de categoria (pilar) ---------- */
function renderizarListaCategoria(categoriaSlug) {
  const container = document.getElementById('listaPosts');
  if (!container) return;

  carregarDados()
    .then(({ artigos, rascunhos }) => {
      const publicados = artigos
        .filter((a) => a.categoria === categoriaSlug)
        .sort((a, b) => new Date(b.data) - new Date(a.data));

      const emBreve = rascunhos.filter((a) => a.categoria === categoriaSlug);

      if (publicados.length === 0 && emBreve.length === 0) {
        container.innerHTML = '<p class="posts__vazio">Ainda não tem nada por aqui. Em breve.</p>';
        return;
      }

      const cardsPublicados = publicados
        .map(
          (a) => `
        <a href="artigo.html?slug=${encodeURIComponent(a.slug)}" class="post-card" data-cursor="ler">
          <span class="post-card__data">${formatarData(a.data)}</span>
          <h3 class="post-card__titulo">${escapeHtml(a.titulo)}</h3>
          <p class="post-card__resumo">${escapeHtml(a.resumo)}</p>
          <span class="post-card__link">ler →</span>
        </a>`
        )
        .join('');

      const cardsEmBreve = emBreve
        .map(
          (a) => `
        <div class="post-card post-card--em-breve">
          <span class="post-card__em-breve">em breve</span>
          <h3 class="post-card__titulo">${escapeHtml(a.titulo)}</h3>
          <p class="post-card__resumo">Esse texto ainda está sendo escrito.</p>
        </div>`
        )
        .join('');

      container.innerHTML = cardsPublicados + cardsEmBreve;
    })
    .catch(() => {
      container.innerHTML = '<p class="posts__vazio">Não consegui carregar os artigos agora.</p>';
    });
}

/* ---------- Página de artigo individual ---------- */
function renderizarArtigo() {
  const container = document.getElementById('artigoConteudo');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  carregarArtigos()
    .then((artigos) => {
      const artigo = artigos.find((a) => a.slug === slug);

      if (!artigo) {
        container.innerHTML = '<p class="posts__vazio">Artigo não encontrado. <a href="index.html">Voltar pro início</a>.</p>';
        return;
      }

      const cat = CATEGORIAS[artigo.categoria] || { nome: 'causa.', cor: 'dark' };
      document.title = `${artigo.titulo} — causa.`;

      const corpo = artigo.conteudo.map((p) => `<p>${escapeHtml(p)}</p>`).join('');

      container.innerHTML = `
        <span class="tag tag--${cat.cor}">${cat.nome}</span>
        <h1 class="artigo__titulo">${escapeHtml(artigo.titulo)}</h1>
        <p class="artigo__meta">${formatarData(artigo.data)}${artigo.autor ? ' · ' + escapeHtml(artigo.autor) : ''}</p>
        <div class="artigo__corpo">${corpo}</div>
        <a href="pilar-${artigo.categoria}.html" class="artigo__voltar" data-cursor="voltar">← voltar pra ${cat.nome.toLowerCase()}</a>
      `;
    })
    .catch(() => {
      container.innerHTML = '<p class="posts__vazio">Não consegui carregar esse artigo agora.</p>';
    });
}
