export type ModuleId = 'inicio' | 'matematicas' | 'proyectos' | 'estados' | 'estadistica' | 'costos' | 'proyecciones'
export type Theme = 'light' | 'dark'
export interface FinModule { id: Exclude<ModuleId, 'inicio'>; title: string; shortTitle: string; description: string; icon: string; color: string; learningItems: string[]; practiceText: string; analysisText: string }
