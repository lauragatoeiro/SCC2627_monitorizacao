# Swim Monitor — versão online

Esta versão usa **Supabase + PostgreSQL** em vez de `localStorage`. Assim, os dados ficam numa base de dados online e podem ser consultados a partir de vários computadores/telemóveis, desde que estejam autenticados na mesma aplicação.

## O que está incluído

- Atletas (nome e sexo)
- Registo diário: PSE AM, PSE PM, FC ao acordar e qualidade do sono
- Composição corporal: massa corporal, estatura e 7 pregas
- Cálculo automático da massa gorda pela fórmula definida no projeto:
  - `%MG = 10,566 + (0,12077 × Σ7 pregas) + (8,057 × y)`
  - `y = 0` masculino
  - `y = 1` feminino
- Testes físicos: CMJ (2 tentativas) e impulsão horizontal (2 tentativas)
- Dashboard individual com gráficos de todos os indicadores registados
- Login por email/palavra-passe
- Dados partilhados entre dispositivos através da mesma base de dados

## Configuração

### 1. Criar projeto Supabase

Cria um projeto em https://supabase.com/.

### 2. Criar as tabelas

No Supabase, abre **SQL Editor**, cria uma nova query e cola todo o conteúdo de `supabase.sql`. Executa a query.

O SQL cria as quatro tabelas e ativa Row Level Security (RLS), permitindo o acesso apenas a utilizadores autenticados.

### 3. Criar utilizadores

Em **Authentication > Users**, cria uma conta para cada treinador que deve ter acesso ao software.

A versão atual não tem botão público de registo. Isto é intencional: os dados incluem composição corporal e devem ficar limitados aos utilizadores autorizados.

### 4. Configurar a aplicação

Abre `config.js` e substitui:

```js
window.SUPABASE_URL = 'COLOCA_AQUI_A_PROJECT_URL';
window.SUPABASE_PUBLISHABLE_KEY = 'COLOCA_AQUI_A_PUBLISHABLE_KEY';
```

pela **Project URL** e pela **Publishable key** do teu projeto Supabase.

**Nunca uses a Secret key/service_role key no `config.js`.**

### 5. Publicar no GitHub Pages

Envia os ficheiros para o repositório e ativa o GitHub Pages. O software passa a usar a base de dados Supabase, independentemente do dispositivo onde seja aberto.

## Importante sobre os dados

Nesta versão os registos não ficam no navegador. Cada gravação é enviada para o Supabase. Por isso, o mesmo atleta e os mesmos registos aparecem nos diferentes dispositivos autenticados.

A aplicação não guarda a palavra-passe no código nem usa a Secret key do Supabase.
