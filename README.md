# Gato — Estúdio 3D

Atividade de Processamento de Imagens e Computação Gráfica: uma cena Three.js com o modelo Cat.glb e três ações no esqueleto.

## Executar no VS Code

1. Instale o Node.js 22.12 ou superior (por exemplo, Node 24).
2. Clone o repositório.
3. Abra Terminal → Novo terminal, dentro dessa pasta.
4. Execute:

```bash
npm install
npm run dev
```

5. Abra o endereço exibido no terminal (normalmente http://127.0.0.1:5173).

Não abra o index.html diretamente por duplo clique: o carregamento dos módulos e do GLB precisa do servidor local.

## Controles

- **1 — Mexer o rabo:** onda entre os três ossos da cauda.
- **2 — Lamber a pata:** elevação da pata esquerda, aproximação da cabeça e movimento da boca. É uma simulação estilizada, sem língua adicional.
- **3 — Deitar:** flexão das quatro patas, redução da altura do corpo e respiração discreta. A pose permanece até trocar de ação.
- **0 — Voltar à pose inicial.**
- Mouse/toque: arrastar para orbitar; roda/pinça para aproximar.
- Seletor de cor: altera chão, paredes, fundo e neblina.
- Controle de velocidade: de 0,25× a 2×.
- Restaurar câmera: volta ao enquadramento inicial.

## Organização

```text

index.html
package.json
package-lock.json
vite.config.js
src/
  main.js         # Cena, câmera, iluminação, carregamento e interface
  animations.js   # Poses e animações dos ossos
  grounding.js    # Contato do modelo deformado com o chão
  style.css       # Aparência e adaptação para telas menores
public/
  source/Cat.glb
  textures/       # Três PNGs originais, preservados
```

O GLB já incorpora as texturas. Os PNGs são mantidos para preservar a organização recebida; não precisam ser carregados à parte.

## Como explicar a atividade

1. `Scene` reúne objetos e iluminação. `PerspectiveCamera` define a perspectiva e `WebGLRenderer` desenha a cena.
2. O chão e três paredes usam `PlaneGeometry` e `MeshStandardMaterial`. Luz hemisférica e três luzes direcionais formam o estúdio; a luz principal projeta sombra.
3. `GLTFLoader` importa o gato. `Box3` mede o tamanho, centraliza o modelo e define altura aproximada de 1,05 unidade.
4. O arquivo original tem 20 ossos e **zero animações embutidas**. `animations.js` cria as ações proceduralmente em tempo de execução. Não há clips novos gravados no GLB.
5. Cada osso conserva seu quaternion de repouso. Uma rotação adicional define a pose; `slerp` interpola da pose atual à nova em cerca de 0,7 segundo na velocidade normal.
6. Senoides produzem a oscilação da cauda, os ciclos da lambida e a respiração. O tempo de cada quadro mantém a velocidade independente do FPS.
7. Os vértices deformados são verificados para manter o gato acima do piso. Essa solução é adequada para este modelo pequeno; modelos muito maiores podem exigir uma solução de contato mais econômica.
8. `OrbitControls` permite observar o resultado de diferentes ângulos.

## Ajustes

- Cor inicial: `#adc4c0` em `main.js`, `style.css` e no seletor de `index.html`.
- Enquadramento: função `restoreCamera()` em `main.js`.
- Intensidade das poses: valores de `pose` em `animations.js`, em radianos e nos eixos locais dos ossos.
- Para acrescentar modelos de outros integrantes, cada modelo deve ter seu próprio controlador. Os nomes de ossos deste arquivo são específicos do Cat.glb enviado.

## Gerar versão de produção

```bash
npm run build
npm run preview
```

A pasta `dist/` é gerada pelo build. O aviso de tamanho do bundle do Three.js não impede a compilação.

## Validação realizada

- Instalação de dependências e build de produção concluídos.
- Carregamento da geometria e do esqueleto em Node, sem texturas no teste.
- Inspeção de projeções da malha deformada nas quatro poses.
- Verificação de coordenadas finitas e contato com o piso.
- Não foi possível executar a validação interativa WebGL no navegador deste ambiente. Confirme as texturas, sombras e botões ao executar localmente.

## Origem e requisito da disciplina

O modelo e as três texturas foram fornecidos pelo aluno. Antes de entregar, registre aqui o link exato do modelo no Sketchfab, o autor e a licença disponíveis na página original. Esses dados não foram fornecidos; não é correto inventá-los.

Referência de estrutura fornecida: https://github.com/slocksert/3d-cat. Esta implementação cria suas próprias poses nos ossos do modelo enviado.

As três ações são implementadas no código, não importadas como clips prontos. Se o professor exigir que as animações já estejam no GLB, será necessário exportá-las usando uma ferramenta como Blender ou escolher um modelo que contenha os clips.
