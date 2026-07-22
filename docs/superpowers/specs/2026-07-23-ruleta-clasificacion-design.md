# Especificación de Diseño: Integración de Ruleta de Morosos con Clasificación de Liga

**Fecha:** 2026-07-23  
**Proyecto:** CastigosFantasy (`c:\Users\Carlos Rubio\Desktop\castigosfantasy`)  
**Módulo:** `src/views/roulette.js` & `src/utils/biwenger-sync-modal.js`

---

## 1. Propósito y Objetivo

Conectar la **Ruleta de Morosos** de CastigosFantasy directamente con la tabla de clasificación (*standings*) y jornadas sincronizadas de la liga activa (Biwenger / Comunio / Liga Local). 

La Ruleta identificará y seleccionará automáticamente al **Farolillo Rojo** (último clasificado de la jornada o de la general) como el **"Moroso en Capilla"** por defecto, permitiendo realizar la tirada y registrar el castigo asignado de forma inmediata en la base de datos de Supabase.

---

## 2. Cambios y Flujo de Usuario

### 2.1 Carga de Clasificación y Selección del Moroso
1. Al renderizar la pantalla de la Ruleta (`roulette.js`), si el usuario está en una liga conectada:
   - Se obtienen los miembros de la liga (`league_members`) y los registros/puntuaciones de la última jornada (`matchday_records` / `league_standings`).
   - Se determina el mánager con peor puntuación/posición de la jornada o clasificación.
2. Si existe un registro pendiente (`pendingRecord` / `CF_PENDING_RECORD_ID`), se mantiene preseleccionado.
3. Si no hay registro pendiente activo, el selector **"Moroso en Capilla"** preselecciona automáticamente al **Farolillo Rojo**.

### 2.2 Componente UI: Tarjeta "Moroso en Capilla" y Modo Tirada
Ubicado encima o al lado del tablero de la Ruleta:
- Muestra la foto/avatar y el apodo del moroso actual.
- Incluye una etiqueta/badge indicativo: `Farolillo Rojo - Jornada X`, `Tirada Pendiente` o `Tirada Libre (Sin registro)`.
- **Selector de Destinatario / Modo**:
  1. **Moroso automático / Mánager de la liga**: Preselecciona al Farolillo Rojo o permite elegir cualquier otro mánager de la liga para asignarle el castigo de la jornada en Supabase.
  2. **Opción "Tirada Casual / Solo por diversión"**: Permite realizar un giro libre sin asignar el resultado a ningún mánager ni registrar deuda en la base de datos de la liga.

### 2.3 Guardado y Registro de la Tirada
- Al finalizar la animación del giro de la ruleta:
  - Se muestra el modal/banner del castigo resultante.
  - Se actualiza o inserta el registro en `matchday_records` vinculando `league_id`, `loser_profile_id` / `loser_roster_id`, `punishment_id`, `matchday_number` y fecha.
  - Se añade la tirada al historial visible de la liga (`history`).

---

## 3. Arquitectura y Archivos Involucrados

- **`src/views/roulette.js`**:
  - Ampliación de `loadData()` para consultar la clasificación actual/última jornada si no hay `pendingRecord`.
  - Inserción de la tarjeta UI "Moroso en Capilla" en `renderView()`.
  - Manejo de evento `onSpinEnd` para persistir el resultado asignado al moroso seleccionado.
- **`src/supabase.js`**:
  - Consultas a `league_members`, `profiles`, y `matchday_records`.

---

## 4. Criterios de Aceptación y Verificación

1. En modo Liga Conectada, la Ruleta muestra el nombre del último clasificado (Farolillo Rojo) por defecto en la sección "Moroso en Capilla".
2. El organizador o mánager puede cambiar el moroso seleccionado mediante el desplegable antes de girar la ruleta.
3. Al girar la ruleta y obtener un castigo, el registro se guarda correctamente en Supabase y aparece en el historial reciente de tiradas.
4. En Modo Demo/Local, la ruleta mantiene su funcionamiento independiente sin requerir datos de Supabase.
