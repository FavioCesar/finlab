# FinLab

Plataforma educativa de análisis financiero para estudiantes de Ingeniería Financiera. Esta primera fase contiene el panel principal, navegación entre seis módulos, las áreas **Aprender**, **Practicar** y **Analizar**, y la base para incorporar calculadoras.

## Tecnologías

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- `localStorage` para guardar el tema elegido

## Instalación y ejecución

Requiere Node.js 20+ y pnpm (o npm).

```bash
pnpm install
pnpm dev
```

Abre la dirección mostrada por Vite, normalmente `http://localhost:5173`.

Para compilar producción:

```bash
pnpm build
pnpm preview
```

## Estructura

```text
src/
  components/     Componentes de interfaz y vistas reutilizables
  data/           Datos y contenido base de módulos
  App.tsx         Navegación, composición y tema
  types.ts        Tipos compartidos
  index.css       Estilos globales y Tailwind
```

La sección **Analizar** de cada módulo está preparada para sumar calculadoras, validaciones, gráficos e interpretaciones en la siguiente fase.
