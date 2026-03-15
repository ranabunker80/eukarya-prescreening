# Eukarya Prescreening — Convenciones y Contexto

## Stack
- **Framework**: Next.js 16 + React 19 + TypeScript (App Router)
- **DB**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email self-registration para @eukarya.mx)
- **UI**: Tailwind CSS 4 + PostCSS
- **Hosting**: Vercel
- **GitHub**: ranabunker80/eukarya-prescreening

## Idioma
- **UI**: ESPAÑOL
- **Código**: INGLÉS

## Commands
```bash
npm run dev    # Desarrollo
npm run build  # Build producción
npm run lint   # ESLint
```

---

## Estado del Proyecto y Memoria Compartida

### Qué es
Sistema de prescreening de ensayos clínicos para Eukarya PharmaSite. Pacientes evalúan su elegibilidad online para protocolos activos.

### Protocolos configurados
1. **Sanofi EFC18419** (`sanofi-efc18419`) — Rinosinusitis crónica con pólipos nasales (CRSwNP). PI: Dr. Lino Guevara. Edad: 18+
2. **Lilly KGBS** (`lilly-kgbs`) — Rinitis alérgica perenne. PI: Dra. Dora Valdes. Edad: 12+

### Flujo
1. Paciente entra a página del protocolo → llena formulario de elegibilidad
2. Sistema evalúa automáticamente (POSITIVO / NEGATIVO / REVISIÓN)
3. Staff ve resultados en dashboard interno

### Estado: Funcional y en producción
- Últimos commits (9 feb): compliance updates (remover label de sponsor de homepage)
- Dashboard interno con gestión de pacientes y protocolos
- API de export de datos

### Última sesión: 2026-02-09
