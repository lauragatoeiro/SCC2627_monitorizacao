# Swim Monitor — versão simples

Aplicação estática para GitHub Pages, sem servidor e sem base de dados externa.

## O que regista
- Atletas e sexo.
- Registo diário por atleta e data: PSE AM, PSE PM, frequência cardíaca ao acordar e qualidade do sono.
- Composição corporal: massa corporal, estatura e 7 pregas subcutâneas.
- Massa gorda automática pela fórmula indicada pelo utilizador:
  `10.566 + (0.12077 × Σ7 pregas) + (8.057 × y)`
  nesta implementação, com `y=0` para masculino e `y=1` para feminino. O termo de raça da equação original de Evans (2005) não é usado porque a aplicação não recolhe essa variável.
- Testes físicos: CMJ (2 tentativas) e impulsão horizontal (2 tentativas), com data e atleta.
- Dashboard individual com gráficos de todos os indicadores registados.

## Dados
Os dados são guardados no `localStorage` do navegador. Alterar os ficheiros do repositório não apaga, por si só, os dados guardados no navegador. No entanto, limpar os dados do site, mudar de navegador/dispositivo ou alterar a chave/estrutura de armazenamento pode fazer com que deixem de aparecer. Para esta versão a chave é `swim-monitor-simple-v1`.

## Publicar no GitHub Pages
1. Criar um repositório.
2. Colocar `index.html`, `styles.css`, `app.js`, `README.md` e `.nojekyll` na raiz.
3. GitHub → Settings → Pages → Deploy from a branch → selecionar `main` e `/root`.

A aplicação usa Chart.js através de CDN; para os gráficos, o dispositivo precisa de acesso à internet.
