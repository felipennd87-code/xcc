Crie a landing page pessoal (nível de site de R$ 10 mil, estrutura inspirada em ikaro-moura.vercel.app mas com identidade própria, ver referencias/LEIA.md) da engenheira civil Karina Benigno (Benigno Engenharia, Vitória da Conquista, BA). Público: quem vai receber imóvel na planta, comprar imóvel usado ou tem problema na construção (trinca, infiltração). Objetivo único: a pessoa chamar a Karina no WhatsApp.

## 0. Antes de codar
Leia INFORMACOES.md (use só dados que estão lá) e referencias/LEIA.md. Olhe todas as fotos das pastas. Use as skills de .claude/skills: landing-page-guide-v2 (estrutura), design-taste-frontend e frontend-design (visual), copywriting (textos), emil-design-eng (animações), impeccable e web-design-guidelines (revisão final).

## 1. Identidade
- Visual escuro e premium como ref1 (Axis Haus): fundo quase preto, tipografia grande e fina, cards de vidro, botões brancos. Paleta de INFORMACOES.md (ajustar se a logo em logo/ tiver outras cores). Verde só no botão de WhatsApp.
- Títulos: "Archivo" 800 ou "Barlow Condensed" 700. Texto: "Inter". Rótulos: "JetBrains Mono" (ex.: "VISTORIA 02 / ENTREGA DE CHAVES").
- Motivo visual: check-list de vistoria, linhas de medição e marcações de trinca desenhadas em SVG.
- Logo: logo/logo-benigno-branca.png no fundo escuro e logo/logo-benigno-preta.png no fundo claro. Logo no hero e no rodapé. Recriar uma versão simples só dos prédios em SVG para o favicon.

## 2. Seções (nesta ordem)
1. Preloader curto (até 1 s) com uma linha de medição se desenhando.
2. Hero (estilo ref1 Axis Haus): vídeo 0-video/hero.mp4 em tela cheia (nível a laser em apartamento novo; poster 0-video/hero-poster.jpg) com overlay escuro. Palavra gigante "BENIGNO" em contorno atrás (estilo ref2 Kontra). À direita, como na ref1: dois cards de vidro com "5,0 no Google" e "26 avaliações" e, abaixo deles, um card maior com a foto 1-hero/karina-obra-capacete.jpg (tamanho médio, nunca esticada) e o texto "Karina Benigno, engenheira civil". No celular, os cards vão para baixo do título. Título: "Antes de receber as chaves, deixe uma engenheira olhar." Subtítulo: vistoria de imóvel e laudos técnicos em Vitória da Conquista. Botões: "Descobrir o que eu preciso" (quiz) e "Falar no WhatsApp".
3. Marquee: "VISTORIA DE ENTREGA • IMÓVEL USADO • LAUDO DE TRINCAS • INFILTRAÇÃO • VISTORIA CAUTELAR • ACOMPANHAMENTO DE OBRA •"
4. Seção da dor: "Defeito que ninguém vê hoje vira prejuízo amanhã." Comparação com divisor arrastável: "Sem vistoria" x "Com vistoria" (assina o termo com defeito escondido x defeitos listados e corrigidos pela construtora antes da entrega).
5. Serviços (lista exata em INFORMACOES.md): bloco grande "Vistorias e laudos" (recebimento de imóvel novo, cautelar, inspeção predial, laudos, avaliação de imóveis) e bloco "Projetos completos" (arquitetônico, estrutural, elétrico, hidrossanitário, combate a incêndio). Cards que expandem, com botão de WhatsApp com mensagem própria. Usar as fotos de 3-servicos/ e o render de 4-projetos/.
6. Como funciona (scroll com pin ao lado do vídeo 0-video/vistoria-detalhe.mp4: medidor de umidade e fissurômetro na parede; poster vistoria-detalhe-poster.jpg; vira lista no celular; cards numerados 01 a 04 no estilo ref1, o card ativo em branco): 1) Conversa e agendamento; 2) Vistoria no imóvel com check-list; 3) Laudo com fotos e apontamentos; 4) Acompanhamento das correções.
7. O que eu verifico: grade com ícones SVG (esquadro, nível, umidade, elétrica, hidráulica, revestimento, esquadrias). Cada item com 1 frase.
8. QUIZ "Descubra o que você precisa" (item 3).
9. Quem é a Karina: foto de 2-sobre/, texto curto em primeira pessoa. Pills: Olhar técnico, Laudo claro, Atendimento direto.
10. Avaliações: destaque "5,0 no Google, 26 avaliações" com botão para o perfil. NÃO inventar depoimentos; deixar <!-- COLAR AVALIAÇÕES REAIS DO GOOGLE --> com 3 cards vazios ocultos.
11. FAQ (acordeão): "Quando fazer a vistoria de entrega?", "A construtora é obrigada a corrigir?", "Quanto tempo leva?", "Vale a pena para imóvel usado?". Respostas gerais e corretas, sem prometer preço ou prazo; onde depender dela, "depende do imóvel, me chama que eu te explico".
12. CTA final "Vai receber as chaves? Fala comigo antes." + rodapé com WhatsApp e os dois Instagram.
13. Celular: barra fixa embaixo com "Fazer o quiz" e "WhatsApp" depois do hero.

## 3. Quiz
- Uma pergunta por vez, barra de progresso, botão voltar, botões grandes.
- 1) O que você precisa? (Vistoria de entrega de imóvel novo | Vistoria de imóvel usado | Laudo de trincas ou infiltração | Acompanhamento de obra | Outro)
- 2) Tipo do imóvel? (Apartamento | Casa | Comercial)
- 3) Quando? (Esta semana | Este mês | Ainda não sei)
- 4) Bairro ou cidade (texto)
- 5) Seu nome (texto)
- Tela final com resumo + botão "Enviar para a Karina no WhatsApp".
- Link: https://wa.me/5577988424244?text= + encodeURIComponent de:
  "Olá, Karina! Me chamo [nome]. Fiz o quiz no seu site.
  Preciso de: [1]
  Imóvel: [2]
  Quando: [3]
  Local: [4]
  Pode me orientar?"
- Validar campos. Sem backend. Navegável por teclado.

## 4. Animações
GSAP + ScrollTrigger + Lenis. Títulos revelados por linha, linhas de medição se desenhando, check-list marcando itens no scroll, botões magnéticos no desktop. Tudo desligado com prefers-reduced-motion.

## 5. Técnico
Mobile first, imagens WebP com lazy loading, meta tags, Open Graph com a foto da Karina, favicon, JSON-LD de ProfessionalService. Caminhos de arquivos relativos. Cada foto aparece uma vez só no site.

## 6. Sem cara de IA
- Proibido travessão (o caractere travessão, U+2014) em qualquer texto.
- Proibido emoji no layout.
- Proibidas frases clichê: "transformando sonhos em realidade", "excelência e qualidade", "soluções inovadoras", "sua melhor escolha".
- Nunca inventar número, depoimento, cliente ou prêmio.
- No fim, procurar travessões (U+2014) e emojis em todos os arquivos e confirmar que não sobrou nenhum.

## 7. Entrega
Sem screenshots, no máximo 2 revisões. Pronto para a Vercel. Commit e push.
